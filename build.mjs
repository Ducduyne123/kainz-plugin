import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { createHash } from "crypto";

if (!existsSync("dist")) {
    mkdirSync("dist");
}

/**
 * Plugin esbuild: chan resolve cac module @vendetta/* va react,
 * thay vi de esbuild goi require() (khong ton tai trong runtime Bunny),
 * tra ve 1 module ao doc tu bien global window.vendetta / window.React
 * luc runtime. Day la cach lam dung nhu build.mjs chinh chu cua
 * vendetta-mod/plugin-template (ho dung Rollup globals(), day la
 * ban tuong duong cho esbuild).
 */
const vendettaGlobalsPlugin = {
    name: "vendetta-globals",
    setup(pluginBuild) {
        pluginBuild.onResolve({ filter: /^@vendetta(\/.*)?$/ }, (args) => {
            return { path: args.path, namespace: "vendetta-global" };
        });

        pluginBuild.onResolve({ filter: /^react$/ }, (args) => {
            return { path: args.path, namespace: "vendetta-global" };
        });

        pluginBuild.onLoad({ filter: /.*/, namespace: "vendetta-global" }, (args) => {
            let globalExpr;

            if (args.path === "react") {
                globalExpr = "window.React";
            } else if (args.path === "@vendetta") {
                globalExpr = "window.vendetta";
            } else {
                const subPath = args.path.replace("@vendetta/", "");
                globalExpr = "window.vendetta." + subPath.split("/").join(".");
            }

            return {
                contents: `module.exports = ${globalExpr};`,
                loader: "js",
            };
        });
    },
};

async function run() {
    await build({
        entryPoints: ["src/index.js"],
        bundle: true,
        outfile: "dist/index.js",
        format: "iife",
        globalName: "plugin",
        target: "es2020",
        minify: true,
        footer: { js: "plugin = plugin.default;" },
        plugins: [vendettaGlobalsPlugin],
    });

    const bundleContent = readFileSync("dist/index.js", "utf-8");
    const hash = createHash("sha256").update(bundleContent).digest("hex");

    const manifest = JSON.parse(readFileSync("manifest.json", "utf-8"));
    manifest.hash = hash;
    manifest.main = "index.js";

    writeFileSync("dist/manifest.json", JSON.stringify(manifest, null, 4));

    console.log("Build xong. Hash:", hash);
    console.log("File dist/index.js va dist/manifest.json da san sang.");
}

run().catch((err) => {
    console.error("Build that bai:", err);
    process.exit(1);
});
