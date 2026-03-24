import esbuild from "esbuild";

esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/bundle.js",
  target: ["chrome121", "safari17", "firefox121"], 
  format: "cjs",
  platform: "browser",
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: false
}).catch(() => process.exit(1));