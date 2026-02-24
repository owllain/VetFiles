import { turso } from "../lib/turso";

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  assistant_id?: number;
  type: 'Consulta' | 'Vacuna' | 'Cirugía' | 'Examen';
  start_time: string; // ISO String
  duration_minutes: number;
  status: 'Programada' | 'Completada' | 'Cancelada';
  // Joins
  patient_name?: string;
  doctor_name?: string;
  assistant_name?: string;
  owner_name?: string;
}

export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    const rs = await turso.execute(`
      SELECT 
        a.*, 
        p.name as patient_name, 
        o.full_name as owner_name,
        u1.full_name as doctor_name, 
        u2.full_name as assistant_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN owners o ON p.owner_id = o.id
      JOIN users u1 ON a.doctor_id = u1.id
      LEFT JOIN users u2 ON a.assistant_id = u2.id
      ORDER BY a.start_time ASC
    `);
    
    return rs.rows.map((row) => ({
      id: row.id as number,
      patient_id: row.patient_id as number,
      doctor_id: row.doctor_id as number,
      assistant_id: row.assistant_id as number || undefined,
      type: row.type as any,
      start_time: row.start_time as string,
      duration_minutes: row.duration_minutes as number,
      status: row.status as any,
      patient_name: row.patient_name as string,
      doctor_name: row.doctor_name as string,
      assistant_name: row.assistant_name as string,
      owner_name: row.owner_name as string,
    }));
  },

  async create(app: Omit<Appointment, "id" | "status" | "patient_name" | "doctor_name" | "assistant_name" | "owner_name">) {
    await turso.execute({
      sql: `INSERT INTO appointments (patient_id, doctor_id, assistant_id, type, start_time, duration_minutes, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'Programada')`,
      args: [
        app.patient_id,
        app.doctor_id,
        app.assistant_id || null,
        app.type,
        app.start_time,
        app.duration_minutes
      ],
    });
  },

  async update(id: number, app: Partial<Appointment>) {
    const fields = Object.keys(app).filter(k => 
        !['id', 'patient_name', 'doctor_name', 'assistant_name', 'owner_name'].includes(k)
    );
    if (fields.length === 0) return;
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const args = fields.map(f => (app as any)[f]);
    
    await turso.execute({
      sql: `UPDATE appointments SET ${setClause} WHERE id = ?`,
      args: [...args, id],
    });
  },

  async delete(id: number) {
    await turso.execute({
      sql: "DELETE FROM appointments WHERE id = ?",
      args: [id],
    });
  }
};
