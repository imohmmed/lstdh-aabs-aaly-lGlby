import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

const isProduction = process.env.NODE_ENV === "production";

function obfuscateAdminPlugin(): Plugin {
  return {
    name: "obfuscate-admin",
    apply: "build",
    enforce: "post",
    async generateBundle(_options, bundle) {
      if (!isProduction) return;

      const JavaScriptObfuscator = (await import("javascript-obfuscator")).default;

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== "chunk" || !fileName.endsWith(".js")) continue;

        const hasAdmin =
          chunk.moduleIds?.some(
            (id: string) =>
              id.includes("/pages/admin/") ||
              id.includes("/components/admin/"),
          ) ?? false;

        if (!hasAdmin) continue;

        const result = JavaScriptObfuscator.obfuscate(chunk.code, {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.5,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.2,
          identifierNamesGenerator: "hexadecimal",
          renameGlobals: false,
          selfDefending: false,
          stringArray: true,
          stringArrayEncoding: ["base64"],
          stringArrayThreshold: 0.75,
          transformObjectKeys: true,
          unicodeEscapeSequence: false,
          splitStrings: true,
          splitStringsChunkLength: 8,
          target: "browser",
        });

        chunk.code = result.getObfuscatedCode();
      }
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    obfuscateAdminPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("/pages/admin/") || id.includes("/components/admin/")) {
            return "admin-panel";
          }
        },
      },
    },
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
