"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useRef, useCallback } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const btnCls =
  "h-[28px] px-2 rounded text-[12px] text-[#a1a1aa] hover:text-white hover:bg-[#3f3f46] transition-colors flex items-center justify-center";
const activeCls = "bg-[#3f3f46] text-white";

export default function RichEditor({ value, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-[#ff1f1f] underline" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none min-h-[320px] px-4 py-3 focus:outline-none text-[#d4d4da] text-[14px] leading-[1.7]",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = useCallback(
    async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url && editor) {
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    },
    [editor]
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL do link:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-[#3f3f46] rounded-[8px] overflow-hidden bg-[#18181b] focus-within:border-[#ff1f1f] transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[#27272a] bg-[#27272a]">
        {/* History */}
        <button type="button" className={btnCls} onClick={() => editor.chain().focus().undo().run()} title="Desfazer">↩</button>
        <button type="button" className={btnCls} onClick={() => editor.chain().focus().redo().run()} title="Refazer">↪</button>

        <div className="w-px h-[20px] bg-[#3f3f46] mx-1" />

        {/* Headings */}
        <button type="button" className={`${btnCls} font-bold text-[13px] ${editor.isActive("heading", { level: 1 }) ? activeCls : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
        <button type="button" className={`${btnCls} font-bold text-[13px] ${editor.isActive("heading", { level: 2 }) ? activeCls : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" className={`${btnCls} font-bold text-[13px] ${editor.isActive("heading", { level: 3 }) ? activeCls : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" className={`${btnCls} ${editor.isActive("paragraph") ? activeCls : ""}`} onClick={() => editor.chain().focus().setParagraph().run()}>¶</button>

        <div className="w-px h-[20px] bg-[#3f3f46] mx-1" />

        {/* Marks */}
        <button type="button" className={`${btnCls} font-bold ${editor.isActive("bold") ? activeCls : ""}`} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" className={`${btnCls} italic ${editor.isActive("italic") ? activeCls : ""}`} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" className={`${btnCls} underline ${editor.isActive("underline") ? activeCls : ""}`} onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
        <button type="button" className={`${btnCls} line-through ${editor.isActive("strike") ? activeCls : ""}`} onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>
        <button type="button" className={`${btnCls} font-mono text-[11px] ${editor.isActive("code") ? activeCls : ""}`} onClick={() => editor.chain().focus().toggleCode().run()}>{"</>"}</button>

        <div className="w-px h-[20px] bg-[#3f3f46] mx-1" />

        {/* Alignment */}
        <button type="button" className={`${btnCls} ${editor.isActive({ textAlign: "left" }) ? activeCls : ""}`} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Alinhar esquerda">≡</button>
        <button type="button" className={`${btnCls} ${editor.isActive({ textAlign: "center" }) ? activeCls : ""}`} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Centralizar">≡</button>
        <button type="button" className={`${btnCls} ${editor.isActive({ textAlign: "right" }) ? activeCls : ""}`} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Alinhar direita">≡</button>

        <div className="w-px h-[20px] bg-[#3f3f46] mx-1" />

        {/* Lists */}
        <button type="button" className={`${btnCls} ${editor.isActive("bulletList") ? activeCls : ""}`} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista">• —</button>
        <button type="button" className={`${btnCls} ${editor.isActive("orderedList") ? activeCls : ""}`} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada">1.</button>
        <button type="button" className={`${btnCls} ${editor.isActive("blockquote") ? activeCls : ""}`} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citação">"</button>
        <button type="button" className={btnCls} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Linha horizontal">—</button>

        <div className="w-px h-[20px] bg-[#3f3f46] mx-1" />

        {/* Link */}
        <button type="button" className={`${btnCls} ${editor.isActive("link") ? activeCls : ""}`} onClick={setLink} title="Link">🔗</button>

        {/* Image upload */}
        <button
          type="button"
          className={btnCls}
          title="Inserir imagem"
          onClick={() => fileInputRef.current?.click()}
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
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
