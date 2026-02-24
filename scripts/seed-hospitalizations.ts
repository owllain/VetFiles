import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config();

const url = process.env.VITE_TURSO_DATABASE_URL;
const authToken = process.env.VITE_TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Credentials missing");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function seed() {
  try {
    const raw = readFileSync(join(process.cwd(), "server", "data", "hospitalization_data.json"), "utf-8");
    const data = JSON.parse(raw);

    console.log("🚀 Iniciando carga de Internamientos...");
    
    // Crear tablas
    await client.execute(`
      CREATE TABLE IF NOT EXISTS hospitalizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        entry_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        reason TEXT NOT NULL,
        diagnosis_preliminary TEXT,
        alert_message TEXT,
        alert_time TEXT,
        status TEXT CHECK(status IN ('Estable', 'Crítico', 'Observación', 'Alta')) DEFAULT 'Observación',
        treatment_plan TEXT,
        notes TEXT,
        weight_entry REAL,
        discharge_date DATETIME,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      )
    `);

    await client.execute("DELETE FROM hospitalizations");

    const batch = data.map((h: any) => ({
      sql: `INSERT INTO hospitalizations (id, patient_id, doctor_id, entry_date, reason, diagnosis_preliminary, alert_message, alert_time, status, treatment_plan, notes, weight_entry, discharge_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [h.id, h.patient_id, h.doctor_id, h.entry_date, h.reason, h.diagnosis_preliminary, h.alert_message, h.alert_time, h.status, h.treatment_plan, h.notes, h.weight_entry, h.discharge_date]
    }));

    await client.batch(batch);
    console.log("✅ Internamientos cargados con éxito.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

seed();
