const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Mapeamento: zinc (quente) → silício-ferro (frio/tecnologia)
const replacements = [
  // Backgrounds - do mais escuro para o mais claro (ordem importante)
  ["#09090b", "#070a12"],  // void silicon black (zinc-950)
  ["#18181b", "#0e1520"],  // forged steel (zinc-900)
  ["#27272a", "#141d2c"],  // cold carbon plate (zinc-800)
  ["#3f3f46", "#1c2a3e"],  // iron edge (zinc-700)
  ["#52525b", "#253750"],  // steel seam (zinc-600)
  ["#71717a", "#526888"],  // blued steel mist (zinc-500)
  ["#a1a1aa", "#7a9ab5"],  // titanium (zinc-400)
  ["#d4d4d8", "#b0c4d8"],  // silicon silver (zinc-300)
  ["#fafafa", "#dce8ff"],  // cold silicon white (zinc-50)
  ["#f4f4f5", "#e2eeff"],  // silicon light (zinc-100)
  // Capitalizados (caso apareçam)
  ["#09090B", "#070a12"],
  ["#18181B", "#0e1520"],
  ["#27272A", "#141d2c"],
  ["#3F3F46", "#1c2a3e"],
  ["#52525B", "#253750"],
  ["#71717A", "#526888"],
  ["#A1A1AA", "#7a9ab5"],
  ["#D4D4D8", "#b0c4d8"],
  ["#FAFAFA", "#dce8ff"],
  ["#F4F4F5", "#e2eeff"],
];

// Arquivos a processar
const files = [
  "src/app/page.tsx",
  "src/app/layout.tsx",
  "src/components/Header.tsx",
  "src/components/Footer.tsx",
  "src/components/FooterMinimal.tsx",
  "src/app/edicoes/page.tsx",
  "src/app/edicoes/[slug]/page.tsx",
  "src/app/blog/page.tsx",
  "src/app/blog/[slug]/page.tsx",
  "src/app/sobre/page.tsx",
  "src/app/contato/page.tsx",
  "src/app/assine/page.tsx",
  "src/app/anuncie/page.tsx",
  "src/app/checkout/page.tsx",
  "src/app/checkout/_CheckoutContent.tsx",
  "src/app/auth/login/page.tsx",
  "src/app/auth/cadastro/page.tsx",
  "src/app/auth/esqueceu-senha/page.tsx",
  "src/app/minha-conta/page.tsx",
  "src/app/minha-conta/layout.tsx",
  "src/app/minha-conta/_components/SidebarNav.tsx",
  "src/app/admin/page.tsx",
  "src/app/admin/layout.tsx",
  "src/app/admin/_components/AdminSidebarNav.tsx",
  "src/app/admin/edicoes/page.tsx",
  "src/app/admin/edicoes/nova/page.tsx",
  "src/app/admin/edicoes/[id]/page.tsx",
  "src/app/admin/edicoes/[id]/_EditionEditForm.tsx",
  "src/app/admin/artigos/page.tsx",
  "src/app/admin/artigos/novo/page.tsx",
  "src/app/admin/artigos/novo/_ArticleForm.tsx",
  "src/app/admin/artigos/[id]/page.tsx",
  "src/app/admin/artigos/[id]/_ArticleEditForm.tsx",
  "src/app/admin/assinantes/page.tsx",
  "src/app/admin/assinantes/[id]/page.tsx",
  "src/app/admin/assinantes/[id]/_AssinanteClient.tsx",
  "src/app/admin/categorias/page.tsx",
  "src/app/admin/categorias/_CategoriasClient.tsx",
  "src/app/admin/planos/page.tsx",
  "src/app/admin/planos/_PlanosClient.tsx",
  "src/app/admin/pagamentos/page.tsx",
  "src/app/admin/configuracoes/page.tsx",
  "src/app/admin/configuracoes/_ConfiguracoesClient.tsx",
  "src/app/admin/anuncios/page.tsx",
  "src/app/admin/anuncios/novo/page.tsx",
  "src/components/admin/ImageUpload.tsx",
  "src/components/admin/RichEditor.tsx",
];

const root = __dirname;
let totalChanges = 0;
let totalFiles = 0;

for (const file of files) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Não encontrado: ${file}`);
    continue;
  }

  let content = fs.readFileSync(fullPath, "utf8");
  let changed = false;
  let fileChanges = 0;

  for (const [from, to] of replacements) {
    const count = (content.split(from).length - 1);
    if (count > 0) {
      content = content.split(from).join(to);
      fileChanges += count;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`✅ ${file} — ${fileChanges} substituições`);
    totalChanges += fileChanges;
    totalFiles++;
  }
}

console.log(`\n✨ Concluído: ${totalChanges} substituições em ${totalFiles} arquivos`);
