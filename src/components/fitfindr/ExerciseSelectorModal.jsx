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
      className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="flex h-[85dvh] w-full max-w-2xl flex-col rounded-t-[2rem] sm:rounded-[2.5rem] border border-white/10 bg-slate-900/90 backdrop-blur-2xl shadow-2xl sm:h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-xl font-black text-white">Select Exercise</h2>
            <p className="text-xs text-slate-400 font-medium">For accurate AI analysis</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* content */}
        <div className="flex-1 overflow-hidden flex flex-col px-6">
          {/* Search */}
          <div className="py-4">
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-3.5 transition-all focus-within:bg-white/10 focus-within:border-white/20">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search exercises..."
                className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto min-h-0 pb-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {CATEGORY_ORDER.map((category) => {
              const subgroups = groupedExercises.get(category);
              if (!subgroups || subgroups.size === 0) return null;
              const isExpanded = expandedCategories[category];

              return (
                <div key={category} className="overflow-hidden rounded-[2rem] border border-white/5 bg-slate-950/30">
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(category)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
                    aria-expanded={isExpanded}
                  >
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{category}</span>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-white/10' : ''}`}>
                      <ChevronDown className="h-3 w-3 text-slate-300" />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-4">
                      {Array.from(subgroups.entries()).map(([subcategory, items]) => (
                        <div key={`${category}-${subcategory}`}>
                          {subcategory !== "Other" && (
                            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              {subcategory}
                            </p>
                          )}
                          <div className="space-y-1">
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
                                  className={`flex w-full items-center justify-between rounded-[1.2rem] px-4 py-3 text-left transition-all ${isSelected
                                    ? "bg-blue-600 shadow-lg shadow-blue-900/20"
                                    : "hover:bg-white/5 text-slate-300 hover:text-white"
                                    }`}
                                >
                                  <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>{exercise.name}</span>
                                  {isSelected && <div className="bg-white/20 rounded-full p-1"><Check className="h-3 w-3 text-white" /></div>}
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
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Search className="h-5 w-5 text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-400">No exercises found</p>
              </div>
            )}

            {/* Other / Custom Option */}
            <div className={`overflow-hidden rounded-[2rem] border transition-all duration-300 ${selectedId === "other" ? 'border-blue-500/30 bg-slate-950/30' : 'border-white/5 bg-slate-950/30'}`}>
              <button
                type="button"
                onClick={() => setSelectedId("other")}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
              >
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Custom Exercise</span>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${selectedId === "other" ? 'border-blue-500 bg-blue-500' : 'border-white/10 bg-white/5'}`}>
                  <Check className={`h-3 w-3 ${selectedId === "other" ? 'text-white' : 'text-transparent'}`} />
                </div>
              </button>
              {selectedId === "other" && (
                <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 fade-in duration-200">
                  <input
                    type="text"
                    value={customName}
                    onChange={(event) => setCustomName(event.target.value)}
                    placeholder="Enter exercise name..."
                    className="w-full rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/10 transition-all"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-slate-900/50 rounded-b-[2.5rem]">
          <Button
            onClick={handleConfirm}
            disabled={selectedId === "other" && !customName.trim()}
            className="w-full h-14 rounded-[1.8rem] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
          >
            Confirm Selection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseSelectorModal;
