import React, { useState, useRef, useEffect } from "react";
import { FloatingNote, NoteListItem } from "../types";
import { Pin, Minimize2, Maximize2, Trash2, ListTodo, FileText, CheckSquare, Square, GripHorizontal } from "lucide-react";

interface FloatingNotesManagerProps {
  notes: FloatingNote[];
  onSaveNote: (note: FloatingNote) => void;
  onDeleteNote: (id: string) => void;
  isDark?: boolean;
  primaryColor?: string;
  lightAccentClass?: string;
  cardClass?: string;
  bannerClass?: string;
  accentClass?: string;
}

interface PastelColorTheme {
  title: string;
  bgClass: string;
  headerBgClass: string;
  textClass: string;
  inputTextClass: string;
  borderClass: string;
  accentBorderClass: string;
  btnHoverClass: string;
  placeholderClass: string;
  dragIconClass: string;
}

const PASTEL_COLORS: Record<string, PastelColorTheme> = {
  yellow: {
    title: "Warm Butter",
    bgClass: "bg-amber-100/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/40 text-amber-900 dark:text-amber-200",
    headerBgClass: "bg-amber-200/95 dark:bg-amber-900/50 border-b border-amber-300 dark:border-amber-900/40 text-amber-900 dark:text-amber-100",
    textClass: "text-amber-900 dark:text-amber-250",
    inputTextClass: "text-amber-950 dark:text-amber-50 focus:border-amber-400 dark:focus:border-amber-750",
    borderClass: "border-amber-350 dark:border-amber-900/40",
    accentBorderClass: "focus:border-amber-400 dark:focus:border-amber-700",
    btnHoverClass: "hover:bg-amber-300/50 dark:hover:bg-amber-805/50",
    placeholderClass: "placeholder-amber-700/40 dark:placeholder-amber-400/30",
    dragIconClass: "text-amber-600 dark:text-amber-400"
  },
  blue: {
    title: "Glacier Blue",
    bgClass: "bg-sky-100/90 dark:bg-sky-950/40 border-sky-300 dark:border-sky-900/40 text-sky-900 dark:text-sky-200",
    headerBgClass: "bg-sky-200/95 dark:bg-sky-900/50 border-b border-sky-300 dark:border-sky-900/40 text-sky-900 dark:text-sky-100",
    textClass: "text-sky-900 dark:text-sky-250",
    inputTextClass: "text-sky-950 dark:text-sky-50 focus:border-sky-400 dark:focus:border-sky-750",
    borderClass: "border-sky-350 dark:border-sky-900/40",
    accentBorderClass: "focus:border-sky-400 dark:focus:border-sky-700",
    btnHoverClass: "hover:bg-sky-300/50 dark:hover:bg-sky-805/50",
    placeholderClass: "placeholder-sky-700/40 dark:placeholder-sky-400/30",
    dragIconClass: "text-sky-600 dark:text-sky-400"
  },
  green: {
    title: "Mint Matcha",
    bgClass: "bg-emerald-100/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200",
    headerBgClass: "bg-emerald-200/95 dark:bg-emerald-900/50 border-b border-emerald-300 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-100",
    textClass: "text-emerald-900 dark:text-emerald-250",
    inputTextClass: "text-emerald-950 dark:text-emerald-50 focus:border-emerald-400 dark:focus:border-emerald-750",
    borderClass: "border-emerald-350 dark:border-emerald-900/40",
    accentBorderClass: "focus:border-emerald-400 dark:focus:border-emerald-700",
    btnHoverClass: "hover:bg-emerald-300/50 dark:hover:bg-emerald-805/50",
    placeholderClass: "placeholder-emerald-700/40 dark:placeholder-emerald-400/30",
    dragIconClass: "text-emerald-600 dark:text-emerald-400"
  },
  pink: {
    title: "Blossom Pink",
    bgClass: "bg-rose-100/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/40 text-rose-900 dark:text-rose-200",
    headerBgClass: "bg-rose-200/95 dark:bg-rose-900/50 border-b border-rose-300 dark:border-rose-900/40 text-rose-900 dark:text-rose-100",
    textClass: "text-rose-900 dark:text-rose-250",
    inputTextClass: "text-rose-950 dark:text-rose-50 focus:border-rose-400 dark:focus:border-rose-750",
    borderClass: "border-rose-355 dark:border-rose-900/40",
    accentBorderClass: "focus:border-rose-400 dark:focus:border-rose-700",
    btnHoverClass: "hover:bg-rose-300/50 dark:hover:bg-rose-805/50",
    placeholderClass: "placeholder-rose-700/40 dark:placeholder-rose-400/30",
    dragIconClass: "text-rose-600 dark:text-rose-400"
  },
  purple: {
    title: "Lilac Mist",
    bgClass: "bg-purple-100/90 dark:bg-purple-950/40 border-purple-300 dark:border-purple-900/40 text-purple-900 dark:text-purple-200",
    headerBgClass: "bg-purple-200/95 dark:bg-purple-900/50 border-b border-purple-300 dark:border-purple-900/40 text-purple-900 dark:text-purple-100",
    textClass: "text-purple-900 dark:text-purple-250",
    inputTextClass: "text-purple-950 dark:text-purple-50 focus:border-purple-400 dark:focus:border-purple-750",
    borderClass: "border-purple-355 dark:border-purple-900/40",
    accentBorderClass: "focus:border-purple-400 dark:focus:border-purple-700",
    btnHoverClass: "hover:bg-purple-300/50 dark:hover:bg-purple-805/50",
    placeholderClass: "placeholder-purple-700/40 dark:placeholder-purple-400/30",
    dragIconClass: "text-purple-600 dark:text-purple-400"
  },
  orange: {
    title: "Peach Coral",
    bgClass: "bg-orange-100/90 dark:bg-orange-950/40 border-orange-300 dark:border-orange-900/40 text-orange-900 dark:text-orange-200",
    headerBgClass: "bg-orange-200/95 dark:bg-orange-900/50 border-b border-orange-300 dark:border-orange-900/40 text-orange-900 dark:text-orange-100",
    textClass: "text-orange-900 dark:text-orange-250",
    inputTextClass: "text-orange-950 dark:text-orange-50 focus:border-orange-400 dark:focus:border-orange-750",
    borderClass: "border-orange-355 dark:border-orange-900/40",
    accentBorderClass: "focus:border-orange-400 dark:focus:border-orange-700",
    btnHoverClass: "hover:bg-orange-300/50 dark:hover:bg-orange-850/50",
    placeholderClass: "placeholder-orange-700/40 dark:placeholder-orange-400/30",
    dragIconClass: "text-orange-600 dark:text-orange-400"
  }
};

