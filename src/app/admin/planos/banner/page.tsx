export const dynamic = "force-dynamic";

export default function AdminPlanosBannerPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Planos — Banner
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">Em construção</p>
        </div>
      </div>
      <div className="bg-[#141d2c] h-px mb-6" />
      <div className="bg-[#0e1520] border border-dashed border-[#1c2a3e] rounded-[10px] p-16 text-center">
        <p className="text-[#526888] text-[24px] mb-3">🚧</p>
        <p className="text-[#526888] text-[14px]">Esta seção está em desenvolvimento.</p>
      </div>
    </>
  );
}
