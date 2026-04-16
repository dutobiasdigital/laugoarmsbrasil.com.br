"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";

const inputCls = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1.5";
const selectCls = "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";
const sectionTitle = "text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4";

const DESC_LIMIT = 600;

interface Advertiser {
  id: string;
  tradeName: string;
  legalName: string | null;
  contact: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  address: string | null;
  segment: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  description: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
}

export default function EditarEmpresaPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [emp, setEmp] = useState<Advertiser | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  useEffect(() => {
    fetch(`/api/admin/empresas`)
      .then(r => r.json())
      .then((list: Advertiser[]) => {
        const found = list.find(e => e.id === id);
        if (found) {
          setEmp(found);
          setDescription(found.description ?? "");
          setLogoUrl(found.logoUrl ?? "");
          setCoverImageUrl(found.coverImageUrl ?? "");
        }
      });
  }, [id]);

  const descCount = description.length;
  const descColor =
    descCount > DESC_LIMIT ? "text-red-400" : descCount > DESC_LIMIT * 0.85 ? "text-amber-400" : "text-[#526888]";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (descCount > DESC_LIMIT) {
      setError(`A descrição não pode ultrapassar ${DESC_LIMIT} caracteres.`);
      return;
    }
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/empresas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...Object.fromEntries(fd), description, logoUrl, coverImageUrl }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erro ao salvar."); setLoading(false); return; }
    router.push("/admin/empresas");
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch("/api/admin/empresas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) router.push("/admin/empresas");
    else { setError("Erro ao excluir."); setDeleting(false); setConfirmDelete(false); }
  }

  if (!emp) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-[#526888] text-[14px]">Carregando...</p>
    </div>
  );

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/empresas" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">← Empresas</Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px] truncate max-w-[300px]">{emp.tradeName}</span>
      </div>
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">Editar Empresa</h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">{emp.tradeName}</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      {error && <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">{error}</div>}

      <form onSubmit={handleSubmit} className="max-w-[860px]">

        {/* ── Dados da empresa ── */}
        <div className="mb-8">
          <p className={sectionTitle}>Dados da Empresa</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Nome Fantasia *</label>
              <input name="tradeName" required defaultValue={emp.tradeName} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Razão Social</label>
              <input name="legalName" defaultValue={emp.legalName ?? ""} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nome do Contato</label>
              <input name="contact" defaultValue={emp.contact ?? ""} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Telefone</label>
              <input name="phone" defaultValue={emp.phone ?? ""} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <input name="whatsappNumber" defaultValue={emp.whatsappNumber ?? ""} placeholder="5511999999999" className={inputCls} />
              <p className="text-[#526888] text-[11px] mt-1">Formato internacional sem espaços. Ex: 5511999998888</p>
            </div>
            <div>
              <label className={labelCls}>E-mail</label>
              <input name="email" type="email" defaultValue={emp.email ?? ""} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Segmento *</label>
              <select name="segment" defaultValue={emp.segment} className={selectCls}>
                <option value="ARMAS">Armas</option>
                <option value="MUNICOES">Munições</option>
                <option value="ACESSORIOS">Acessórios</option>
                <option value="CACA">Caça</option>
                <option value="TIRO_ESPORTIVO">Tiro Esportivo</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Site</label>
              <input name="website" type="url" defaultValue={emp.website ?? ""} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Instagram</label>
              <input name="instagram" defaultValue={emp.instagram ?? ""} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Endereço</label>
              <input name="address" defaultValue={emp.address ?? ""} className={inputCls} />
            </div>
          </div>
        </div>

        {/* ── Mensagem padrão WhatsApp ── */}
        <div className="mb-8">
          <p className={sectionTitle}>Mensagem Padrão (WhatsApp)</p>
          <div>
            <label className={labelCls}>Texto pré-preenchido ao visitante clicar em "Falar no WhatsApp"</label>
            <textarea
              name="whatsappMessage"
              rows={3}
              defaultValue={emp.whatsappMessage ?? ""}
              placeholder="Ex: Olá! Vi sua empresa na Revista Magnum e gostaria de mais informações."
              className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none"
            />
          </div>
        </div>

        {/* ── Imagens ── */}
        <div className="mb-8">
          <p className={sectionTitle}>Imagens</p>
          <div className="flex flex-col gap-5">
            <div>
              <label className={labelCls}>Logotipo</label>
              <ImageUpload
                folder="empresas"
                filename={`logo-${emp.tradeName.toLowerCase().replace(/\s+/g, '-')}`}
                defaultUrl={logoUrl}
                onUrlChange={setLogoUrl}
                inputName="logoUrl"
                aspectHint="Fundo transparente (PNG). Proporção livre."
              />
            </div>
            <div>
              <label className={labelCls}>Foto de Destaque</label>
              <ImageUpload
                folder="empresas"
                filename={`foto-${emp.tradeName.toLowerCase().replace(/\s+/g, '-')}`}
                defaultUrl={coverImageUrl}
                onUrlChange={setCoverImageUrl}
                inputName="coverImageUrl"
                aspectHint="Foto da empresa, showroom ou produto. Proporção 16:9 recomendada."
              />
            </div>
          </div>
        </div>

        {/* ── Descrição ── */}
        <div className="mb-8">
          <p className={sectionTitle}>Descrição Pública</p>
          <div>
            <label className={labelCls}>Texto exibido na página da empresa no Guia</label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Apresentação da empresa, produtos, diferenciais... Seja objetivo e atrativo."
              className="bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] px-3 py-2.5 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[#526888] text-[11px]">
                Dica: seja direto. Textos até 400 caracteres têm melhor leitura na vitrine do guia.
              </p>
              <p className={`text-[11px] font-mono tabular-nums ${descColor}`}>
                {descCount}/{DESC_LIMIT}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex gap-3">
            <button type="submit" disabled={loading || deleting}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] px-7 rounded-[6px] transition-colors">
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
            <Link href="/admin/empresas" className="bg-[#141d2c] border border-[#1c2a3e] hover:border-zinc-500 text-[#d4d4da] text-[14px] h-[44px] px-6 flex items-center rounded-[6px] transition-colors">
              Cancelar
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <>
                <span className="text-[#ff6b6b] text-[13px] font-medium">Confirma exclusão?</span>
                <button type="button" onClick={handleDelete} disabled={deleting}
                  className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[13px] font-semibold h-[38px] px-4 rounded-[6px] transition-colors">
                  {deleting ? "Excluindo..." : "Sim, excluir"}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="bg-[#141d2c] border border-[#1c2a3e] text-[#d4d4da] text-[13px] h-[38px] px-4 rounded-[6px] transition-colors">
                  Não
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} disabled={loading}
                className="border border-[#3a1010] hover:border-[#ff1f1f]/50 text-[#526888] hover:text-[#ff6b6b] text-[13px] h-[38px] px-4 rounded-[6px] transition-colors">
                🗑 Excluir empresa
              </button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
