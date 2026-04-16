"use client";

export default function TabFiliais() {
  return (
    <div className="flex flex-col gap-4 max-w-[720px]">
      <div>
        <h3 className="font-['Barlow_Condensed'] font-bold text-white text-[22px] leading-none mb-1">
          Filiais
        </h3>
        <p className="text-[#526888] text-[13px]">
          Gerencie os endereços físicos e contatos das filiais da empresa.
        </p>
      </div>

      <div className="bg-[#0e1520] border border-[#141d2c] rounded-[12px] p-12 flex flex-col items-center justify-center text-center gap-3 min-h-[320px]">
        <span className="text-[48px]">🏪</span>
        <p className="font-['Barlow_Condensed'] font-bold text-white text-[22px]">Em breve</p>
        <p className="text-[#526888] text-[14px] max-w-[380px]">
          O cadastro de filiais com endereço completo, contato, foto e link do Google Maps
          estará disponível na próxima versão.
        </p>
        <div className="mt-2 bg-[#141d2c] rounded-[8px] px-5 py-3 text-left w-full max-w-[400px]">
          <p className="text-white text-[11px] font-semibold tracking-[0.5px] uppercase mb-2">Campos previstos</p>
          {[
            "Nome da filial",
            "Endereço completo (logradouro, cidade, estado, CEP)",
            "Telefone e e-mail da filial",
            "Nome, telefone e e-mail do contato principal",
            "Foto da filial (upload)",
            "Link do Google Maps",
          ].map((item) => (
            <p key={item} className="text-[#526888] text-[12px] flex items-center gap-2 py-0.5">
              <span className="text-[#ff1f1f]">·</span> {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
