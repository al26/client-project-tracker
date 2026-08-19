import { defineConfig } from "vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

const config = defineConfig({
    resolve: { tsconfigPaths: true },
    plugins: [
        tanstackStart(),
        viteReact({
            babel: {
                plugins: [
                    [
                        "@babel/plugin-transform-react-jsx",
                        { runtime: "automatic" },
                    ],
                ],
            },
        }),
        tailwindcss(),
    ],
});

export default config;
