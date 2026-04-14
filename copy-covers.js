const fs = require("fs");
const path = require("path");

const srcBase = "D:\\GOOGLE-DRIVE\\SITES-SIMPLAI\\REVISTAMAGNUM\\WEB\\pt-br\\revistas";
const destBase = path.join(__dirname, "public", "edicoes");

// Criar pastas se não existirem
[
  path.join(destBase, "regular"),
  path.join(destBase, "especiais"),
].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Criada pasta: ${dir}`);
  }
});

// Copiar edições regulares (1-145)
console.log("\n📋 Copiando edições REGULARES...");
for (let i = 1; i <= 145; i++) {
  const num = String(i).padStart(2, "0");
  const src = path.join(srcBase, "rm-rd-mormais", `rm-ed-${num}`, "content", "pages", "page1.jpg");
  const dest = path.join(destBase, "regular", `ed${String(i).padStart(3, "0")}-capa.jpg`);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ ed${String(i).padStart(3, "0")}-capa.jpg`);
  } else {
    console.log(`⚠️  Arquivo não encontrado: ${src}`);
  }
}

// Copiar edições especiais (1-62)
console.log("\n📋 Copiando edições ESPECIAIS...");
const specialNumbers = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 25, 26, 27, 28, 29, 30, 31,
  32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
  42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
  52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62,
];

specialNumbers.forEach((num, idx) => {
  const especial_idx = idx + 1;
  const src = path.join(srcBase, "rm-ed-especial", `rm-ed-${String(num).padStart(2, "0")}`, "content", "pages", "page1.jpg");
  const dest = path.join(destBase, "especiais", `esp${String(especial_idx).padStart(3, "0")}-capa.jpg`);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ esp${String(especial_idx).padStart(3, "0")}-capa.jpg`);
  } else {
    console.log(`⚠️  Arquivo não encontrado: ${src}`);
  }
});

console.log("\n✨ Cópia concluída!");
console.log(`Regular: ${path.join(destBase, "regular")}`);
console.log(`Especiais: ${path.join(destBase, "especiais")}`);
