import { turso } from "../lib/turso";

export interface Owner {
  id: number;
  cedula: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
}

export const ownerService = {
  async getAll(): Promise<Owner[]> {
    const rs = await turso.execute("SELECT * FROM owners ORDER BY full_name ASC");
    return rs.rows.map((row) => ({
      id: row.id as number,
      cedula: row.cedula as string,
      full_name: row.full_name as string,
      phone: row.phone as string,
      email: row.email as string,
      address: row.address as string,
    }));
  },

  async create(owner: Omit<Owner, "id">) {
    await turso.execute({
      sql: "INSERT INTO owners (cedula, full_name, phone, email, address) VALUES (?, ?, ?, ?, ?)",
      args: [owner.cedula, owner.full_name, owner.phone, owner.email, owner.address],
    });
  },

  async update(id: number, owner: Partial<Owner>) {
    const fields = Object.keys(owner).filter(k => k !== 'id');
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const args = fields.map(f => (owner as any)[f]);
    await turso.execute({
      sql: `UPDATE owners SET ${setClause} WHERE id = ?`,
      args: [...args, id],
    });
  },

  async delete(id: number) {
    await turso.execute({
      sql: "DELETE FROM owners WHERE id = ?",
      args: [id],
    });
  }
};
