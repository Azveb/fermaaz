"use client";
import { useState, useEffect, useRef } from "react";

export default function CategorySelector({ categories, defaultValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState({});
  const dropdownRef = useRef(null);

  // Find selected category and automatically expand its parent
  useEffect(() => {
    if (!defaultValue) {
      setSelected(null);
      return;
    }
    let found = false;
    for (const c of categories) {
      if (c.slug === defaultValue) {
        setSelected({ id: c.id, name: c.nameAz, icon: c.icon, slug: c.slug, isParent: true });
        setExpanded(prev => ({ ...prev, [c.id]: true }));
        found = true;
        break;
      }
      for (const ch of c.children) {
        if (ch.slug === defaultValue) {
          setSelected({ id: ch.id, name: ch.nameAz, icon: c.icon, parentId: c.id, slug: ch.slug, isParent: false });
          setExpanded(prev => ({ ...prev, [c.id]: true }));
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }, [defaultValue, categories]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (slug, name, icon, isParent, id, parentId) => {
    setSelected(slug ? { id, name, icon, slug, isParent, parentId } : null);
    setIsOpen(false);
  };

  const toggleExpand = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Hidden Input for Form Submission */}
      <input type="hidden" name="category" value={selected?.slug || ""} />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-[var(--border)] bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all duration-300 select-none cursor-pointer"
      >
        <span className="flex items-center gap-2 text-gray-700 font-medium truncate">
          {selected ? (
            <>
              <span className="text-base">{selected.icon || "🌾"}</span>
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <span className="text-gray-400">Bütün kateqoriyalar</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown Box */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 max-h-80 overflow-y-auto bg-white/95 backdrop-blur-md border border-gray-150 rounded-2xl shadow-xl z-50 p-1.5 scrollbar-thin">
          {/* Default option */}
          <button
            type="button"
            onClick={() => handleSelect("", "Bütün kateqoriyalar", null, false)}
            className={`w-full flex items-center px-3 py-2.5 text-sm rounded-xl transition-all text-left font-semibold ${
              !selected ? "bg-brand-50 text-brand-700 font-bold" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            📂 Bütün kateqoriyalar
          </button>

          {/* Categories list */}
          {categories.map((c) => {
            const isParentSelected = selected?.slug === c.slug;
            const isExpanded = !!expanded[c.id];
            const hasChildren = c.children && c.children.length > 0;

            return (
              <div key={c.id} className="mt-1 border-t border-gray-50 pt-1 first:border-0 first:pt-0">
                {/* Parent Row Container */}
                <div className="flex items-center justify-between gap-1 w-full rounded-xl hover:bg-gray-50 transition-all pr-1">
                  {/* Parent select action */}
                  <button
                    type="button"
                    onClick={() => handleSelect(c.slug, c.nameAz, c.icon, true, c.id)}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl transition-all text-left truncate ${
                      isParentSelected ? "bg-brand-50/80 text-brand-700" : "text-gray-900"
                    }`}
                  >
                    <span className="text-base shrink-0">{c.icon || "🌾"}</span>
                    <span className="truncate">{c.nameAz}</span>
                  </button>

                  {/* Accordion Toggle Chevron (only if category has children) */}
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(c.id, e)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200/60 text-gray-400 hover:text-gray-700 transition-all shrink-0 ${
                        isExpanded ? "bg-gray-100/50 text-gray-600" : ""
                      }`}
                    >
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Subcategories (Children Accordion) */}
                {hasChildren && isExpanded && (
                  <div className="pl-3 mt-1 border-l-2 border-brand-200 ml-6 flex flex-col gap-0.5 animate-fade-in">
                    {c.children.map((ch) => {
                      const isChildSelected = selected?.slug === ch.slug;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => handleSelect(ch.slug, ch.nameAz, c.icon, false, ch.id, c.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left ${
                            isChildSelected
                              ? "bg-brand-50/70 text-brand-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <span className="text-gray-400">↳</span>
                          <span className="truncate">{ch.nameAz}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
