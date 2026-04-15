import Link from "next/link";

export default function FooterMinimal() {
  return (
    <footer className="bg-[#0e1520] border-t border-[#141d2c] h-[56px] flex items-center px-5 lg:px-20 mt-auto">
      <p className="text-white text-[11px]">
        © {new Date().getFullYear()} Revista Magnum. Todos os direitos reservados.
      </p>
      <div className="flex-1" />
      <a
        href="https://arkelab.com.br"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 border border-[#1c2a3e] rounded px-2.5 py-1 hover:border-zinc-500 transition-colors"
      >
        <div className="w-[10px] h-[10px] bg-[#ff1f1f] rounded-[1px]" />
        <span className="text-[11px] text-[#526888] font-semibold">arkeLAB</span>
      </a>
    </footer>
  );
}
