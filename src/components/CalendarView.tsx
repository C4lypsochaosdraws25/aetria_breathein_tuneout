import React, { useState } from "react";
import { Task, Tag } from "../types";
import { Calendar, ChevronLeft, ChevronRight, ListPlus } from "lucide-react";

interface CalendarViewProps {
  tasks: Task[];
  tags: Tag[];
  simulatedDate: string; // YYYY-MM-DD
  onCreateTaskOnDate: (date: string, isDeadline: boolean) => void;
  onSelectTask: (task: Task) => void;
  isDark?: boolean;
  primaryColor?: string;
  lightAccentClass?: string;
  cardClass?: string;
  bannerClass?: string;
  accentClass?: string;
}

export default function CalendarView({
  tasks,
  tags,
  simulatedDate,
  onCreateTaskOnDate,
  onSelectTask,
  isDark = false,
  primaryColor = "#3B82F6",
  lightAccentClass = "bg-blue-50 text-blue-600",
  cardClass = "bg-white border-slate-200 text-slate-800 shadow-xs",
  bannerClass = "bg-slate-50 border-slate-200",
  accentClass = "bg-blue-600 hover:bg-blue-700 text-white"
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  
  // Navigation for month view
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date(simulatedDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const changeMonth = (offset: number) => {
    const newD = new Date(currentMonthDate);
    newD.setMonth(newD.getMonth() + offset);
    setCurrentMonthDate(newD);
  };

  const getDaysInMonthGrid = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of Month
    const firstDay = new Date(year, month, 1);
    const firstDayIndex = firstDay.getDay(); // 0 is Sunday, etc.
    
    // Total days in month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const grid = [];
    
    // filler days from previous month
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthTotalDays - i);
      grid.push({
        date: prevDate,
        isCurrentMonth: false,
        dateStr: prevDate.toISOString().split("T")[0]
      });
    }

    // actual days of current month
    for (let i = 1; i <= totalDays; i++) {
      const currDate = new Date(year, month, i);
      grid.push({
        date: currDate,
        isCurrentMonth: true,
        dateStr: currDate.toISOString().split("T")[0]
      });
    }

    // filler days from next month
    const totalSlots = 42; // standard 6 rows
    const nextDaysNeeded = totalSlots - grid.length;
    for (let i = 1; i <= nextDaysNeeded; i++) {
      const nextDate = new Date(year, month + 1, i);
      grid.push({
        date: nextDate,
        isCurrentMonth: false,
        dateStr: nextDate.toISOString().split("T")[0]
      });
    }

    return grid;
  };

  // Days list for Week view starting around the simulated current date
  const getDaysInWeekGrid = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay();
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - dayOfWeek);

    const weekGrid = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekGrid.push({
        date: day,
        isCurrentMonth: true,
        dateStr: day.toISOString().split("T")[0]
      });
    }
    return weekGrid;
  };

  const monthGrid = getDaysInMonthGrid(currentMonthDate);
  const weekGrid = getDaysInWeekGrid(simulatedDate);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const gridToUse = viewMode === "month" ? monthGrid : weekGrid;

  // Filter tasks starting or terminating on specific day
  const getTasksOnDate = (dateStr: string) => {
    return tasks.map(t => {
      const isStart = t.startDate === dateStr;
      const isDeadline = t.deadline === dateStr;
      return { task: t, isStart, isDeadline };
    }).filter(item => item.isStart || item.isDeadline);
  };

  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${cardClass}`} id="academic-calendar-view">
      {/* Visual Controls Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4 mb-4 ${isDark ? "border-slate-800/60" : "border-slate-100"}`}>
        <div className="flex items-center gap-2">
          <Calendar style={{ color: primaryColor }} size={20} />
          <h3 className="font-bold text-sm" style={{ color: isDark ? "#fff" : "#1e293b" }}>
            {viewMode === "month"
              ? `${months[currentMonthDate.getMonth()]} ${currentMonthDate.getFullYear()}`
              : `Current Weekly Tracker`}
          </h3>
        </div>

        <div className={`flex items-center gap-2 p-1 rounded-lg self-start ${isDark ? "bg-slate-900/60 border border-slate-800/80" : "bg-slate-100 border border-slate-200/50"}`}>
          <button
            onClick={() => setViewMode("month")}
            className={`text-xs px-2.5 py-1 rounded font-semibold transition-all duration-200 cursor-pointer ${
              viewMode === "month" ? `${accentClass} shadow-2xs` : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Month View
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`text-xs px-2.5 py-1 rounded font-semibold transition-all duration-200 cursor-pointer ${
              viewMode === "week" ? `${accentClass} shadow-2xs` : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Week View
          </button>
        </div>

        {viewMode === "month" && (
          <div className="flex gap-1.5">
            <button
              onClick={() => changeMonth(-1)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isDark 
                  ? "bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-slate-300" 
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-650"
              }`}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => {
                const today = new Date(simulatedDate);
                setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
              }}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                isDark 
                  ? "bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-slate-300" 
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-650"
              }`}
            >
              Simulated Month
            </button>
            <button
              onClick={() => changeMonth(1)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isDark 
                  ? "bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-slate-300" 
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-650"
              }`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wider mb-2.5 opacity-80" style={{ color: primaryColor }}>
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Days Grid Rendering */}
      <div className="grid grid-cols-7 gap-1">
        {gridToUse.map((slot, index) => {
          const dayTasks = getTasksOnDate(slot.dateStr);
          const isToday = slot.dateStr === simulatedDate;
          
          return (
            <div
              key={`${slot.dateStr}-${index}`}
              className={`min-h-[100px] border rounded-xl p-1.5 flex flex-col justify-between transition-colors ${
                slot.isCurrentMonth
                  ? isDark 
                    ? "bg-slate-900/40 border-slate-800/65" 
                    : "bg-white border-slate-200/50"
                  : isDark 
                  ? "bg-slate-950/20 border-slate-900 border-dashed opacity-40 text-slate-500" 
                  : "bg-slate-50/70 border-slate-150 border-dashed opacity-50 text-slate-400"
              } ${isToday ? `ring-2 ring-offset-2` : ""}`}
              style={{
                borderColor: isToday ? primaryColor : undefined,
                boxShadow: isToday ? `0 0 0 2px ${primaryColor}` : undefined
              }}
            >
              {/* Day info row */}
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? "text-white shadow-xs" : isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  style={{ backgroundColor: isToday ? primaryColor : undefined }}
                >
                  {slot.date.getDate()}
                </span>

                {/* Add Quick schedule task buttons */}
                <div className="flex gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => onCreateTaskOnDate(slot.dateStr, false)}
                    title="Schedule Task Start"
                    className={`p-0.5 rounded transition-colors ${isDark ? "hover:bg-slate-800 text-blue-400" : "hover:bg-blue-50 text-blue-600"}`}
                  >
                    <ListPlus size={11} />
                  </button>
                  <button
                    onClick={() => onCreateTaskOnDate(slot.dateStr, true)}
                    title="Set Task Deadline"
                    className={`p-0.5 rounded font-bold transition-colors ${isDark ? "hover:bg-slate-800" : "hover:bg-red-50"}`}
                  >
                    🚩
                  </button>
                </div>
              </div>

              {/* Tasks mapping inside days slots */}
              <div className="mt-1 space-y-1 flex-1 overflow-y-auto max-h-16 scrollbar-thin">
                {dayTasks.map((tItem, tIndex) => {
                  const tagColor = tItem.task.tags.length > 0 
                    ? (tags.find(tg => tg.id === tItem.task.tags[0])?.color || "#3B82F6")
                    : "#6B7280";
                  
                  return (
                    <button
                      key={`${tItem.task.id}-${tIndex}`}
                      id={`calendar-task-${tItem.task.id}`}
                      onClick={() => onSelectTask(tItem.task)}
                      className="w-full text-left font-sans truncate text-[9px] px-1 py-0.5 rounded leading-tight flex items-center gap-1 border cursor-pointer hover:scale-[1.02] transition-transform"
                      style={{
                        backgroundColor: `${tagColor}15`,
                        borderColor: `${tagColor}40`,
                        color: tagColor
                      }}
                    >
                      <span>{tItem.isStart ? "🟢" : "🔴"}</span>
                      <span className="font-bold truncate">{tItem.task.title}</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[8px] text-right text-slate-400 select-none pointer-events-none font-mono">
                {isToday ? "TODAY" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
