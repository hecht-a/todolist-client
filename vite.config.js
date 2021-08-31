import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import * as path from "path";
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        svelte({
            preprocess: sveltePreprocess()
        })
    ],
    resolve: {
        alias: [
            {
                find: "@",
                replacement: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src")
            },
            {
                find: "@App",
                replacement: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src/App")
            },
            {
                find: "@Components",
                replacement: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src/components")
            },
            {
                find: "@Views",
                replacement: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src/views")
            }
        ],
    },
});
