import { turso } from "../lib/turso";

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  visit_date: number;
  observations: string;
  diagnosis: string;
  treatment: string;
  file_url: string;
  // Joins
  patient_name?: string;
  doctor_name?: string;
}

export const medicalRecordService = {
  async getAll(): Promise<MedicalRecord[]> {
    const rs = await turso.execute(`
      SELECT mr.*, p.name as patient_name, u.full_name as doctor_name
      FROM medical_records mr
      LEFT JOIN patients p ON mr.patient_id = p.id
      LEFT JOIN users u ON mr.doctor_id = u.id
      ORDER BY mr.visit_date DESC
    `);
    return rs.rows.map((row) => ({
      id: row.id as number,
      patient_id: row.patient_id as number,
      doctor_id: row.doctor_id as number,
      visit_date: row.visit_date as number,
      observations: row.observations as string,
      diagnosis: row.diagnosis as string,
      treatment: row.treatment as string,
      file_url: row.file_url as string,
      patient_name: row.patient_name as string,
      doctor_name: row.doctor_name as string,
    }));
  },

  async create(record: Omit<MedicalRecord, "id" | "patient_name" | "doctor_name">) {
    await turso.execute({
      sql: "INSERT INTO medical_records (patient_id, doctor_id, visit_date, observations, diagnosis, treatment, file_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [
        record.patient_id,
        record.doctor_id,
        record.visit_date,
        record.observations,
        record.diagnosis,
        record.treatment,
        record.file_url,
      ],
    });
  },

  async delete(id: number) {
    await turso.execute({
      sql: "DELETE FROM medical_records WHERE id = ?",
      args: [id],
    });
  }
};