export default function FloatingNotesManager({
  notes,
  onSaveNote,
  onDeleteNote,
  isDark = false,
  primaryColor = "#696fc7",
  lightAccentClass = "bg-[#696fc7]/10 text-[#696fc7]",
  cardClass = "bg-white border-slate-200 text-slate-800 shadow-xs",
  bannerClass = "bg-slate-50 border-slate-200",
  accentClass = "bg-[#696fc7] hover:bg-[#585db2] text-white"
}: FloatingNotesManagerProps) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const notesRef = useRef(notes);
  const onSaveNoteRef = useRef(onSaveNote);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    onSaveNoteRef.current = onSaveNote;
  }, [onSaveNote]);

 useEffect(() => {
  if (!activeDragId) return;

  const handleMove = (clientX: number, clientY: number) => {
    const note = notesRef.current.find((n) => n.id === activeDragId);
    if (!note) return;

    const rect = containerRef.current?.getBoundingClientRect();
    const containerLeft = rect ? rect.left : 0;
    const containerTop = rect ? rect.top : 0;

    const newX = clientX - containerLeft - dragOffsetRef.current.x;
    const newY = clientY - containerTop - dragOffsetRef.current.y;

    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const boundedX = Math.max(0, Math.min(containerWidth - 100, newX));
    const boundedY = Math.max(0, newY);

    onSaveNoteRef.current({
      ...note,
      position: { x: boundedX, y: boundedY }
    });
  };

  const handlePointerMove = (e: PointerEvent) => {
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleEnd = () => setActiveDragId(null);

  window.addEventListener("pointermove", handlePointerMove, { passive: false });
  window.addEventListener("pointerup", handleEnd);
  window.addEventListener("pointercancel", handleEnd);
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleEnd);

  return () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handleEnd);
    window.removeEventListener("pointercancel", handleEnd);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleEnd);
  };
}, [activeDragId]);

const startDrag = (e: React.PointerEvent | React.TouchEvent, note: FloatingNote) => {
  const target = e.target as HTMLElement;
  if (target.closest("input") || target.closest("button")) return;

  let clientX: number;
  let clientY: number;

  if ("touches" in e) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
    try {
      (e.target as HTMLElement).setPointerCapture((e as React.PointerEvent).pointerId);
    } catch (_) {}
  }

  const rect = containerRef.current?.getBoundingClientRect();
  const containerLeft = rect ? rect.left : 0;
  const containerTop = rect ? rect.top : 0;

  dragOffsetRef.current = {
    x: clientX - containerLeft - note.position.x,
    y: clientY - containerTop - note.position.y
  };

  setActiveDragId(note.id);
  e.preventDefault();
};

