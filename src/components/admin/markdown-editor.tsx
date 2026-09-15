"use client";

import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";
import { MermaidDiagram } from "@/components/ui/mermaid-diagram";
import {
  Bold,
  Italic,
  Heading2,
  List,
  Link as LinkIcon,
  Code,
  Image as ImageIcon,
  GitGraph,
  Eye,
  Edit3,
  Loader2,
  Check,
  UploadCloud,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  bucket?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your project description in Markdown...",
  minHeight = "220px",
  bucket = "portfolio",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to insert text at current cursor selection
  const insertTextAtCursor = (prefix: string, suffix = "", defaultText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const updatedValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(updatedValue);

    // Restore focus and position cursor
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Upload an image file to Supabase Storage and insert markdown syntax
  const uploadAndInsertImage = async (file: File) => {
    try {
      setUploading(true);
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileExt = cleanName.split(".").pop();
      const randomPrefix = Math.random().toString(36).substring(2, 8);
      const filePath = `markdown/${Date.now()}-${randomPrefix}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const altText = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const markdownImage = `\n![${altText}](${data.publicUrl})\n`;

      insertTextAtCursor(markdownImage);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2500);
    } catch (err: unknown) {
      console.error("[MarkdownEditor] Upload error:", err);
      alert(err instanceof Error ? `Upload failed: ${err.message}` : "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // File input change handler
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadAndInsertImage(files[0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Clipboard paste handler (support pasting screenshots directly)
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          await uploadAndInsertImage(file);
          return;
        }
      }
    }
  };

  // Drag and drop handlers
  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && files[0].type.startsWith("image/")) {
      await uploadAndInsertImage(files[0]);
    }
  };

  // Insert Mermaid Template
  const handleInsertMermaid = () => {
    const template = `\n\`\`\`mermaid\ngraph TD\n    A[Client User] --> B[API Service]\n    B --> C[(Database)]\n    B --> D[AI Model Engine]\n\`\`\`\n`;
    insertTextAtCursor(template);
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
      {/* Editor Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 bg-neutral-50/80 px-3 py-2 gap-2">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-neutral-200/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === "write"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Edit3 size={13} />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === "preview"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
        </div>

        {/* Formatting Toolbar (Only active during Write mode) */}
        {activeTab === "write" && (
          <div className="flex items-center flex-wrap gap-1">
            <button
              type="button"
              onClick={() => insertTextAtCursor("**", "**", "bold text")}
              title="Bold"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-md transition-colors"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("*", "*", "italic text")}
              title="Italic"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-md transition-colors"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("\n## ", "\n", "Heading")}
              title="Heading 2"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-md transition-colors"
            >
              <Heading2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("\n- ", "\n", "List item")}
              title="Bullet List"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-md transition-colors"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("[", "](https://example.com)", "link title")}
              title="Insert Link"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-md transition-colors"
            >
              <LinkIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("\n```\n", "\n```\n", "code block")}
              title="Code Block"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-md transition-colors"
            >
              <Code size={15} />
            </button>

            <div className="h-4 w-px bg-neutral-300 mx-1" />

            {/* Mermaid Template Button */}
            <button
              type="button"
              onClick={handleInsertMermaid}
              title="Insert Mermaid Diagram"
              className="flex items-center gap-1 px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-xs font-medium transition-colors"
            >
              <GitGraph size={14} className="text-purple-600" />
              <span>Mermaid</span>
            </button>

            {/* Upload Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Upload & insert image"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                uploadSuccess
                  ? "bg-emerald-100 text-emerald-800"
                  : uploading
                  ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                  : "bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : uploadSuccess ? (
                <>
                  <Check size={13} />
                  <span>Inserted!</span>
                </>
              ) : (
                <>
                  <UploadCloud size={13} />
                  <span>Upload Image</span>
                </>
              )}
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>
        )}
      </div>

      {/* Editor Body */}
      {activeTab === "write" ? (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            placeholder={placeholder}
            style={{ minHeight }}
            className={`w-full p-4 text-sm font-mono leading-relaxed bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none resize-y transition-colors ${
              isDraggingOver ? "bg-cyan-50/50 border-2 border-dashed border-cyan-500" : ""
            }`}
          />
          {isDraggingOver && (
            <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none flex items-center justify-center">
              <div className="p-3 rounded-xl bg-white shadow-lg border border-cyan-300 text-xs font-semibold text-cyan-700 flex items-center gap-2">
                <ImageIcon size={18} />
                <span>Drop image to upload and insert markdown</span>
              </div>
            </div>
          )}
          <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50/50 text-[11px] text-neutral-500 flex justify-between items-center">
            <span>Tip: Drag & drop images or paste from clipboard (Ctrl+V) directly.</span>
            <span>{value.length} characters</span>
          </div>
        </div>
      ) : (
        /* Live Preview Tab */
        <div
          style={{ minHeight }}
          className="p-5 overflow-y-auto bg-white text-sm leading-relaxed text-neutral-700"
        >
          {value.trim() ? (
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold text-neutral-900 mt-5 mb-2 pb-1 border-b border-neutral-100">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold text-neutral-900 mt-4 mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-neutral-900 mt-3 mb-1.5">{children}</h3>
                ),
                p: ({ children }) => <p className="mb-3 leading-relaxed text-neutral-600 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-neutral-900">{children}</strong>,
                em: ({ children }) => <em className="italic text-neutral-700">{children}</em>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1 text-neutral-600">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-neutral-600">{children}</ol>,
                li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-neutral-900 underline font-medium hover:text-black transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-3 border-neutral-300 pl-3.5 py-1 my-3 text-neutral-500 italic bg-neutral-50 rounded-r">
                    {children}
                  </blockquote>
                ),
                img: ({ src, alt }) => (
                  <div className="my-4">
                    <img
                      src={src}
                      alt={alt || "Project Image"}
                      className="w-full max-h-[420px] object-cover rounded-xl border border-neutral-200/80 shadow-xs"
                      loading="lazy"
                    />
                    {alt && <p className="text-xs text-neutral-500 text-center mt-1.5 italic">{alt}</p>}
                  </div>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  const match = /language-(\w+)/.exec(className || "");
                  if (!isInline && match && match[1] === "mermaid") {
                    return <MermaidDiagram chart={String(children).replace(/\n$/, "")} />;
                  }
                  return isInline ? (
                    <code className="bg-neutral-100 text-neutral-800 text-xs px-1.5 py-0.5 rounded font-mono border border-neutral-200/80">
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-neutral-900 text-neutral-100 text-xs p-3.5 rounded-xl overflow-x-auto font-mono my-3 shadow-inner">
                      <code>{children}</code>
                    </pre>
                  );
                },
              }}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-neutral-400 italic text-center py-8">
              Nothing to preview. Switch to the Write tab to add content.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
