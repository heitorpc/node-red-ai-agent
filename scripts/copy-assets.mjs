import { copyFile, mkdir, readdir } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = resolve(__dirname, "../src");
const distDir = resolve(__dirname, "../dist");
const allowedExtensions = new Set([".html", ".svg", ".json"]);

async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = join(dir, entry.name);

        if (entry.isDirectory()) {
            await walk(sourcePath);
            continue;
        }

        if (!allowedExtensions.has(extname(entry.name))) {
            continue;
        }

        const relativePath = sourcePath.slice(srcDir.length + 1);
        const targetPath = join(distDir, relativePath);

        await mkdir(dirname(targetPath), { recursive: true });
        await copyFile(sourcePath, targetPath);
    }
}

await walk(srcDir);
console.log("Assets copied to dist.");