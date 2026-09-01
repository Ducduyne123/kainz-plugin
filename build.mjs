import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { createHash } from "crypto";

const watch = process.argv.includes("--watch");

if (!existsSync("dist")) {
    mkdirSync("dist");
}

async function run() {
    await build({
        entryPoints: ["src/index.js"],
        bundle: true,
        outfile: "dist/index.js",
        format: "iife",
        globalName: "plugin",
        target: "es2020",
        minify: true,
        footer: { js: "plugin.default = plugin;" },
        external: ["react", "react-native", "@vendetta", "@vendetta/*"],
    });

    const bundleContent = readFileSync("dist/index.js", "utf-8");
    const hash = createHash("sha256").update(bundleContent).digest("hex");

    const manifest = JSON.parse(readFileSync("manifest.json", "utf-8"));
    manifest.hash = hash;

    writeFileSync("dist/manifest.json", JSON.stringify(manifest, null, 4));

    console.log("Build xong. Hash:", hash);
    console.log("File dist/index.js va dist/manifest.json da san sang.");
}

run().catch((err) => {
    console.error("Build that bai:", err);
    process.exit(1);
});
