import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Search, ChevronDown, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_ORDER = ["Strength", "Bodyweight", "Cardio", "Sports", "Mobility / Rehab"];

const buildCategoryState = () =>
  CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = true;
    return acc;
  }, {});

const ExerciseSelectorModal = ({ isOpen, onClose, onConfirm, exercises, initialSelection }) => {
  const modalRef = useRef(null);
  const searchRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [customName, setCustomName] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(buildCategoryState);

  useEffect(() => {
    if (!isOpen) return;
    setSearchTerm("");
    setExpandedCategories(buildCategoryState());
    if (initialSelection?.source === "custom") {
      setSelectedId("other");
      setCustomName(initialSelection.name);
    } else if (initialSelection?.source === "list") {
      setSelectedId(initialSelection.id || null);
      setCustomName("");
    } else {
      setSelectedId(null);
      setCustomName("");
    }
  }, [isOpen, initialSelection]);

  useEffect(() => {
    if (!isOpen) return;
    const previousActive = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => searchRef.current?.focus());

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      if (previousActive && typeof previousActive.focus === "function") {
        previousActive.focus();
      }
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (searchTerm.trim()) {
      setExpandedCategories(buildCategoryState());
    }
  }, [searchTerm]);

  const filteredExercises = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return exercises;
    return exercises.filter((exercise) => {
      if (exercise.name.toLowerCase().includes(term)) return true;
      return exercise.aliases?.some((alias) => alias.includes(term));
    });
  }, [exercises, searchTerm]);

  const groupedExercises = useMemo(() => {
    const grouped = new Map();
    filteredExercises.forEach((exercise) => {
      if (!grouped.has(exercise.category)) {
        grouped.set(exercise.category, new Map());
      }
      const subgroups = grouped.get(exercise.category);
      const subcategory = exercise.subcategory || "Other";
      if (!subgroups.has(subcategory)) {
        subgroups.set(subcategory, []);
      }
      subgroups.get(subcategory).push(exercise);
    });
    grouped.forEach((subgroups) => {
      subgroups.forEach((items) => {
        items.sort((a, b) => a.name.localeCompare(b.name));
      });
    });
    return grouped;
  }, [filteredExercises]);

  const handleToggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleConfirm = () => {
    if (selectedId === "other") {
      const trimmed = customName.trim();
      if (!trimmed) return;
      onConfirm({ source: "custom", name: trimmed });
      return;
    }
    if (!selectedId) {
      onConfirm(null);
      return;
    }
    const selectedExercise = exercises.find((exercise) => exercise.id === selectedId);
    if (!selectedExercise) {
      onConfirm(null);
      return;
    }
    onConfirm({ source: "list", name: selectedExercise.name, id: selectedExercise.id });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="mx-auto flex h-full w-full max-w-5xl flex-col px-6 py-6 text-white"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Select Your Exercise</h2>
            <p className="mt-1 text-sm text-slate-300">This helps improve movement analysis.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10"
            aria-label="Close exercise selector"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search exercises"
              className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="mt-6 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            {CATEGORY_ORDER.map((category) => {
              const subgroups = groupedExercises.get(category);
              if (!subgroups || subgroups.size === 0) return null;
              const isExpanded = expandedCategories[category];
              return (
                <div key={category} className="mb-4 last:mb-0">
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(category)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-left text-sm font-bold uppercase tracking-[0.2em] text-slate-300"
                    aria-expanded={isExpanded}
                  >
                    <span>{category}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="mt-3 space-y-4">
                      {Array.from(subgroups.entries()).map(([subcategory, items]) => (
                        <div key={`${category}-${subcategory}`}>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                            {subcategory}
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {items.map((exercise) => {
                              const isSelected = selectedId === exercise.id;
                              return (
                                <button
                                  type="button"
                                  key={exercise.id}
                                  onClick={() => {
                                    setSelectedId(exercise.id);
                                    setCustomName("");
                                  }}
                                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                                    isSelected
                                      ? "border-blue-400/60 bg-blue-500/10 text-blue-100"
                                      : "border-white/10 bg-slate-950/60 text-slate-200 hover:border-white/30"
                                  }`}
                                >
                                  <span>{exercise.name}</span>
                                  {isSelected && <Check className="h-4 w-4" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredExercises.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-6 text-center text-sm text-slate-400">
                No exercises match that search.
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Other</p>
              <button
                type="button"
                onClick={() => setSelectedId("other")}
                className={`mt-3 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                  selectedId === "other"
                    ? "border-blue-400/60 bg-blue-500/10 text-blue-100"
                    : "border-white/10 bg-slate-950/60 text-slate-200 hover:border-white/30"
                }`}
              >
                <span>Other</span>
                {selectedId === "other" && <Check className="h-4 w-4" />}
              </button>
              {selectedId === "other" && (
                <input
                  type="text"
                  value={customName}
                  onChange={(event) => setCustomName(event.target.value)}
                  placeholder="Type your exercise name"
                  className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            Exercise selection is optional, but recommended for better analysis.
          </p>
          <Button
            onClick={handleConfirm}
            disabled={selectedId === "other" && !customName.trim()}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseSelectorModal;
