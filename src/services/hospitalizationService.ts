import { turso } from "../lib/turso";

export interface Hospitalization {
  id: number;
  patient_id: number;
  doctor_id: number;
  entry_date: string;
  reason: string;
  diagnosis_preliminary: string;
  alert_message?: string;
  alert_time?: string;
  status: 'Estable' | 'Crítico' | 'Observación' | 'Alta';
  treatment_plan?: string;
  notes?: string;
  weight_entry?: number;
  discharge_date?: string;
  // Joins
  patient_name?: string;
  doctor_name?: string;
}

export interface HospitalizationCheck {
  id: number;
  hospitalization_id: number;
  check_time: string;
  temperature?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  observations?: string;
}

export const hospitalizationService = {
  async init() {
    await turso.execute(`
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
    
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS hospitalization_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospitalization_id INTEGER NOT NULL,
        check_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        temperature REAL,
        heart_rate INTEGER,
        respiratory_rate INTEGER,
        observations TEXT,
        FOREIGN KEY (hospitalization_id) REFERENCES hospitalizations(id)
      )
    `);
  },

  async getAll(): Promise<Hospitalization[]> {
    const rs = await turso.execute(`
      SELECT h.*, p.name as patient_name, u.full_name as doctor_name
      FROM hospitalizations h
      JOIN patients p ON h.patient_id = p.id
      JOIN users u ON h.doctor_id = u.id
      ORDER BY h.id DESC
    `);
    
    return rs.rows.map(row => ({
      id: row.id as number,
      patient_id: row.patient_id as number,
      doctor_id: row.doctor_id as number,
      entry_date: row.entry_date as string,
      reason: row.reason as string,
      diagnosis_preliminary: row.diagnosis_preliminary as string,
      alert_message: row.alert_message as string,
      alert_time: row.alert_time as string,
      status: row.status as any,
      treatment_plan: row.treatment_plan as string,
      notes: row.notes as string,
      weight_entry: row.weight_entry as number,
      discharge_date: row.discharge_date as string,
      patient_name: row.patient_name as string,
      doctor_name: row.doctor_name as string,
    }));
  },

  async create(h: Omit<Hospitalization, 'id' | 'patient_name' | 'doctor_name'>) {
    await turso.execute({
      sql: `INSERT INTO hospitalizations (
        patient_id, doctor_id, entry_date, reason, diagnosis_preliminary, 
        alert_message, alert_time, status, treatment_plan, notes, weight_entry
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        h.patient_id, h.doctor_id, h.entry_date || new Date().toISOString(), 
        h.reason, h.diagnosis_preliminary, h.alert_message, h.alert_time, 
        h.status, h.treatment_plan, h.notes, h.weight_entry
      ]
    });
  },

  async update(id: number, h: Partial<Hospitalization>) {
    const fields = Object.keys(h).filter(k => !['id', 'patient_name', 'doctor_name'].includes(k));
    if (fields.length === 0) return;
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const args = fields.map(f => (h as any)[f]);
    await turso.execute({
      sql: `UPDATE hospitalizations SET ${setClause} WHERE id = ?`,
      args: [...args, id]
    });
  },

  async delete(id: number) {
    await turso.execute({
      sql: "DELETE FROM hospitalizations WHERE id = ?",
      args: [id]
    });
  }
};
