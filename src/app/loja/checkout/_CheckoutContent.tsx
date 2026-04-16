"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function formatCPF(v: string) {
  return v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function formatPhone(v: string) {
  return v.replace(/\D/g, "").slice(0, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}
function formatCEP(v: string) {
  return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

type Step = 1 | 2 | 3;

const PAYMENT_METHODS = [
  { id: "pix",    label: "Pix",              icon: "⚡", desc: "Aprovação instantânea · 5% de desconto" },
  { id: "boleto", label: "Boleto",            icon: "🏦", desc: "Vence em 3 dias úteis" },
  { id: "credit", label: "Cartão de Crédito", icon: "💳", desc: "Até 12x sem juros" },
  { id: "debit",  label: "Cartão de Débito",  icon: "🏧", desc: "Débito à vista" },
];

const inputCls = "w-full bg-[#070a12] border border-[#1c2a3e] focus:border-[#ff1f1f] rounded-[8px] h-[46px] px-4 text-[14px] text-[#d4d4da] placeholder-[#2a3a4e] outline-none transition-colors";
const labelCls = "text-[#7a9ab5] text-[12px] font-semibold uppercase tracking-[0.5px] mb-1.5 block";

export default function CheckoutContent() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [step, setStep]     = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [nome,     setNome]     = useState("");
  const [email,    setEmail]    = useState("");
  const [cpf,      setCpf]      = useState("");
  const [telefone, setTelefone] = useState("");

  const [cep,         setCep]         = useState("");
  const [rua,         setRua]         = useState("");
  const [numero,      setNumero]      = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro,      setBairro]      = useState("");
  const [cidade,      setCidade]      = useState("");
  const [estado,      setEstado]      = useState("");
  const [cepLoading,  setCepLoading]  = useState(false);

  const [payMethod,    setPayMethod]  = useState("pix");
  const [cardNum,      setCardNum]    = useState("");
  const [cardName,     setCardName]   = useState("");
  const [cardExp,      setCardExp]    = useState("");
  const [cardCvv,      setCardCvv]    = useState("");
  const [installments, setInstall]    = useState("1");

  const frete       = total >= 20000 ? 0 : 1990;
  const pixDiscount = payMethod === "pix" ? Math.round(total * 0.05) : 0;
  const totalFinal  = total + frete - pixDiscount;

  async function lookupCEP(rawCep: string) {
    const clean = rawCep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setRua(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
      }
    } catch { /* ignore */ }
    setCepLoading(false);
  }

  function handleCepChange(v: string) {
    const formatted = formatCEP(v);
    setCep(formatted);
    if (formatted.replace(/\D/g, "").length === 8) lookupCEP(formatted);
  }

  async function handleSubmit() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const orderNum = "MAG-" + Date.now().toString(36).toUpperCase();
    clearCart();
    router.push(`/loja/obrigado?pedido=${orderNum}&total=${totalFinal}&metodo=${payMethod}`);
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <p className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[28px]">Carrinho vazio</p>
          <Link href="/loja" className="text-[#ff1f1f] hover:text-white text-[14px] font-semibold transition-colors">← Voltar à loja</Link>
        </div>
      </div>
    );
  }

  const steps = [{ n: 1, label: "Dados" }, { n: 2, label: "Endereço" }, { n: 3, label: "Pagamento" }];

  return (
    <>
      {/* Breadcrumb */}
      <div className="px-5 lg:px-20 py-4 border-b border-[#0e1520]">
        <nav className="flex items-center gap-2 text-[12px] text-[#526888]">
          <Link href="/loja" className="hover:text-[#7a9ab5] transition-colors">Loja</Link>
          <span>/</span>
          <Link href="/loja/carrinho" className="hover:text-[#7a9ab5] transition-colors">Carrinho</Link>
          <span>/</span>
          <span className="text-[#7a9ab5]">Checkout</span>
        </nav>
      </div>

      <div className="px-5 lg:px-20 py-10">
        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10 max-w-[400px]">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors ${
                  step > s.n ? "bg-[#22c55e] text-white" : step === s.n ? "bg-[#ff1f1f] text-white" : "bg-[#0e1520] border border-[#1c2a3e] text-[#526888]"
                }`}>
                  {step > s.n ? "✓" : s.n}
                </div>
                <span className={`text-[13px] font-semibold ${step === s.n ? "text-white" : "text-[#526888]"}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-[1px] mx-3 ${step > s.n ? "bg-[#22c55e]" : "bg-[#141d2c]"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Form */}
          <div className="flex-1 bg-[#0a0f1a] border border-[#141d2c] rounded-[16px] p-6 lg:p-8">

            {step === 1 && (
              <div className="flex flex-col gap-5">
                <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[26px]">Dados Pessoais</h2>
                <div>
                  <label className={labelCls}>Nome completo *</label>
                  <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome completo" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>E-mail *</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="seu@email.com" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>CPF *</label>
                    <input value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" className={inputCls} inputMode="numeric" />
                  </div>
                  <div>
                    <label className={labelCls}>Telefone *</label>
                    <input value={telefone} onChange={e => setTelefone(formatPhone(e.target.value))} placeholder="(00) 00000-0000" className={inputCls} inputMode="numeric" />
                  </div>
                </div>
                <button onClick={() => { if (nome && email && cpf && telefone) setStep(2); }}
                  disabled={!nome || !email || !cpf || !telefone}
                  className="mt-2 h-[52px] bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[15px] font-bold rounded-[8px] transition-colors">
                  Continuar → Endereço
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(1)} className="text-[#526888] hover:text-[#7a9ab5] transition-colors">
                    <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2L4 6l4 4"/></svg>
                  </button>
                  <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[26px]">Endereço de Entrega</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>CEP *</label>
                    <div className="relative">
                      <input value={cep} onChange={e => handleCepChange(e.target.value)} placeholder="00000-000" className={inputCls} inputMode="numeric" />
                      {cepLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526888] text-[12px]">...</span>}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Número *</label>
                    <input value={numero} onChange={e => setNumero(e.target.value)} placeholder="123" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Rua / Logradouro *</label>
                  <input value={rua} onChange={e => setRua(e.target.value)} placeholder="Nome da rua" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Complemento</label>
                  <input value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Apto, bloco, sala..." className={inputCls} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Bairro *</label>
                    <input value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Estado *</label>
                    <input value={estado} onChange={e => setEstado(e.target.value)} placeholder="UF" maxLength={2} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Cidade *</label>
                  <input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade" className={inputCls} />
                </div>
                <button onClick={() => { if (cep && rua && numero && bairro && cidade && estado) setStep(3); }}
                  disabled={!cep || !rua || !numero || !bairro || !cidade || !estado}
                  className="mt-2 h-[52px] bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[15px] font-bold rounded-[8px] transition-colors">
                  Continuar → Pagamento
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(2)} className="text-[#526888] hover:text-[#7a9ab5] transition-colors">
                    <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2L4 6l4 4"/></svg>
                  </button>
                  <h2 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[26px]">Forma de Pagamento</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.id} onClick={() => setPayMethod(m.id)}
                      className={`flex flex-col gap-1 p-4 rounded-[10px] border text-left transition-all ${
                        payMethod === m.id ? "border-[#ff1f1f] bg-[#ff1f1f]/5" : "border-[#1c2a3e] bg-[#070a12] hover:border-[#526888]"
                      }`}>
                      <span className="text-xl">{m.icon}</span>
                      <span className={`text-[13px] font-bold ${payMethod === m.id ? "text-white" : "text-[#d4d4da]"}`}>{m.label}</span>
                      <span className={`text-[11px] ${payMethod === m.id ? "text-[#ff9999]" : "text-[#526888]"}`}>{m.desc}</span>
                    </button>
                  ))}
                </div>

                {payMethod === "pix" && (
                  <div className="bg-[#071a10] border border-[#22c55e]/20 rounded-[10px] p-5 flex flex-col items-center gap-3">
                    <div className="w-20 h-20 bg-white rounded-[8px] flex items-center justify-center text-[40px]">⚡</div>
                    <p className="text-[#22c55e] text-[13px] font-semibold text-center">
                      Após confirmar, você receberá o QR Code e a chave Pix no e-mail.
                    </p>
                    <p className="text-[#526888] text-[12px] text-center">Aprovação em segundos · Desconto de 5% aplicado</p>
                  </div>
                )}

                {payMethod === "boleto" && (
                  <div className="bg-[#080f1a] border border-[#1c2a3e] rounded-[10px] p-5 text-center">
                    <p className="text-[#7a9ab5] text-[13px]">O boleto será enviado para <strong className="text-[#dce8ff]">{email}</strong> após a confirmação.</p>
                    <p className="text-[#526888] text-[12px] mt-2">Vencimento: 3 dias úteis após a emissão.</p>
                  </div>
                )}

                {(payMethod === "credit" || payMethod === "debit") && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className={labelCls}>Número do cartão *</label>
                      <input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,"").slice(0,16).replace(/(\d{4})/g,"$1 ").trim())}
                        placeholder="0000 0000 0000 0000" className={inputCls} inputMode="numeric" />
                    </div>
                    <div>
                      <label className={labelCls}>Nome no cartão *</label>
                      <input value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} placeholder="NOME SOBRENOME" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Validade *</label>
                        <input value={cardExp} onChange={e => setCardExp(e.target.value.replace(/\D/g,"").slice(0,4).replace(/(\d{2})(\d)/,"$1/$2"))}
                          placeholder="MM/AA" className={inputCls} inputMode="numeric" />
                      </div>
                      <div>
                        <label className={labelCls}>CVV *</label>
                        <input value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4))}
                          placeholder="000" className={inputCls} inputMode="numeric" type="password" />
                      </div>
                    </div>
                    {payMethod === "credit" && (
                      <div>
                        <label className={labelCls}>Parcelas</label>
                        <select value={installments} onChange={e => setInstall(e.target.value)}
                          className="w-full bg-[#070a12] border border-[#1c2a3e] focus:border-[#ff1f1f] rounded-[8px] h-[46px] px-4 text-[14px] text-[#d4d4da] outline-none transition-colors">
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                            <option key={n} value={n}>
                              {n}x de {formatCurrency(Math.ceil(totalFinal / n))} {n === 1 ? "(à vista)" : "sem juros"}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <button onClick={handleSubmit} disabled={loading}
                  className="mt-2 h-[56px] bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-60 text-white text-[16px] font-bold rounded-[8px] transition-colors flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 01-9-9"/></svg>
                      Processando...
                    </>
                  ) : `Confirmar pedido · ${formatCurrency(totalFinal)}`}
                </button>

                <div className="flex items-center justify-center gap-2 text-[#1c2a3e] text-[11px]">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="10" height="7" rx="1"/><path d="M5 7V5a3 3 0 016 0v2"/></svg>
                  Pagamento 100% seguro e criptografado
                </div>
              </div>
            )}
          </div>

          {/* Resumo fixo */}
          <div className="w-full lg:w-[320px] shrink-0 bg-[#0a0f1a] border border-[#141d2c] rounded-[14px] p-5 flex flex-col gap-4 lg:sticky lg:top-24">
            <h3 className="font-['Barlow_Condensed'] font-bold text-[#dce8ff] text-[18px]">Seu pedido</h3>
            <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.productId + (item.variationId ?? "")} className="flex gap-3">
                  <div className="w-12 h-12 shrink-0 rounded-[6px] bg-[#0e1520] border border-[#141d2c] overflow-hidden">
                    {item.imageUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-[#0e1520]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#d4d4da] text-[12px] font-semibold line-clamp-1">{item.name}</p>
                    {item.variationName && <p className="text-[#526888] text-[10px]">{item.variationName}</p>}
                    <p className="text-[#7a9ab5] text-[11px]">Qtd: {item.quantity}</p>
                  </div>
                  <span className="text-[#dce8ff] text-[13px] font-bold shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#141d2c] pt-3 flex flex-col gap-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#526888]">Subtotal</span>
                <span className="text-[#d4d4da]">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#526888]">Frete</span>
                <span className={frete === 0 ? "text-[#22c55e]" : "text-[#d4d4da]"}>{frete === 0 ? "Grátis" : formatCurrency(frete)}</span>
              </div>
              {pixDiscount > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#22c55e]">Desconto Pix (5%)</span>
                  <span className="text-[#22c55e]">-{formatCurrency(pixDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold mt-1">
                <span className="text-[#7a9ab5] text-[14px]">Total</span>
                <span className="font-['Barlow_Condensed'] text-[#dce8ff] text-[22px]">{formatCurrency(totalFinal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
