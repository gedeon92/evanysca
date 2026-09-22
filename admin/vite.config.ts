import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Port 8081 : le 8080 est pris par le site client, et les deux doivent pouvoir tourner ensemble.
// Ces deux origines sont celles déclarées dans CORS_ORIGIN côté backend.
export default defineConfig({
  plugins: [react()],
  server: { port: 8081, strictPort: true },
});
