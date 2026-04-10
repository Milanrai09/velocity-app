"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Rocket, X, Loader2 } from "lucide-react";
import useDebounce from "./hooks/debounceHook";

export default function DeployedSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef(null);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/deployments/search?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error("Search request failed");
        return r.json();
      })
      .then((data) => {
        setSuggestions(Array.isArray(data) ? data : []);
        setActive(-1);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setSuggestions([]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!inputRef.current?.closest("[data-search-root]")?.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clear = () => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const selectSuggestion = (deployment) => {
    const label = deployment?.name || deployment?.projectSlug || "";
    setQuery(label);
    setSuggestions([]);
    setFocused(false);
    if (deployment?.id) router.push(`/deployed/${deployment.id}`);
  };

  const handleKey = (e) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, suggestions.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
    if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
    if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[active]);
    }
  };

  const showDropdown = focused && (loading || suggestions.length > 0);

  return (
    <div data-search-root className="relative w-full max-w-lg">
      <div
        className={`
          flex items-center gap-3 rounded-xl border px-4 py-2.5
          bg-(--surface-card)] transition-all duration-200
          ${focused
            ? "border-(--accent)] shadow-[0_0_0_3px_var(--accent)]/15"
            : "border-(--border-default)] hover:border-(--accent)]/40"
          }
        `}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-(--accent)] animate-spin shrink-0" />
        ) : (
          <Search className="w-4 h-4 text-(--text-muted)] shrink-0" />
        )}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKey}
          placeholder="Search deployments…"
          autoComplete="off"
          className="flex-1 bg-transparent text-sm text-(--text-strong)] placeholder:text-(--text-muted)] outline-none"
        />

        {query && (
          <button
            onClick={clear}
            className="rounded-md p-0.5 text-(--text-muted)] hover:text-(--text-strong)] hover:bg-(--accent)]/10 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {!query && !focused && (
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-(--border-default)] bg-(--surface-card-muted)] px-1.5 py-0.5 text-[10px] font-medium text-(--text-muted)]">
            ⌘K
          </kbd>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 overflow-hidden rounded-xl border border-(--border-default)] bg-(--surface-card)] shadow-xl">
          {loading && !suggestions.length ? (
            <div className="flex items-center gap-3 px-4 py-4 text-sm text-(--text-muted)]">
              <Loader2 className="w-4 h-4 animate-spin text-(--accent)]" />
              Searching…
            </div>
          ) : (
            <>
              <div className="border-b border-(--border-default)] px-4 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-(--text-muted)]">
                  {suggestions.length} result{suggestions.length !== 1 ? "s" : ""}
                </span>
              </div>

              <ul role="listbox" className="max-h-72 overflow-y-auto py-1.5">
                {suggestions.map((deployment, i) => (
                  <li
                    key={deployment.id}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => selectSuggestion(deployment)}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm
                      ${i === active
                        ? "bg-(--accent)]/10 text-(--accent)]"
                        : "text-(--text-strong)] hover:bg-(--surface-card-muted)]"
                      }
                    `}
                  >
                    <div className={`rounded-lg p-1.5 shrink-0 transition-colors ${i === active ? "bg-(--accent)]/15" : "bg-(--accent)]/8"}`}>
                      <Rocket className="w-3.5 h-3.5 text-(--accent)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block truncate font-medium">{deployment.name}</span>
                      <span className="block truncate text-xs text-(--text-muted)]">{deployment.projectSlug}</span>
                    </div>
                    {i === active && (
                      <kbd className="text-[10px] text-(--text-muted)] border border-(--border-default)] rounded px-1.5 py-0.5">
                        ↵
                      </kbd>
                    )}
                  </li>
                ))}
              </ul>

              <div className="border-t border-(--border-default)] px-4 py-2 flex items-center gap-3 text-[10px] text-(--text-muted)]">
                <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="font-mono">↵</kbd> select</span>
                <span><kbd className="font-mono">esc</kbd> close</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
