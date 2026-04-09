import Link from "next/link";

export default function FooterMinimal() {
  return (
    <footer className="bg-[#18181b] border-t border-[#27272a] h-[56px] flex items-center px-5 lg:px-20 mt-auto">
      <p className="text-[#52525b] text-[11px]">
        © {new Date().getFullYear()} Revista Magnum. Todos os direitos reservados.
      </p>
      <div className="flex-1" />
      <a
        href="https://arkelab.com.br"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 border border-[#3f3f46] rounded px-2.5 py-1 hover:border-zinc-500 transition-colors"
      >
        <div className="w-[10px] h-[10px] bg-[#ff1f1f] rounded-[1px]" />
        <span className="text-[11px] text-[#71717a] font-semibold">arkeLAB</span>
      </a>
    </footer>
  );
}
