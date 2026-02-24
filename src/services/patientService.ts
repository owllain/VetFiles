import { turso } from "../lib/turso";

export interface Patient {
  id: number;
  owner_id: number;
  name: string;
  species: string;
  breed: string;
  age_months: number;
  weight_kg: number;
  // Extra field for UI join
  owner_name?: string;
}

export const patientService = {
  async getAll(): Promise<Patient[]> {
    const rs = await turso.execute(`
      SELECT p.*, o.full_name as owner_name 
      FROM patients p 
      LEFT JOIN owners o ON p.owner_id = o.id 
      ORDER BY p.id DESC
    `);
    return rs.rows.map((row) => ({
      id: row.id as number,
      owner_id: row.owner_id as number,
      name: row.name as string,
      species: row.species as string,
      breed: row.breed as string,
      age_months: row.age_months as number,
      weight_kg: row.weight_kg as number,
      owner_name: row.owner_name as string,
    }));
  },

  async create(patient: Omit<Patient, "id" | "owner_name">) {
    await turso.execute({
      sql: "INSERT INTO patients (owner_id, name, species, breed, age_months, weight_kg) VALUES (?, ?, ?, ?, ?, ?)",
      args: [
        patient.owner_id,
        patient.name,
        patient.species,
        patient.breed,
        patient.age_months,
        patient.weight_kg,
      ],
    });
  },

  async update(id: number, patient: Partial<Patient>) {
    const fields = Object.keys(patient).filter(k => k !== 'id' && k !== 'owner_name');
    if (fields.length === 0) return;
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const args = fields.map(f => (patient as any)[f]);
    await turso.execute({
      sql: `UPDATE patients SET ${setClause} WHERE id = ?`,
      args: [...args, id],
    });
  },

  async delete(id: number) {
    await turso.execute({
      sql: "DELETE FROM patients WHERE id = ?",
      args: [id],
    });
  },
};
