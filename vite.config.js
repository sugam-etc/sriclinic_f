import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { routes } from "./src/routes";
import Sitemap from "vite-plugin-sitemap";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    Sitemap({
      hostname: "https://sriveterinaryclinic.com",
      routes,
    }),
  ],
});
