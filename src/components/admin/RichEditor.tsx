"use client";

import { useRef, useEffect, useCallback } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const btnCls =
  "h-[28px] min-w-[28px] px-1.5 rounded text-[12px] text-[#7a9ab5] hover:text-white hover:bg-[#1c2a3e] transition-colors flex items-center justify-center select-none";

export default function RichEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const insertLink = useCallback(() => {
    const url = window.prompt("URL do link:", "https://");
    if (url) exec("createLink", url);
  }, [exec]);

  const handleImageUpload = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) exec("insertImage", data.url);
    } catch {
      alert("Erro ao fazer upload da imagem.");
    }
  }, [exec]);

  return (
    <div className="border border-[#1c2a3e] rounded-[8px] overflow-hidden bg-[#0e1520] focus-within:border-[#ff1f1f] transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[#141d2c] bg-[#141d2c]">
        <button type="button" className={`${btnCls} font-bold text-[13px]`} onMouseDown={(e) => { e.preventDefault(); exec("bold"); }}>B</button>
        <button type="button" className={`${btnCls} italic`} onMouseDown={(e) => { e.preventDefault(); exec("italic"); }}>I</button>
        <button type="button" className={`${btnCls} underline`} onMouseDown={(e) => { e.preventDefault(); exec("underline"); }}>U</button>
        <button type="button" className={`${btnCls} line-through`} onMouseDown={(e) => { e.preventDefault(); exec("strikeThrough"); }}>S</button>

        <div className="w-px h-[20px] bg-[#1c2a3e] mx-1" />

        <button type="button" className={`${btnCls} font-bold`} onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "<h2>"); }}>H2</button>
        <button type="button" className={`${btnCls} font-bold`} onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "<h3>"); }}>H3</button>
        <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "<p>"); }}>¶</button>

        <div className="w-px h-[20px] bg-[#1c2a3e] mx-1" />

        <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec("justifyLeft"); }} title="Esquerda">⬛</button>
        <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec("justifyCenter"); }} title="Centro">▬</button>
        <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec("justifyRight"); }} title="Direita">⬛</button>

        <div className="w-px h-[20px] bg-[#1c2a3e] mx-1" />

        <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }}>• —</button>
        <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec("insertOrderedList"); }}>1.</button>
        <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "<blockquote>"); }}>"</button>

        <div className="w-px h-[20px] bg-[#1c2a3e] mx-1" />

        <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); insertLink(); }} title="Inserir link">🔗</button>
        <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec("unlink"); }} title="Remover link">🔗✕</button>

        <div className="w-px h-[20px] bg-[#1c2a3e] mx-1" />

        <button
          type="button"
          className={btnCls}
          title="Inserir imagem"
          onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
        >
          🖼
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = "";
          }}
        />

        <div className="w-px h-[20px] bg-[#1c2a3e] mx-1" />

        <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec("undo"); }}>↩</button>
        <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec("redo"); }}>↪</button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML); }}
        className="min-h-[320px] px-4 py-3 text-[#d4d4da] text-[14px] leading-[1.7] focus:outline-none [&_h2]:text-white [&_h2]:text-[24px] [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-white [&_h3]:text-[18px] [&_h3]:font-bold [&_h3]:mb-2 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[#ff1f1f] [&_blockquote]:pl-4 [&_blockquote]:text-[#7a9ab5] [&_a]:text-[#ff1f1f] [&_a]:underline [&_img]:max-w-full [&_img]:rounded-[4px] [&_img]:my-2"
      />
    </div>
  );
}
