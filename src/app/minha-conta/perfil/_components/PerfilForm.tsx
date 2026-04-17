"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "@/actions/profile";
import AvatarUpload from "@/components/AvatarUpload";

export type FullProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  avatarUrl: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialYoutube: string | null;
  socialTiktok: string | null;
};

const LABEL = "block text-[12px] font-semibold text-[#7a9ab5] uppercase tracking-[0.8px] mb-1.5";
const INPUT = "w-full bg-[#141d2c] border border-[#1c2a3e] text-white placeholder-[#526888] rounded-[8px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#ff1f1f] focus:ring-1 focus:ring-[#ff1f1f]/20 transition-colors";

const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function PerfilForm({ profile }: { profile: FullProfile }) {
  const [state, formAction, pending] = useActionState(updateProfile, {});
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);

  return (
    <form action={formAction} className="flex flex-col gap-8">

      {/* Feedback */}
      {state?.success && (
        <div className="bg-[#0f381f] border border-[#22c55e]/30 text-[#22c55e] text-[14px] px-4 py-3 rounded-[8px] flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {state.message}
        </div>
      )}
      {state?.error && (
        <div className="bg-[#2d0a0a] border border-[#ff6b6b]/30 text-[#ff6b6b] text-[14px] px-4 py-3 rounded-[8px]">
          {state.error}
        </div>
      )}

      {/* Hidden avatar URL field */}
      <input type="hidden" name="avatarUrl" value={avatarUrl ?? ""} />

      {/* ── Seção: Foto e dados básicos ── */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[14px] p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 pb-1 border-b border-[#141d2c]">
          <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
          <h2 className="text-[#dce8ff] text-[16px] font-semibold">Informações Pessoais</h2>
        </div>

        {/* Avatar + nome */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="shrink-0">
            <AvatarUpload
              userId={profile.id}
              currentUrl={avatarUrl}
              onUrlChange={(url) => setAvatarUrl(url)}
            />
          </div>
          <div className="flex-1 w-full">
            <label className={LABEL}>Nome completo *</label>
            <input type="text" name="name" required defaultValue={profile.name} className={INPUT} />
          </div>
        </div>

        {/* CPF + Telefone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>CPF</label>
            <input type="text" name="cpf" defaultValue={profile.cpf ?? ""} placeholder="000.000.000-00" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Telefone / WhatsApp</label>
            <input type="tel" name="phone" defaultValue={profile.phone ?? ""} placeholder="(11) 99999-9999" className={INPUT} />
          </div>
        </div>
      </section>

      {/* ── Seção: Email ── */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[14px] p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 pb-1 border-b border-[#141d2c]">
          <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
          <h2 className="text-[#dce8ff] text-[16px] font-semibold">E-mail</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>E-mail atual</label>
            <input type="email" value={profile.email} disabled
              className="w-full bg-[#0a0e18] border border-[#1c2a3e]/50 text-[#526888] rounded-[8px] px-4 py-2.5 text-[14px] cursor-not-allowed"
            />
          </div>
          <div>
            <label className={LABEL}>Novo e-mail <span className="text-[#526888] normal-case font-normal">(opcional)</span></label>
            <input type="email" name="newEmail" placeholder="novo@email.com" className={INPUT} />
          </div>
        </div>
        <p className="text-[#526888] text-[12px] leading-relaxed -mt-2">
          🔒 Ao informar um novo e-mail, você receberá confirmações nos dois endereços. A alteração só é efetivada após ambas as confirmações.
        </p>
      </section>

      {/* ── Seção: Endereço ── */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[14px] p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 pb-1 border-b border-[#141d2c]">
          <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
          <h2 className="text-[#dce8ff] text-[16px] font-semibold">Endereço</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
          <div>
            <label className={LABEL}>CEP</label>
            <input type="text" name="addressZip" defaultValue={profile.addressZip ?? ""} placeholder="00000-000" className={INPUT} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
          <div>
            <label className={LABEL}>Logradouro</label>
            <input type="text" name="addressStreet" defaultValue={profile.addressStreet ?? ""} placeholder="Rua, Avenida..." className={INPUT} />
          </div>
          <div className="sm:w-[100px]">
            <label className={LABEL}>Número</label>
            <input type="text" name="addressNumber" defaultValue={profile.addressNumber ?? ""} placeholder="Nº" className={INPUT} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Complemento</label>
            <input type="text" name="addressComplement" defaultValue={profile.addressComplement ?? ""} placeholder="Apto, Bloco..." className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Bairro</label>
            <input type="text" name="addressNeighborhood" defaultValue={profile.addressNeighborhood ?? ""} className={INPUT} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_80px] gap-4">
          <div>
            <label className={LABEL}>Cidade</label>
            <input type="text" name="addressCity" defaultValue={profile.addressCity ?? ""} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Estado</label>
            <select name="addressState" defaultValue={profile.addressState ?? ""}
              className={`${INPUT} appearance-none`}>
              <option value="">UF</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* ── Seção: Redes Sociais ── */}
      <section className="bg-[#0e1520] border border-[#141d2c] rounded-[14px] p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 pb-1 border-b border-[#141d2c]">
          <div className="w-[3px] h-5 bg-[#ff1f1f] rounded-full" />
          <h2 className="text-[#dce8ff] text-[16px] font-semibold">Redes Sociais <span className="text-[#526888] text-[13px] font-normal">(opcional)</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Instagram</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#526888] text-[14px]">@</span>
              <input type="text" name="socialInstagram" defaultValue={profile.socialInstagram ?? ""} placeholder="seuperfil" className={`${INPUT} pl-7`} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Facebook</label>
            <input type="text" name="socialFacebook" defaultValue={profile.socialFacebook ?? ""} placeholder="facebook.com/seuperfil" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>YouTube</label>
            <input type="text" name="socialYoutube" defaultValue={profile.socialYoutube ?? ""} placeholder="youtube.com/@seucanal" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>TikTok</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#526888] text-[14px]">@</span>
              <input type="text" name="socialTiktok" defaultValue={profile.socialTiktok ?? ""} placeholder="seuperfil" className={`${INPUT} pl-7`} />
            </div>
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-4 pb-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white font-semibold h-[44px] px-8 rounded-[8px] text-[14px] transition-colors flex items-center gap-2"
        >
          {pending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Salvando...
            </>
          ) : "Salvar alterações"}
        </button>
        {state?.success && (
          <p className="text-[#22c55e] text-[13px] flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Salvo!
          </p>
        )}
      </div>
    </form>
  );
}
