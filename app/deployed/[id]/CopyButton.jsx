"use client";

import { Copy } from "lucide-react";

export default function CopyButton({ text }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // no-op: clipboard access can fail in unsupported or restricted contexts
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-2 hover:bg-gray-100 rounded-md transition-colors group"
      title="Copy to clipboard"
      aria-label="Copy deployment URL"
    >
      <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
    </button>
  );
}
