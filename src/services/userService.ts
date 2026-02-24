import { turso } from "../lib/turso";

export interface User {
  id: number;
  cedula: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  password_hash: string;
  created_at: number;
}

export const userService = {
  async getAll(): Promise<User[]> {
    const rs = await turso.execute("SELECT * FROM users ORDER BY full_name ASC");
    return rs.rows.map((row) => ({
      id: row.id as number,
      cedula: row.cedula as string,
      full_name: row.full_name as string,
      email: row.email as string,
      phone: row.phone as string,
      role: row.role as string,
      password_hash: row.password_hash as string,
      created_at: row.created_at as number,
    }));
  },

  async create(user: Omit<User, "id">) {
    await turso.execute({
      sql: "INSERT INTO users (cedula, full_name, email, phone, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [
        user.cedula,
        user.full_name,
        user.email,
        user.phone,
        user.role,
        user.password_hash,
        user.created_at,
      ],
    });
  },

  async update(id: number, user: Partial<User>) {
    const fields = Object.keys(user).filter(k => k !== 'id');
    if (fields.length === 0) return;
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const args = fields.map(f => (user as any)[f]);
    await turso.execute({
      sql: `UPDATE users SET ${setClause} WHERE id = ?`,
      args: [...args, id],
    });
  },

  async delete(id: number) {
    await turso.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [id],
    });
  }
};
