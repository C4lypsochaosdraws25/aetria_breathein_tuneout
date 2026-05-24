import React, { useState } from "react";
import { Habit, Tag } from "../types";
import { Check, Flame, Trophy, Plus, CalendarRange, Trash2 } from "lucide-react";

interface HabitTrackerProps {
  habits: Habit[];
  tags: Tag[];
  simulatedDate: string; // YYYY-MM-DD
  onSaveHabit: (habit: Habit) => void;
  onToggleHabit: (id: string, date: string) => void;
  onDeleteHabit: (id: string) => void;
  isDark?: boolean;
  primaryColor?: string;
  lightAccentClass?: string;
  cardClass?: string;
  bannerClass?: string;
  accentClass?: string;
}

export default function HabitTracker({
  habits,
  tags,
  simulatedDate,
  onSaveHabit,
  onToggleHabit,
  onDeleteHabit,
  isDark = false,
  primaryColor = "#3B82F6",
  lightAccentClass = "bg-blue-50 text-blue-600",
  cardClass = "bg-white border-slate-200 text-slate-800 shadow-xs",
  bannerClass = "bg-slate-50 border-slate-200",
  accentClass = "bg-blue-600 hover:bg-blue-700 text-white"
}: HabitTrackerProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newFreq, setNewFreq] = useState<"daily" | "weekly">("daily");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Calculate the past 7 dates to render as a visual completion timeline row
  const getPast7Days = (centerDateStr: string) => {
    const dates = [];
    const baseDate = new Date(centerDateStr);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  const datesRow = getPast7Days(simulatedDate);

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${dayNames[d.getDay()]} ${d.getDate()}`;
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const id = `habit-${Date.now()}`;
    const newHabit: Habit = {
      id,
      title: newTitle,
      frequency: newFreq,
      tags: selectedTags,
      completionHistory: []
    };

    onSaveHabit(newHabit);
    setNewTitle("");
    setSelectedTags([]);
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // Advanced streak calculator relative to the simulated current date!
  const calculateStreak = (habit: Habit, currentDateStr: string): number => {
    const completions = new Set(habit.completionHistory);
    let streak = 0;
    let checkDate = new Date(currentDateStr);

    // If marked completed today, start counting. If not today, check if completed yesterday.
    // If completed yesterday, countdown. If neither, streak is 0.
    const todayStr = checkDate.toISOString().split("T")[0];
    
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split("T")[0];

    let startCountingFrom: string | null = null;
    if (completions.has(todayStr)) {
      startCountingFrom = todayStr;
    } else if (completions.has(yesterdayStr)) {
      startCountingFrom = yesterdayStr;
    }

    if (!startCountingFrom) return 0;

    let searchDate = new Date(startCountingFrom);
    while (true) {
      const searchStr = searchDate.toISOString().split("T")[0];
      if (completions.has(searchStr)) {
        streak++;
        searchDate.setDate(searchDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <div className="space-y-6" id="habit-tracker-panel">
      {/* Creation form */}
      <div className={`border rounded-2xl p-5 ${bannerClass} ${isDark ? "text-slate-100" : "text-slate-800"}`}>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5" style={{ color: isDark ? "#fff" : "#1e293b" }}>
          <Plus size={16} style={{ color: primaryColor }} /> Start a New Daily/Weekly Habit
        </h3>
        <form onSubmit={handleCreateHabit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Study Flashcards, Drink 3L Water"
              className={`md:col-span-2 text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-550" : "bg-white border-slate-300 text-slate-850 placeholder-slate-400"
              }`}
            />
            <select
              value={newFreq}
              onChange={(e) => setNewFreq(e.target.value as "daily" | "weekly")}
              className={`text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-850"
              }`}
            >
              <option value="daily">Everyday (Daily)</option>
              <option value="weekly">Once a Week</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs block font-medium opacity-80">Categorise:</span>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => {
                const selected = selectedTags.includes(t.id);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => toggleTagSelection(t.id)}
                    className="text-[11px] px-2.5 py-1 rounded-full border transition-all"
                    style={{
                      borderColor: t.color,
                      backgroundColor: selected ? t.color : "transparent",
                      color: selected ? "#fff" : t.color
                    }}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className={`text-xs justify-center w-full rounded-lg py-2 font-semibold flex items-center gap-1 shadow-2xs ${accentClass}`}
          >
            Create Habit Goal
          </button>
        </form>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-medium">
            No habits generated yet. Introduce some healthy discipline above!
          </div>
        ) : (
          habits.map((habit) => {
            const streak = calculateStreak(habit, simulatedDate);
            return (
              <div
                key={habit.id}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-xs transition-shadow ${cardClass}`}
              >
                {/* Details left */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm" style={{ color: isDark ? "#fff" : "#1e293b" }}>{habit.title}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${lightAccentClass} ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                      {habit.frequency}
                    </span>
                  </div>
                  
                  {/* Tag badging */}
                  <div className="flex flex-wrap gap-1">
                    {habit.tags.map((tagId) => {
                      const t = tags.find((tg) => tg.id === tagId);
                      if (!t) return null;
                      return (
                        <span
                          key={tagId}
                          className="text-[9px] px-2 py-0.5 rounded-full text-white font-semibold"
                          style={{ backgroundColor: t.color }}
                        >
                          {t.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* completion days row in-middle */}
                <div className="flex gap-1.5 items-center">
                  <div className={`flex flex-col items-center mr-3 px-2.5 py-1 rounded-lg border ${
                    isDark 
                      ? "bg-orange-500/10 border-orange-500/25 text-orange-400" 
                      : "bg-orange-55/60 border-orange-100 text-orange-800"
                  }`}>
                    <span className="text-xs font-black flex items-center gap-0.5">
                      <Flame size={14} className="fill-orange-500 text-orange-500 animate-pulse" /> {streak}d
                    </span>
                    <span className="text-[9px] opacity-80 font-semibold uppercase">Streak</span>
                  </div>

                  <div className="flex gap-2">
                    {datesRow.map((dayDate) => {
                      const isCompleted = habit.completionHistory.includes(dayDate);
                      const isToday = dayDate === simulatedDate;
                      return (
                        <button
                          key={dayDate}
                          id={`toggle-habit-${habit.id}-${dayDate}`}
                          onClick={() => onToggleHabit(habit.id, dayDate)}
                          style={{
                            backgroundColor: isCompleted ? primaryColor : undefined,
                            borderColor: isCompleted ? primaryColor : undefined
                          }}
                          className={`flex flex-col items-center p-1.5 rounded-lg border text-center transition-all min-w-[44px] ${
                            isCompleted
                              ? "text-white shadow-xs scale-105 font-bold"
                              : isToday
                              ? `${lightAccentClass} font-semibold ring-1 ring-offset-1`
                              : isDark
                              ? "bg-slate-900 border-slate-800 text-slate-400"
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-[9px] block mb-0.5">{getDayLabel(dayDate).split(" ")[0]}</span>
                          <span className="text-[10px] block font-mono font-bold leading-none">
                            {getDayLabel(dayDate).split(" ")[1]}
                          </span>
                          <div className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center ${isCompleted ? 'bg-white/30' : isDark ? 'bg-slate-800' : 'bg-slate-200/50'}`}>
                            {isCompleted && <Check size={10} className="stroke-[3] text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Delete button */}
                  <button
                    id={`delete-habit-${habit.id}`}
                    onClick={() => onDeleteHabit(habit.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50/20 transition-colors ml-2 self-center"
                    title="Delete Habiting"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