const stopDrag = () => setActiveDragId(null);

  const handleCreateNote = (isList: boolean) => {
    const ColorsArray = ["yellow", "blue", "green", "pink", "purple", "orange"];
    const chosenColor = ColorsArray[notes.length % ColorsArray.length];
    const id = `note-${Date.now()}`;
    const newNote: FloatingNote = {
      id,
      title: isList ? "📝 New List Note" : "📝 New Text Note",
      isList,
      listItems: isList
        ? [
            { id: `item-${Date.now()}-1`, text: "Checklist item 1", checked: false, type: "checkbox" },
            { id: `item-${Date.now()}-2`, text: "Bullet point 2", checked: false, type: "bullet" }
          ]
        : [],
      text: isList ? "" : "Write some student ideas here...",
      position: { x: 50 + (notes.length * 20) % 300, y: 150 + (notes.length * 20) % 200 },
      width: 320,
      height: 250,
      isMinimized: false,
      color: chosenColor
    };
    onSaveNote(newNote);
  };

  const updateNoteTitle = (note: FloatingNote, newTitle: string) => {
    onSaveNote({ ...note, title: newTitle });
  };

  const updateNoteText = (note: FloatingNote, newText: string) => {
    onSaveNote({ ...note, text: newText });
  };

  const toggleMinimize = (note: FloatingNote) => {
    onSaveNote({ ...note, isMinimized: !note.isMinimized });
  };

  const updateNoteColor = (note: FloatingNote, newColor: string) => {
    onSaveNote({ ...note, color: newColor });
  };

  const addListItem = (note: FloatingNote, type: "bullet" | "checkbox") => {
    const newItem: NoteListItem = {
      id: `item-${Date.now()}`,
      text: "",
      checked: false,
      type
    };
    const updatedItems = note.listItems ? [...note.listItems, newItem] : [newItem];
    onSaveNote({ ...note, listItems: updatedItems });
  };

  const updateListItemText = (note: FloatingNote, itemId: string, text: string) => {
    const updatedItems = note.listItems.map((item) =>
      item.id === itemId ? { ...item, text } : item
    );
    onSaveNote({ ...note, listItems: updatedItems });
  };

  const toggleListItemCheck = (note: FloatingNote, itemId: string) => {
    const updatedItems = note.listItems.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onSaveNote({ ...note, listItems: updatedItems });
  };

  const removeListItem = (note: FloatingNote, itemId: string) => {
    const updatedItems = note.listItems.filter((item) => item.id !== itemId);
    onSaveNote({ ...note, listItems: updatedItems });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[580px]"
    >
      {/* Sticky Notes Quick Spawn Bar (Fully adapters responsive per Theme colors) */}
      <div className={`flex flex-col sm:flex-row gap-3 mb-4 rounded-2xl p-4 items-center justify-between border transition-all duration-300 ${
        isDark 
          ? "bg-slate-900/60 border-slate-800/80 text-slate-300" 
          : "bg-white/80 backdrop-blur-md border-slate-200/60 text-slate-705"
      }`}>
        <div className="text-xs font-semibold flex items-center gap-1.5 leading-relaxed">
          <Pin size={15} style={{ color: primaryColor }} className="animate-pulse" />
          <span>Need to snapshot a dynamic thought? Spawn draggable, custom pastel sticky notes:</span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleCreateNote(true)}
            className="text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer hover:scale-[1.015] active:scale-95 flex-1 sm:flex-initial"
            style={{
              backgroundColor: isDark ? `${primaryColor}22` : `${primaryColor}13`,
              color: primaryColor,
              border: `1.5px solid ${primaryColor}40`
            }}
          >
            <ListTodo size={14} /> + Checklist Note
          </button>
          <button
            onClick={() => handleCreateNote(false)}
            className="text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer hover:scale-[1.015] active:scale-95 flex-1 sm:flex-initial"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              color: isDark ? "#e2e8f0" : "#334155",
              border: isDark ? "1.5px solid rgba(255,255,255,0.15)" : "1.5px solid rgba(0,0,0,0.12)"
            }}
          >
            <FileText size={14} /> + Plain Note
          </button>
        </div>
      </div>

      {/* Floating Notes Renders */}
      {notes.map((note) => {
        const colorName = note.color || "yellow";
        const cTheme = PASTEL_COLORS[colorName] || PASTEL_COLORS.yellow;

        return (
          <div
            key={note.id}
            className={`${cTheme.bgClass} rounded-2xl shadow-xl overflow-hidden transition-all duration-150 ${
              activeDragId === note.id ? "shadow-2xl ring-2" : ""
            }`}
            style={{
              position: "absolute",
              left: `${note.position.x}px`,
              top: `${note.position.y}px`,
              width: `${note.width || 320}px`,
              zIndex: activeDragId === note.id ? 200 : 30,
              boxShadow: activeDragId === note.id ? "0 25px 50px -12px rgba(0,0,0,0.5)" : undefined,
              borderColor: activeDragId === note.id ? primaryColor : undefined
            }}
          >
            {/* Header drag-zone */}<div
              onPointerDown={(e) => startDrag(e, note)}
              onTouchStart={(e) => startDrag(e, note)}
              onPointerUp={stopDrag}
              className={`note-header-drag-handle ${cTheme.headerBgClass} px-3 py-2.5 cursor-grab active:cursor-grabbing flex items-center justify-between transition-colors touch-none select-none`}
            >
              
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <GripHorizontal size={14} className={`${cTheme.dragIconClass} flex-shrink-0`} />
                <input
                  type="text"
                  value={note.title}
                  onChange={(e) => updateNoteTitle(note, e.target.value)}
                  className={`font-bold text-xs bg-transparent border-none p-0 focus:outline-none focus:ring-0 ${cTheme.inputTextClass} w-full leading-none`}
                />
              </div>

              {/* Minimalist pastel color dot pickers */}
              <div className="flex items-center gap-1 mx-2 flex-shrink-0">
                {Object.keys(PASTEL_COLORS).map((c) => {
                  const isSelected = colorName === c;
                  return (
                    <button
                      key={c}
                      onClick={() => updateNoteColor(note, c)}
                      className="h-2.5 w-2.5 rounded-full transition-all border border-black/10 hover:scale-125 cursor-pointer active:scale-90"
                      style={{
                        backgroundColor: c === 'yellow' ? '#fde047' : c === 'pink' ? '#ffa8a8' : c === 'blue' ? '#7dd3fc' : c === 'green' ? '#6ee7b7' : c === 'purple' ? '#e9d5ff' : '#fdba74',
                        boxShadow: isSelected ? 'inset 0 0 0 1.5px rgba(0,0,0,0.8)' : undefined,
                        transform: isSelected ? 'scale(1.15)' : undefined
                      }}
                      title={`Style: ${PASTEL_COLORS[c].title}`}
                    />
                  );
                })}
              </div>
              
              <div className="flex gap-1.5 items-center pl-1 flex-shrink-0">
                <button
                  onClick={() => toggleMinimize(note)}
                  className={`p-0.5 rounded cursor-pointer transition-colors ${cTheme.btnHoverClass}`}
                  title={note.isMinimized ? "Maximize" : "Minimize"}
                >
                  {note.isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
                </button>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className={`p-0.5 rounded cursor-pointer text-red-650 hover:text-red-800 transition-colors ${cTheme.btnHoverClass}`}
                  title="Delete note"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Body Content */}
            {!note.isMinimized && (
              <div className="p-3.5 text-xs">
                {note.isList ? (
                  <div className="space-y-3.5">
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {note.listItems && note.listItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          {item.type === "checkbox" ? (
                            <button
                              onClick={() => toggleListItemCheck(note, item.id)}
                              className="focus:outline-none cursor-pointer flex-shrink-0 transition-transform active:scale-90"
                            >
                              {item.checked ? (
                                <CheckSquare size={14} className="text-emerald-600 dark:text-emerald-450 stroke-[2.5]" />
                              ) : (
                                <Square size={14} className="opacity-80" />
                              )}
                            </button>
                          ) : (
                            <span className="font-bold px-1 select-none pointer-events-none text-current opacity-75">•</span>
                          )}
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => updateListItemText(note, item.id, e.target.value)}
                            placeholder="List item..."
                            className={`bg-transparent border-b border-transparent focus:border-black/15 dark:focus:border-white/15 w-full p-0 focus:outline-none focus:ring-0 ${
                              item.checked && item.type === "checkbox" ? "line-through opacity-45" : ""
                            }`}
                          />
                          <button
                            onClick={() => removeListItem(note, item.id)}
                            className="opacity-40 hover:opacity-100 hover:text-red-500 p-0.5 text-sm leading-none transition-opacity font-bold cursor-pointer"
                            title="Remove bullet item"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Controllers */}
                    <div className="flex gap-2 border-t border-black/10 dark:border-white/10 pt-2.5 text-[10px]">
                      <button
                        onClick={() => addListItem(note, "checkbox")}
                        className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-0.5 transition-colors cursor-pointer ${cTheme.btnHoverClass}`}
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                      >
                        + Checkbox
                      </button>
                      <button
                        onClick={() => addListItem(note, "bullet")}
                        className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-0.5 transition-colors cursor-pointer ${cTheme.btnHoverClass}`}
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                      >
                        + Bullet
                      </button>
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={note.text}
                    onChange={(e) => updateNoteText(note, e.target.value)}
                    className="w-full h-32 bg-transparent border-none p-0 focus:outline-none focus:ring-0 resize-none leading-relaxed font-sans text-xs focus:ring-transparent focus:border-none focus:shadow-none placeholder-current/30"
                    placeholder="Type some thoughts down..."
                  />
                )}
                <div className="text-[9px] text-right opacity-50 select-none mt-2 font-mono">
                  Drag header to reposition
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
