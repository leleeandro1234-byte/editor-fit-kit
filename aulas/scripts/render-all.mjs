import { execSync } from "child_process";
import fs from "fs";
fs.mkdirSync("out", { recursive: true });
const ids = JSON.parse(fs.readFileSync("roteiros.json", "utf8")).map((l) => l.id);
for (const id of ids) execSync(`npx remotion render src/index.ts ${id} out/${id}.mp4`, { stdio: "inherit" });
