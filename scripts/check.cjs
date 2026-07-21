const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
const html = fs.readFileSync(indexPath, "utf8");

const missing = [];
const referencedFiles = [
  ...html.matchAll(/(?:src|href)=["']\.\/([^"']+)["']/g),
  ...html.matchAll(/url\(["']?\.\/([^"')]+)["']?\)/g)
].map(match => match[1]);

for (const relativeFile of referencedFiles) {
  const filePath = path.join(root, relativeFile);
  if (!fs.existsSync(filePath)) missing.push(relativeFile);
}

const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
for (const script of inlineScripts) {
  new Function(script);
}

if (missing.length) {
  console.error("Missing referenced files:");
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

console.log(`OK: ${referencedFiles.length} referenced files found`);
console.log(`OK: ${inlineScripts.length} inline script(s) parsed`);
