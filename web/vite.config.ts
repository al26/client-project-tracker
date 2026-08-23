import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
// import { nitro } from "nitro/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
    // resolve: { tsconfigPaths: true },
    plugins: [tanstackStart(), netlify(), viteReact(), tailwindcss()],
});

export default config;
