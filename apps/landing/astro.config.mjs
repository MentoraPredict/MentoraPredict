import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/landing",
  output: "static",
  server: { port: 4321 },
  vite: {
    plugins: [tailwindcss()],
  },
});
