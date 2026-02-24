import { createClient } from "@libsql/client/web";

const url = import.meta.env.VITE_TURSO_DATABASE_URL;
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Turso credentials missing in .env file");
}

export const turso = createClient({
  url: url || "",
  authToken: authToken || "",
});
