// Vercel build: copy the static site to dist/ and write dist/config.js from env vars.
// No dependencies. Run locally with `node scripts/build.mjs`.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const env = (name) => {
  const v = process.env[name]?.trim();
  return v ? v : null;
};
const url = (name) => {
  const v = env(name);
  if (v && !/^https:\/\/[^\s"'<>]+$/.test(v)) {
    console.warn(`⚠ ${name} ignored: must be an https:// URL`);
    return null;
  }
  return v;
};

const config = {
  ca: env("FOMO_CA"),
  ticker: env("FOMO_TICKER"),
  fomoUrl: url("FOMO_TOKEN_URL"),
  x: url("FOMO_X_URL"),
  telegram: url("FOMO_TELEGRAM_URL"),
};

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
for (const f of ["index.html", "styles.css", "main.js"]) cpSync(f, `dist/${f}`);
cpSync("assets", "dist/assets", { recursive: true });

writeFileSync("dist/config.js", `window.FOMO_CONFIG = ${JSON.stringify(config, null, 2)};\n`);

// Absolute og:image so link previews work (Vercel provides the production domain).
const host = env("VERCEL_PROJECT_PRODUCTION_URL");
if (host) {
  const html = readFileSync("dist/index.html", "utf8")
    .replace('content="assets/fomo-burn-logo-1024.png"', `content="https://${host}/assets/fomo-burn-logo-1024.png"`);
  writeFileSync("dist/index.html", html);
}

console.log("Built dist/ with config:", Object.fromEntries(Object.entries(config).map(([k, v]) => [k, v ? "set" : "—"])));
