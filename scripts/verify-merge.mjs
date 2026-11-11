import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const routes = ["app/(site)/page.tsx", "app/(site)/login/page.tsx", "app/(site)/shop/page.tsx", "app/(admin)/admin/page.tsx"];
let failures = 0;
for (const route of routes) {
  const full = path.join(root, route);
  if (!fs.existsSync(full)) { console.error(`Missing route: ${route}`); failures++; }
  else console.log(`OK route: ${route}`);
}
const extensions = ["", ".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".module.css", "/index.js", "/index.jsx", "/index.ts", "/index.tsx"];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      const content = fs.readFileSync(full, "utf8");
      const matches = content.matchAll(/(?:from\s*|import\s*\(|require\s*\()\s*["']([^"']+)["']/g);
      for (const match of matches) {
        const spec = match[1];
        if (!spec.startsWith("@/") && !spec.startsWith(".")) continue;
        const base = spec.startsWith("@/") ? path.resolve(root, spec.slice(2)) : path.resolve(path.dirname(full), spec);
        if (!extensions.some((ext) => fs.existsSync(base + ext))) {
          console.error(`Unresolved: ${path.relative(root, full)} -> ${spec}`);
          failures++;
        }
      }
    }
  }
}
for (const directory of ["app", "components", "hooks", "lib", "utils", "data"]) {
  if (fs.existsSync(path.join(root, directory))) walk(path.join(root, directory));
}
if (failures) { console.error(`${failures} issue(s) found`); process.exitCode = 1; }
else console.log("Static route/import verification passed.");
