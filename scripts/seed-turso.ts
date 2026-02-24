import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const url = process.env.VITE_TURSO_DATABASE_URL;
const authToken = process.env.VITE_TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Error: VITE_TURSO_DATABASE_URL o VITE_TURSO_AUTH_TOKEN no encontrados en .env");
  process.exit(1);
}

const client = createClient({
  url: url,
  authToken: authToken,
});

async function seed() {
  try {
    console.log("🚀 Iniciando carga de datos en Turso...");

    // Leer el archivo JSON
    const dataPath = join(process.cwd(), "server", "data", "vet_data.json");
    const rawData = readFileSync(dataPath, "utf-8");
    const data = JSON.parse(rawData);

    // 1. Limpiar tablas existentes (Opcional, pero recomendado para pruebas limpias)
    console.log("🧹 Limpiando tablas...");
    await client.execute("DELETE FROM patients");
    await client.execute("DELETE FROM owners");
    
    // Resetear autoincrementales si es posible (en LibSQL/SQLite)
    try {
        await client.execute("DELETE FROM sqlite_sequence WHERE name IN ('owners', 'patients')");
    } catch (e) {
        // Ignorar si la tabla de secuencia no existe
    }

    // 2. Insertar Propietarios
    console.log(`👤 Insertando ${data.owners.length} propietarios...`);
    const ownerQueries = data.owners.map((o: any) => ({
      sql: "INSERT INTO owners (id, cedula, full_name, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)",
      args: [o.id, o.cedula, o.full_name, o.phone, o.email, o.address],
    }));

    // Ejecutar en lotes para mayor eficiencia
    for (let i = 0; i < ownerQueries.length; i += 20) {
      const batch = ownerQueries.slice(i, i + 20);
      await client.batch(batch);
    }

    // 3. Insertar Pacientes
    console.log(`🐾 Insertando ${data.patients.length} pacientes...`);
    const patientQueries = data.patients.map((p: any) => ({
      sql: "INSERT INTO patients (id, owner_id, name, species, breed, age_months, weight_kg) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [p.id, p.owner_id, p.name, p.species, p.breed, p.age_months, p.weight_kg],
    }));

    for (let i = 0; i < patientQueries.length; i += 20) {
      const batch = patientQueries.slice(i, i + 20);
      await client.batch(batch);
    }

    console.log("✅ Carga masiva completada con éxito.");
  } catch (error) {
    console.error("❌ Error durante la carga de datos:", error);
  } finally {
    process.exit(0);
  }
}

seed();
