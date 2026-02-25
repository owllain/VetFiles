
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const turso = createClient({
  url: process.env.VITE_TURSO_DATABASE_URL || "",
  authToken: process.env.VITE_TURSO_AUTH_TOKEN || "",
});

async function migrate() {
  try {
    await turso.execute("ALTER TABLE users ADD COLUMN schedule TEXT");
    console.log("Columna 'schedule' añadida con éxito.");
  } catch (error: any) {
    if (error.message.includes("duplicate column name")) {
      console.log("La columna 'schedule' ya existe.");
    } else {
      console.error("Error al migrar:", error.message);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
