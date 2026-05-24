import React, { useState, useEffect, useRef } from "react";
import { PomodoroSettings } from "../types";
import { Play, Pause, RotateCcw, Volume2, Save, Sparkles, HelpCircle, Maximize2, Minimize2 } from "lucide-react";

interface PomodoroTimerProps {
  settings: PomodoroSettings;
  onUpdateSettings: (settings: PomodoroSettings) => void;
  onAddNotification: (message: string, type: "system" | "reminder") => void;
  isDark?: boolean;
  primaryColor?: string;
  lightAccentClass?: string;
  cardClass?: string;
  bannerClass?: string;
  accentClass?: string;
}

export default function PomodoroTimer({
  settings,
  onUpdateSettings,
  onAddNotification,
  isDark = false,
  primaryColor = "#3B82F6",
  lightAccentClass = "bg-blue-50 text-blue-600",
  cardClass = "bg-white border-slate-200 text-slate-800 shadow-xs",
  bannerClass = "bg-slate-50 border-slate-200",
  accentClass = "bg-blue-600 hover:bg-blue-700 text-white"
}: PomodoroTimerProps) {
  const [mode, setMode] = useState<"work" | "shortBreak" | "longBreak">("work");
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Immersive view and colors configurations
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenBg, setFullscreenBg] = useState<"charcoal" | "violet" | "forest" | "amber" | "rose" | "ocean">("charcoal");

  // Settings in temporary state for forms
  const [tempWork, setTempWork] = useState(settings.workDuration);
  const [tempShort, setTempShort] = useState(settings.shortBreakDuration);
  const [tempLong, setTempLong] = useState(settings.longBreakDuration);
  const [tempInterval, setTempInterval] = useState(settings.longBreakInterval);
  const [selectedSound, setSelectedSound] = useState(settings.soundName);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize on settings changes
  useEffect(() => {
    setTempWork(settings.workDuration);
    setTempShort(settings.shortBreakDuration);
    setTempLong(settings.longBreakDuration);
    setTempInterval(settings.longBreakInterval);
    setSelectedSound(settings.soundName);
    
    // reset timer if modified and not running
    if (!isRunning) {
      resetTimer(mode, settings);
    }
  }, [settings]);

  // Audio helper using SpeechSynthesis or built-in standard Audio Synthesis (synthesizer) to avoid third-party media assets failure!
  // This is a highly robust solution for sandboxed platforms!
  const triggerAudioAlarm = (soundType: string) => {
    if (soundType === "none") return;

    try {
      // Audio Synth Web API
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.connect(gain);
      gain.connect(context.destination);

      if (soundType === "bell") {
        // High pitched ring
        osc.frequency.setValueAtTime(880, context.currentTime); // A5
        osc.type = "sine";
        gain.gain.setValueAtTime(0.5, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1.5);
        osc.start();
        osc.stop(context.currentTime + 1.5);
      } else if (soundType === "digital") {
        // Double beep beep
        osc.frequency.setValueAtTime(1200, context.currentTime);
        osc.type = "square";
        gain.gain.setValueAtTime(0.3, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
        osc.start();
        osc.stop(context.currentTime + 0.3);

        const osc2 = context.createOscillator();
        const gain2 = context.createGain();
        osc2.connect(gain2);
        gain2.connect(context.destination);
        osc2.frequency.setValueAtTime(1200, context.currentTime + 0.3);
        osc2.type = "square";
        gain2.gain.setValueAtTime(0.3, context.currentTime + 0.3);
        gain2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
        osc2.start();
        osc2.stop(context.currentTime + 0.6);
      } else if (soundType === "chime") {
        // Arpeggiated melody
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
        notes.forEach((freq, idx) => {
          const oscNode = context.createOscillator();
          const gainNode = context.createGain();
          oscNode.connect(gainNode);
          gainNode.connect(context.destination);
          
          oscNode.type = "triangle";
          oscNode.frequency.setValueAtTime(freq, context.currentTime + idx * 0.15);
          gainNode.gain.setValueAtTime(0.3, context.currentTime + idx * 0.15);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + idx * 0.15 + 0.4);
          oscNode.start(context.currentTime + idx * 0.15);
          oscNode.stop(context.currentTime + idx * 0.15 + 0.5);
        });
      }
    } catch (e) {
      console.warn("Audio Context is blocked or not supported yet:", e);
    }
  };

  const getDurationInMinutes = (currentMode: typeof mode, settingsToUse: PomodoroSettings) => {
    switch (currentMode) {
      case "work": return settingsToUse.workDuration;
      case "shortBreak": return settingsToUse.shortBreakDuration;
      case "longBreak": return settingsToUse.longBreakDuration;
    }
  };

  const resetTimer = (targetMode = mode, settingsToUse = settings) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(targetMode);
    setTimeLeft(getDurationInMinutes(targetMode, settingsToUse) * 60);
  };

  const handleApplySettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PomodoroSettings = {
      workDuration: Math.max(1, tempWork),
      shortBreakDuration: Math.max(1, tempShort),
      longBreakDuration: Math.max(1, tempLong),
      longBreakInterval: Math.max(1, tempInterval),
      soundName: selectedSound,
      volume: settings.volume
    };
    onUpdateSettings(updated);
    resetTimer(mode, updated);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished!
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            triggerAudioAlarm(selectedSound);

            if (mode === "work") {
              const newCycles = cyclesCompleted + 1;
              setCyclesCompleted(newCycles);
              onAddNotification(`🎯 Session finished! Focus cycle completed block.`, "system");

              if (newCycles % settings.longBreakInterval === 0) {
                setMode("longBreak");
                setTimeLeft(settings.longBreakDuration * 60);
              } else {
                setMode("shortBreak");
                setTimeLeft(settings.shortBreakDuration * 60);
              }
            } else {
              // break finished
              setMode("work");
              setTimeLeft(settings.workDuration * 60);
              onAddNotification(`⏰ Break finished! Let's get back to work. Ready?`, "system");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, cyclesCompleted, settings, selectedSound]);

  // Formatter for time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper colors based on modes with dynamic adaptation for themes
  const modeColors = {
    work: {
      bg: isDark ? "bg-red-950/20 text-red-300" : "bg-red-50/70 text-red-800",
      border: isDark ? "border-red-900/50" : "border-red-200",
      text: isDark ? "text-red-400 font-bold" : "text-red-750 font-bold",
      btn: isDark ? "bg-red-900 hover:bg-red-800 text-white" : "bg-red-600 hover:bg-red-700 text-white"
    },
    shortBreak: {
      bg: isDark ? "bg-emerald-950/20 text-emerald-300" : "bg-emerald-50/70 text-emerald-800",
      border: isDark ? "border-emerald-900/50" : "border-emerald-200",
      text: isDark ? "text-emerald-400 font-bold" : "text-emerald-750 font-bold",
      btn: isDark ? "bg-emerald-900 hover:bg-emerald-800 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
    },
    longBreak: {
      bg: isDark ? "bg-blue-950/20 text-blue-300" : "bg-blue-50/70 text-blue-800",
      border: isDark ? "border-blue-900/50" : "border-blue-200",
      text: isDark ? "text-blue-400 font-bold" : "text-blue-750 font-bold",
      btn: isDark ? "bg-blue-900 hover:bg-blue-800 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
    }
  };

  const curColor = modeColors[mode];
  const maxTime = getDurationInMinutes(mode, settings) * 60;
  const progressPercent = maxTime > 0 ? ((maxTime - timeLeft) / maxTime) * 100 : 0;

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${cardClass} space-y-4`} id="pomodoro-timer-box">
      <div className="flex justify-between items-center pb-2 border-b border-slate-700/5 flex-wrap gap-2">
        <h3 className="font-bold flex items-center gap-1.5" style={{ color: primaryColor }}>
          <Sparkles size={18} /> Focus Pomodoro
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 cursor-pointer transition-all select-none ${
              isDark 
                ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300" 
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-650"
            }`}
            title="Open Immersive Focus Room"
          >
            <Maximize2 size={13} /> Clear Focus Room
          </button>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${
            isDark 
              ? "bg-slate-900/80 border-slate-800 text-slate-300" 
              : "bg-white/90 border-slate-205 text-slate-650"
          }`}>
            Cycle: {cyclesCompleted}
          </span>
        </div>
      </div>

      {/* Mode Switches */}
      <div className={`grid grid-cols-3 gap-1 p-1 rounded-lg border text-xs ${
        isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-slate-100 border-slate-205'
      }`}>
        <button
          onClick={() => resetTimer("work")}
          className={`py-1 rounded font-semibold transition-all duration-200 cursor-pointer ${
            mode === "work" 
              ? "bg-red-600 text-white shadow-xs" 
              : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:bg-white"
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => resetTimer("shortBreak")}
          className={`py-1 rounded font-semibold transition-all duration-200 cursor-pointer ${
            mode === "shortBreak" 
              ? "bg-emerald-600 text-white shadow-xs" 
              : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:bg-white"
          }`}
        >
          Short Break
        </button>
        <button
          onClick={() => resetTimer("longBreak")}
          className={`py-1 rounded font-semibold transition-all duration-200 cursor-pointer ${
            mode === "longBreak" 
              ? "bg-blue-600 text-white shadow-xs" 
              : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:bg-white"
          }`}
        >
          Long Break
        </button>
      </div>

      {/* Circle / Value Display */}
      <div className={`flex flex-col items-center justify-center py-6 rounded-2xl border ${curColor.bg} ${curColor.border}`}>
        <div className="text-5xl font-mono font-bold tracking-tight drop-shadow-2xs select-all text-center" style={{ color: isDark ? "#fff" : "#1e293b" }}>
          {formatTime(timeLeft)}
        </div>
        <div className="text-[11px] uppercase tracking-widest mt-1.5 font-bold" style={{ color: primaryColor }}>
          {mode === "work" ? "🧠 FOCUS PERIOD" : "☕ RELAX BREAK"}
        </div>

        {/* Outer progress line bar helper */}
        <div className={`w-full max-w-[200px] rounded-full h-1.5 mt-4 overflow-hidden ${
          isDark ? "bg-slate-800" : "bg-slate-200"
        }`}>
          <div
            className={`h-full transition-all duration-300 ${
              mode === "work" ? "bg-red-600" : mode === "shortBreak" ? "bg-emerald-600" : "bg-blue-600"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex justify-center gap-3">
        <button
          id="pomodoro-toggle-run-btn"
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-1 px-4 py-2 text-white font-bold rounded-lg transition-all focus:outline-none focus:ring-2 shadow-xs cursor-pointer ${curColor.btn}`}
        >
          {isRunning ? (
            <>
              <Pause size={16} /> Pause
            </>
          ) : (
            <>
              <Play size={16} /> Start
            </>
          )}
        </button>
        <button
          id="pomodoro-reset-btn"
          onClick={() => resetTimer(mode)}
          title="Reset timer"
          className={`p-2 rounded-lg border transition-all cursor-pointer focus:outline-none ${
            isDark 
              ? "text-slate-300 hover:text-white bg-slate-900 border-slate-800" 
              : "text-slate-650 hover:text-slate-800 bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => triggerAudioAlarm(selectedSound)}
          title="Test alarm sound"
          className={`p-2 rounded-lg border transition-all cursor-pointer focus:outline-none ${
            isDark 
              ? "text-slate-300 hover:text-white bg-slate-900 border-slate-800" 
              : "text-slate-650 hover:text-slate-800 bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Volume2 size={16} />
        </button>
      </div>

      {/* In-Timer Customizer Collapse */}
      <div className={`border-t pt-3 ${isDark ? 'border-slate-800/85' : 'border-slate-200/50'}`}>
        <form onSubmit={handleApplySettings} className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 opacity-70">
            Timer Configuration
          </h4>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Focus (m):</label>
              <input
                type="number"
                min="1"
                max="180"
                value={tempWork}
                onChange={(e) => setTempWork(parseInt(e.target.value) || 25)}
                className={`w-full border rounded p-1 font-mono focus:outline-none focus:ring-1 ${
                  isDark 
                    ? "bg-slate-900 border-slate-800 text-slate-100 focus:ring-slate-700" 
                    : "bg-white border-slate-200 text-slate-850 focus:ring-blue-400"
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Short Break (m):</label>
              <input
                type="number"
                min="1"
                max="60"
                value={tempShort}
                onChange={(e) => setTempShort(parseInt(e.target.value) || 5)}
                className={`w-full border rounded p-1 font-mono focus:outline-none focus:ring-1 ${
                  isDark 
                    ? "bg-slate-900 border-slate-800 text-slate-100 focus:ring-slate-700" 
                    : "bg-white border-slate-200 text-slate-850 focus:ring-blue-400"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Long Break (m):</label>
              <input
                type="number"
                min="1"
                max="120"
                value={tempLong}
                onChange={(e) => setTempLong(parseInt(e.target.value) || 15)}
                className={`w-full border rounded p-1 font-mono focus:outline-none focus:ring-1 ${
                  isDark 
                     ? "bg-slate-900 border-slate-800 text-slate-100 focus:ring-slate-700" 
                     : "bg-white border-slate-200 text-slate-850 focus:ring-blue-400"
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Intervals Count:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={tempInterval}
                onChange={(e) => setTempInterval(parseInt(e.target.value) || 4)}
                className={`w-full border rounded p-1 font-mono focus:outline-none focus:ring-1 ${
                  isDark 
                    ? "bg-slate-900 border-slate-800 text-slate-100 focus:ring-slate-700" 
                    : "bg-white border-slate-200 text-slate-850 focus:ring-blue-400"
                }`}
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-400 font-semibold block">Sound Ringtone:</label>
            <select
              value={selectedSound}
              onChange={(e) => setSelectedSound(e.target.value)}
              className={`w-full border rounded p-1 text-xs focus:outline-none focus:ring-1 ${
                isDark 
                  ? "bg-slate-900 border-slate-800 text-slate-100 focus:ring-slate-700" 
                  : "bg-white border-slate-200 text-slate-850 focus:ring-blue-400"
              }`}
            >
              <option value="bell">🛎️ Bell Ring</option>
              <option value="digital">📟 Digital Beeps</option>
              <option value="chime">🎶 Synthesizer Chime Melody</option>
              <option value="none">🔕 Silent</option>
            </select>
          </div>

          <button
            type="submit"
            id="apply-pomodoro-settings-btn"
            className={`w-full py-1.5 rounded text-xs transition-colors font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${accentClass}`}
          >
            <Save size={13} /> Update Durations
          </button>
        </form>
      </div>

      {isFullscreen && (() => {
        const bgConfigs = {
          charcoal: { bg: "bg-linear-to-b from-slate-900 via-slate-950 to-black text-slate-100", dot: "bg-slate-800" },
          violet: { bg: "bg-linear-to-b from-purple-900 via-zinc-950 to-black text-purple-100", dot: "bg-purple-900" },
          forest: { bg: "bg-linear-to-b from-emerald-900 via-stone-950 to-black text-emerald-100", dot: "bg-emerald-900" },
          amber: { bg: "bg-linear-to-b from-amber-900 via-stone-950 to-black text-amber-100", dot: "bg-amber-900" },
          rose: { bg: "bg-linear-to-b from-rose-900 via-zinc-950 to-black text-rose-100", dot: "bg-rose-900" },
          ocean: { bg: "bg-linear-to-b from-blue-900 via-zinc-950 to-black text-sky-100", dot: "bg-blue-900" }
        };
        const activeBg = bgConfigs[fullscreenBg] || bgConfigs.charcoal;

        return (
          <div className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center p-6 md:p-12 transition-all duration-500 ease-in-out select-none ${activeBg.bg}`} id="immersive-focus-portal" style={{ zIndex: 99999 }}>
            {/* Top Control Bar inside Fullscreen */}
            <div className="absolute top-6 left-6 right-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Logo and Mantra */}
              <div className="flex flex-col text-center sm:text-left">
                <span className="font-sans font-black text-xl tracking-wider uppercase opacity-90 text-white">Aetria Focus Space</span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mt-0.5 animate-pulse">Breathe in, Tune out</span>
              </div>

              {/* Background Color Picker Selector */}
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold tracking-wider uppercase opacity-70 px-1 hidden md:inline text-white">Atmosphere Color:</span>
                <div className="flex gap-2">
                  {(Object.keys(bgConfigs) as Array<keyof typeof bgConfigs>).map((colorKey) => {
                    const labelColors = {
                      charcoal: "bg-zinc-800 border-zinc-650",
                      violet: "bg-purple-700 border-purple-505",
                      forest: "bg-emerald-700 border-emerald-505",
                      amber: "bg-amber-700 border-amber-505",
                      rose: "bg-rose-700 border-rose-505",
                      ocean: "bg-blue-700 border-blue-505"
                    };
                    return (
                      <button
                        key={colorKey}
                        onClick={() => setFullscreenBg(colorKey)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer hover:scale-115 ${labelColors[colorKey] || "bg-slate-500"} ${
                          fullscreenBg === colorKey ? "scale-110 border-white" : "border-white/10"
                        }`}
                        title={`Switch to ${colorKey} theme`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Exit Fullscreen Button */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-2 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/30 text-xs font-bold text-white rounded-xl transition-all cursor-pointer select-none flex items-center gap-1.5 shadow-md"
                title="Return to Study Workbench"
              >
                <Minimize2 size={14} /> Exit Room
              </button>
            </div>

            {/* Centered Large Immersive Timer Element */}
            <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in text-center my-auto min-h-[50vh]">
              {/* Status Indicator */}
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-widest bg-white/10 border border-white/15 text-white/90 px-4 py-1.5 rounded-full select-none" style={{ background: "rgba(255, 255, 255, 0.08)" }}>
                  {mode === "work" ? "🧠 FOCUS PERIOD ACTIVE" : "☕ REST BREAKTIME ACTIVE"}
                </span>
                <p className="text-[11px] font-semibold text-white/50 font-mono tracking-wider mt-2">
                  Study cycles complete: <strong className="text-white font-mono">{cyclesCompleted} blocks</strong>
                </p>
              </div>

              {/* Monumental Digital Clock digits readout */}
              <div className="text-7xl md:text-9xl lg:text-[11rem] font-black font-mono tracking-tighter drop-shadow-lg text-white selection:bg-white/20 select-all leading-none duration-500 hover:scale-[1.01] transition-transform select-none">
                {formatTime(timeLeft)}
              </div>

              {/* Visual Progress bar inside fullscreen */}
              <div className="w-64 sm:w-80 md:w-96 rounded-full h-2 overflow-hidden bg-white/10 border border-white/5 shadow-inner">
                <div
                  className={`h-full transition-all duration-300 ${
                    mode === "work" ? "bg-red-500" : mode === "shortBreak" ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Huge Timer controllers block */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex items-center gap-1.5 px-8 py-4 text-sm font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-md border cursor-pointer select-none ${
                    isRunning 
                      ? "bg-white text-black border-white hover:bg-slate-100" 
                      : "bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600 shadow-emerald-950/20"
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause size={18} /> PAUSE HUB
                    </>
                  ) : (
                    <>
                      <Play size={18} /> START FOCUS
                    </>
                  )}
                </button>

                <button
                  onClick={() => resetTimer(mode)}
                  className="p-4 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 text-white rounded-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer select-none"
                  title="Reset active timer"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            {/* Bottom Zen Quote Accent */}
            <div className="absolute bottom-6 left-6 right-6 text-center text-[10px] text-white/30 uppercase tracking-widest font-mono">
              Aetria System • "Breathe in, Tune out" • Offline Work Session Secured
            </div>
          </div>
        );
      })()}
    </div>
  );
}
