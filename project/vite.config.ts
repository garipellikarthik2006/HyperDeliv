import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    watch: {
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/.idea/**",
        "**/.vscode/**",
        "**/OneDriveTemp/**",
        "**/*.tmp",
        "**/desktop.ini",
      ],
    },
    proxy: {
      // Proxy API requests to the backend server during development
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
