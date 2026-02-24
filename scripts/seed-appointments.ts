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

async function seedAppointmentsAndUsers() {
  try {
    console.log("🚀 Iniciando carga de Usuarios y Citas en Turso...");

    // Leer el archivo JSON
    const dataPath = join(process.cwd(), "server", "data", "test_data_appointments.json");
    const rawData = readFileSync(dataPath, "utf-8");
    const data = JSON.parse(rawData);

    // 1. Limpiar tablas existentes para evitar conflictos de IDs
    console.log("🧹 Limpiando tablas de citas y usuarios...");
    await client.execute("DELETE FROM appointments");
    await client.execute("DELETE FROM users");
    
    try {
        await client.execute("DELETE FROM sqlite_sequence WHERE name IN ('users', 'appointments')");
    } catch (e) {}

    // 2. Insertar Usuarios (Doctores y Asistentes)
    console.log(`👥 Insertando ${data.users.length} usuarios...`);
    const userQueries = data.users.map((u: any) => ({
      sql: "INSERT INTO users (id, cedula, full_name, email, phone, role, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [u.id, u.cedula, u.full_name, u.email, u.phone, u.role, u.password_hash],
    }));

    await client.batch(userQueries);

    // 3. Insertar Citas (Appointments)
    console.log(`📅 Insertando ${data.appointments.length} citas...`);
    const appointmentQueries = data.appointments.map((a: any) => ({
      sql: "INSERT INTO appointments (id, patient_id, doctor_id, assistant_id, type, start_time, duration_minutes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [a.id, a.patient_id, a.doctor_id, a.assistant_id, a.type, a.start_time, a.duration_minutes, a.status],
    }));

    await client.batch(appointmentQueries);

    console.log("✅ Carga de datos de prueba (Agenda y Personal) completada con éxito.");
  } catch (error) {
    console.error("❌ Error durante la carga de datos:", error);
  } finally {
    process.exit(0);
  }
}

seedAppointmentsAndUsers();
