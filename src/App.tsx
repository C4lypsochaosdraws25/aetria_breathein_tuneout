import React, { useState, useEffect, useRef } from "react";
import { AppData, Task, Tag, Habit, FloatingNote, NotificationPreferences, PomodoroSettings } from "./types";
import {
  fetchAppData,
  saveTask,
  deleteTask,
  saveHabit,
  toggleHabitDate,
  deleteHabit,
  saveTag,
  deleteTag,
  saveNote,
  deleteNote,
  savePomodoro,
  saveNotificationPrefs,
  readNotification,
  readAllNotifications,
  clearNotifications,
  triggerManualReminderCheck,
  saveFullState,
  registerStudent,
  loginStudent,
  verifyStudentCode,
  resendVerificationCode,
  fetchSimulatedEmails
} from "./api";
import { startAmbientSound, stopAmbientSound } from "./utils/audio";
import CalendarView from "./components/CalendarView";
import HabitTracker from "./components/HabitTracker";
import PomodoroTimer from "./components/PomodoroTimer";
import FloatingNotesManager from "./components/FloatingNotesManager";
import NotificationsCenter from "./components/NotificationsCenter";
import TaskDetailsModal from "./components/TaskDetailsModal";
import WeatherOverlay from "./components/WeatherOverlay";
// @ts-ignore
import aetriaLogo from "./assets/images/Copy of Aetria (Logo).png";
// @ts-ignore
import aetriaBanner from "./assets/images/Banner Design (Aetria).png";
import {
  CheckSquare,
  Sparkles,
  Calendar,
  Flame,
  Clock,
  Tags,
  Plus,
  Trash2,
  CalendarCheck,
  Menu,
  ChevronRight,
  LayoutGrid,
  ListFilter,
  CheckCircle,
  FileSpreadsheet,
  Settings,
  Award,
  Palette,
  Volume2,
  VolumeX,
  Music,
  Sliders,
  Home,
  CloudRain,
  SlidersHorizontal,
  FolderLock,
  Edit,
  TrendingUp,
  X,
  RotateCw,
  BellRing,
  LogIn,
  LogOut,
  RefreshCw,
  Headphones,
  Heart,
  Mail,
  Shield,
  Terminal,
  Coffee
} from "lucide-react";


export interface ThemeDefinition {
  id: string;
  name: string;
  isDark: boolean;
  bgStyle: React.CSSProperties;
  cardClass: string;
  bannerClass: string;
  accentClass: string;
  sideClass: string;
  primaryColor: string;
  lightAccentClass: string;
  headerClass: string;
}

export const THEME_PALETTES: ThemeDefinition[] = [
  {
    id: "default",
    name: "🌸 Sunset Lavender (Default)",
    isDark: false,
    bgStyle: { background: "linear-gradient(135deg, #fffbf9 0%, #f7e6dc 50%, #f5d3c4 100%)", color: "#323554" },
    cardClass: "bg-white/90 backdrop-blur-md border border-[#ebd0bf]/60 shadow-md text-slate-800",
    bannerClass: "bg-[#f2aebb]/20 text-[#696fc7] border border-[#f2aebb]/40",
    accentClass: "bg-[#696fc7] hover:bg-[#585db2] text-white",
    sideClass: "bg-white/80 border-r border-[#ebd0bf]/40 text-[#4c4452]",
    primaryColor: "#696fc7",
    lightAccentClass: "bg-[#696fc7]/10 text-[#696fc7]",
    headerClass: "bg-white/70 border-[#ebd0bf]/40 text-slate-800"
  },
  {
    id: "plum-velvet",
    name: "🌌 Crimson Eclipse",
    isDark: true,
    bgStyle: { background: "linear-gradient(135deg, #090e1b 0%, #0d1326 50%, #201324 100%)", color: "#ecc4d1" },
    cardClass: "bg-slate-900/95 backdrop-blur-md border border-slate-800/80 text-slate-100 shadow-xl",
    bannerClass: "bg-[#6d213c]/40 text-[#f08a5d] border border-[#6d213c]/60",
    accentClass: "bg-[#b83b5e] hover:bg-[#a12f4e] text-white",
    sideClass: "bg-slate-950/80 text-slate-200 border-r border-slate-800",
    primaryColor: "#b83b5e",
    lightAccentClass: "bg-[#b83b5e]/15 text-[#f67280]",
    headerClass: "bg-slate-950/70 border-slate-850/80 text-rose-100"
  },
  {
    id: "vampire-red",
    name: "🧛 Vampire Velvet",
    isDark: true,
    bgStyle: { background: "linear-gradient(135deg, #0a0102 0%, #170406 100%)", color: "#ffa5a5" },
    cardClass: "bg-[#1f090c]/90 backdrop-blur-md border border-[#4a1419] text-rose-55 shadow-xl",
    bannerClass: "bg-[#3a0007]/50 text-[#ff2400] border border-[#4a1419]",
    accentClass: "bg-[#99000a] hover:bg-[#ff2400] text-white",
    sideClass: "bg-[#0b0102] text-rose-150 border-r border-[#4a1419]",
    primaryColor: "#99000a",
    lightAccentClass: "bg-[#99000a]/15 text-[#ff6b6b]",
    headerClass: "bg-[#0c0203]/70 border-[#4a1419]/60 text-rose-50"
  },
  {
    id: "mossy-sage",
    name: "🍃 Cozy Moss Sage",
    isDark: false,
    bgStyle: { background: "linear-gradient(135deg, #fefdfb 0%, #fbf8f3 50%, #dfd2bc 100%)", color: "#324a29" },
    cardClass: "bg-white/95 backdrop-blur-md border border-[#dfd2bc] text-[#324a29] shadow-sm",
    bannerClass: "bg-[#8ea37d]/20 text-[#425f38] border border-[#8ea37d]/40",
    accentClass: "bg-[#425f38] hover:bg-[#344d2d] text-white",
    sideClass: "bg-[#fdfbf9] text-[#425f38] border-r border-[#dfd2bc]",
    primaryColor: "#425f38",
    lightAccentClass: "bg-[#425f38]/10 text-[#425f38]",
    headerClass: "bg-[#fdfbf9]/75 border-[#dfd2bc]/55 text-[#324a29]"
  },
  {
    id: "sunset-horizon",
    name: "🍊 Twilight Horizon",
    isDark: true,
    bgStyle: { background: "linear-gradient(135deg, #05090f 0%, #0d1723 100%)", color: "#ffd0b3" },
    cardClass: "bg-slate-900/90 backdrop-blur-md border border-[#1f3c5f]/40 text-slate-100 shadow-xl",
    bannerClass: "bg-[#1f3c5f]/50 text-[#ff6200] border border-[#1f3c5f]/70",
    accentClass: "bg-[#ff6200] hover:bg-[#e05600] text-white",
    sideClass: "bg-slate-950/80 text-slate-200 border-r border-[#1f3c5f]/30",
    primaryColor: "#ff6200",
    lightAccentClass: "bg-[#ff6200]/15 text-[#ff8e42]",
    headerClass: "bg-slate-950/70 border-[#1f3c5f]/30 text-[#ffd0b3]"
  },
  {
    id: "plum-delight",
    name: "🍇 Sweet Plum",
    isDark: true,
    bgStyle: { background: "linear-gradient(135deg, #1d121b 0%, #291222 100%)", color: "#ffd2e4" },
    cardClass: "bg-[#2c2a29]/95 border border-[#3d1d36]/70 text-slate-200 shadow-lg",
    bannerClass: "bg-[#702c47]/40 text-[#f63854] border border-[#3d1d36]",
    accentClass: "bg-[#f63854] hover:bg-[#d92a43] text-white",
    sideClass: "bg-[#1b1019] text-slate-300 border-r border-[#3d1d36]",
    primaryColor: "#f63854",
    lightAccentClass: "bg-[#f63854]/15 text-[#f63854]",
    headerClass: "bg-[#1b1019]/75 border-[#3d1d36]/60 text-slate-200"
  },
  {
    id: "deep-sea",
    name: "👑 Deep Sea Neon",
    isDark: true,
    bgStyle: { background: "linear-gradient(135deg, #060e22 0%, #0c1b40 100%)", color: "#ffd6e0" },
    cardClass: "bg-[#0c1328]/95 border border-slate-800 text-slate-100 shadow-xl",
    bannerClass: "bg-[#3f0071]/50 text-[#ffac41] border border-slate-800",
    accentClass: "bg-[#ff1e56] hover:bg-[#e01548] text-white",
    sideClass: "bg-[#040815] text-slate-200 border-r border-slate-900",
    primaryColor: "#ff1e56",
    lightAccentClass: "bg-[#ff1e56]/15 text-[#ffac41]",
    headerClass: "bg-[#040815]/70 border-slate-900 text-slate-100"
  },
  {
    id: "arctic-teal",
    name: "❄️ Arctic Glacier",
    isDark: false,
    bgStyle: { background: "linear-gradient(135deg, #f7f9fa 0%, #edeef1 100%)", color: "#0b2c4d" },
    cardClass: "bg-white/95 border border-[#dfdcd6] text-slate-805 shadow-sm",
    bannerClass: "bg-[#3490de]/15 text-[#1f6f8b] border border-[#dfdcd6]",
    accentClass: "bg-[#1f6f8b] hover:bg-[#165267] text-white",
    sideClass: "bg-[#ebedef] text-slate-700 border-r border-[#dfdcd6]",
    primaryColor: "#1f6f8b",
    lightAccentClass: "bg-[#1f6f8b]/10 text-[#1f6f8b]",
    headerClass: "bg-[#ebedef]/75 border-[#dfdcd6] text-[#0b2c4d]"
  },
  {
    id: "beach-breeze",
    name: "🏖️ Beachside Pebble",
    isDark: false,
    bgStyle: { background: "linear-gradient(135deg, #faf8ee 0%, #f3e9d2 100%)", color: "#2e526b" },
    cardClass: "bg-white/95 border border-[#e5dcc7] text-slate-800 shadow-sm",
    bannerClass: "bg-[#438a5e]/15 text-[#4e89ae] border border-[#e5dcc7]",
    accentClass: "bg-[#4e89ae] hover:bg-[#3b6b8b] text-white",
    sideClass: "bg-[#faf9f6]/95 text-slate-700 border-r border-[#f3e9d2]",
    primaryColor: "#4e89ae",
    lightAccentClass: "bg-[#4e89ae]/10 text-[#4e89ae]",
    headerClass: "bg-[#faf9f6]/75 border-[#e5dcc7] text-[#2e526b]"
  },
  {
    id: "peach-coral",
    name: "🍑 Creamy Peach Coral",
    isDark: false,
    bgStyle: { background: "linear-gradient(135deg, #fffcfb 0%, #fff5e4 100%)", color: "#a64924" },
    cardClass: "bg-white/95 border border-[#ffd3be]/60 text-slate-800 shadow-sm",
    bannerClass: "bg-[#ffc4a4]/40 text-[#ff8a5c] border border-[#ffc4a4]/60",
    accentClass: "bg-[#ff8a5c] hover:bg-[#e57448] text-white",
    sideClass: "bg-[#fffaf0] text-slate-700 border-r border-[#ffc4a4]/40",
    primaryColor: "#ff8a5c",
    lightAccentClass: "bg-[#ff8a5c]/10 text-[#ff8a5c]",
    headerClass: "bg-[#fffaf0]/75 border-[#ffd3be]/40 text-[#a64924]"
  },
  {
    id: "vanilla-ocean",
    name: "🍦 Fresh Vanilla Sky",
    isDark: false,
    bgStyle: { background: "linear-gradient(135deg, #fffcf2 0%, #fffbe0 100%)", color: "#2c5f85" },
    cardClass: "bg-white/95 border border-[#ffdfc4]/50 text-slate-800 shadow-sm",
    bannerClass: "bg-[#a8e6cf]/35 text-[#3d84b8] border border-[#ffdfc4]/30",
    accentClass: "bg-[#3d84b8] hover:bg-[#2f6a94] text-white",
    sideClass: "bg-[#fffff8] text-slate-700 border-r border-[#ffd3b6]/50",
    primaryColor: "#3d84b8",
    lightAccentClass: "bg-[#3d84b8]/10 text-[#3d84b8]",
    headerClass: "bg-[#fffff8]/75 border-[#ffd3b6]/40 text-[#2c5f85]"
  },
  {
    id: "lime-slate",
    name: "🦖 Retro Cyber Acid",
    isDark: true,
    bgStyle: { background: "linear-gradient(135deg, #030f1a 0%, #072a40 100%)", color: "#c9ef45" },
    cardClass: "bg-slate-900/95 border border-[#005c53]/40 text-slate-150 shadow-xl",
    bannerClass: "bg-[#005c53]/50 text-[#dbf227] border border-[#005c53]/60",
    accentClass: "bg-[#9fc131] hover:bg-[#83a125] text-slate-950 font-bold",
    sideClass: "bg-[#03111a] text-slate-300 border-r border-[#005c53]/30",
    primaryColor: "#9fc131",
    lightAccentClass: "bg-[#c9ef45]/15 text-[#c9ef45]",
    headerClass: "bg-[#03111a]/70 border-[#005c53]/40 text-[#c9ef45]"
  },
  {
    id: "oatmeal-mint",
    name: "🍵 Mint Oat Macchiato",
    isDark: false,
    bgStyle: { background: "linear-gradient(135deg, #fffefa 0%, #fdf6f0 100%)", color: "#7a4e5c" },
    cardClass: "bg-white/95 border border-[#ebdcd0] text-slate-800 shadow-sm",
    bannerClass: "bg-[#f1dfd1] text-[#eca0b7] border border-[#ebdcd0]",
    accentClass: "bg-[#eca0b7] hover:bg-[#d68ea6] text-white",
    sideClass: "bg-[#fdfbfa]/95 text-slate-700 border-r border-[#f1dfd1]",
    primaryColor: "#eca0b7",
    lightAccentClass: "bg-[#eca0b7]/15 text-[#eca0b7]",
    headerClass: "bg-[#fdfbfa]/75 border-[#f1dfd1] text-[#7a4e5c]"
  },
  {
    id: "nebula-dream",
    name: "🍩 Gelato Rose Dream",
    isDark: false,
    bgStyle: { background: "linear-gradient(135deg, #fffef9 0%, #f9ebc8 100%)", color: "#486296" },
    cardClass: "bg-white/95 border border-[#ffd9a3] text-slate-800 shadow-sm",
    bannerClass: "bg-[#ffe0ac] text-[#6886c5] border border-[#ffd9a3]",
    accentClass: "bg-[#6886c5] hover:bg-[#526faa] text-white",
    sideClass: "bg-[#fdfaf2] text-[#486296] border-r border-[#ffe0ac]",
    primaryColor: "#6886c5",
    lightAccentClass: "bg-[#6886c5]/15 text-[#486296]",
    headerClass: "bg-[#fdfaf2]/75 border-[#ffe0ac] text-[#486296]"
  },
  {
    id: "nordic-lilac",
    name: "🔮 Lavender Blizzard",
    isDark: false,
    bgStyle: { background: "linear-gradient(135deg, #faf9fa 0%, #f7f5f7 100%)", color: "#5a3a8a" },
    cardClass: "bg-white/95 border border-[#d2d2f2] text-slate-850 shadow-sm",
    bannerClass: "bg-[#dbdbf5] text-[#845ec2] border border-[#d2d2f2]",
    accentClass: "bg-[#845ec2] hover:bg-[#6c4ca3] text-white",
    sideClass: "bg-[#fcfbfa]/95 text-slate-700 border-r border-[#dbdbf5]",
    primaryColor: "#845ec2",
    lightAccentClass: "bg-[#845ec2]/15 text-[#845ec2]",
    headerClass: "bg-[#fcfbfa]/75 border-[#dbdbf5] text-[#5a3a8a]"
  },
  {
    id: "deep-spruce",
    name: "🌲 Nordic Spruce & Slate",
    isDark: true,
    bgStyle: { background: "linear-gradient(135deg, #1b1e29 0%, #2c2f40 50%, #334752 100%)", color: "#6e9c85" },
    cardClass: "bg-slate-900/90 backdrop-blur-md border border-[#334752]/50 text-slate-100 shadow-xl",
    bannerClass: "bg-[#334752]/30 text-[#6e9c85] border border-[#334752]/60",
    accentClass: "bg-[#6e9c85] hover:bg-[#5a8670] text-slate-950 font-bold",
    sideClass: "bg-[#181a24] text-slate-200 border-r border-[#334752]/40",
    primaryColor: "#6e9c85",
    lightAccentClass: "bg-[#6e9c85]/15 text-[#6e9c85]",
    headerClass: "bg-[#181a24]/75 border-[#334752]/40 text-slate-100"
  },
  {
    id: "neon-cosmos",
    name: "👾 Midnight Neon Gold",
    isDark: true,
    bgStyle: { background: "linear-gradient(135deg, #01001c 0%, #00003f 50%, #24015c 100%)", color: "#ffd54f" },
    cardClass: "bg-[#040226]/90 backdrop-blur-md border border-[#4a03a6]/50 text-slate-100 shadow-2xl",
    bannerClass: "bg-[#4a03a6]/30 text-[#ffd54f] border border-[#4a03a6]/60",
    accentClass: "bg-[#a83efc] hover:bg-[#922ce6] text-white",
    sideClass: "bg-[#010014] text-slate-200 border-r border-[#4a03a6]/40",
    primaryColor: "#ffd54f",
    lightAccentClass: "bg-[#a83efc]/20 text-[#a83efc]",
    headerClass: "bg-[#010014]/75 border-[#4a03a6]/40 text-slate-100"
  },
  {
    id: "synthetix-punk",
    name: "⚡ Cyberpunk Velvet",
    isDark: true,
    bgStyle: { background: "linear-gradient(135deg, #000000 0%, #15001c 65%, #330030 100%)", color: "#fff59d" },
    cardClass: "bg-[#050008]/95 backdrop-blur-md border border-[#8e24aa]/40 text-slate-150 shadow-xl",
    bannerClass: "bg-[#8e24aa]/25 text-[#ff4081] border border-[#8e24aa]/40",
    accentClass: "bg-[#ff4081] hover:bg-[#e03070] text-slate-950 font-black",
    sideClass: "bg-[#000000] text-slate-200 border-r border-[#8e24aa]/30",
    primaryColor: "#ff4081",
    lightAccentClass: "bg-[#ff4081]/20 text-[#ff4081]",
    headerClass: "bg-[#000000]/80 border-[#8e24aa]/30 text-white"
  }
];

const TOUR_STEPS = [
  {
    title: "Welcome to Aetria!",
    badge: "Student Zenith Oasis",
    emoji: "🌸",
    color: "#ec4899",
    description: "Welcome! Aetria is your visually crafted, ambient academic workspace combining calendar schedules, milestone checklists, custom media streams, and gamified productivity levels under a serene climate control overlay."
  },
  {
    title: "Points & Desk Dashboard",
    badge: "Gamified Academic Success",
    emoji: "💎",
    color: "#3b82f6",
    description: "Your Desk Dashboard gives you a bird's-eye view of your milestones, floating sticky pads, and progress metrics. Complete tasks and habits to earn 💎 Productivity Points. Accumulate points over time to level up from Novice to Scholarly Zen!"
  },
  {
    title: "Course Milestones & Subtasks",
    badge: "Academic Action Plan",
    emoji: "📅",
    color: "#22c55e",
    description: "Break heavy subjects down cleanly! Under the 'Course Milestones' page, you can create tasks, track micro sub-task completion, assign course-specific tag lists, and establish custom notification reminder schedules."
  },
  {
    title: "Visual Interactive Calendar",
    badge: "Schedules & Events Mapping",
    emoji: "🗓️",
    color: "#8b5cf6",
    description: "Map your study workflow beautifully. All upcoming homeworks, lab assignments, and project deadlines integrate automatically into the 'Visual Calendar' tab. View complete schedules at a single glance with smart relative deadline indicators."
  },
  {
    title: "Focus Music & Ambient Sights",
    badge: "Deep Immersion Modes",
    emoji: "🎵",
    color: "#f59e0b",
    description: "Create your personal study cocoon. Turn on background rain particles, customizable snow intensity, or stardust under 'Visual Atmosphere'. Match it with cozy beach breeze soundscapes or embed live lofi streams in 'Focus Soundscapes'!"
  }
];

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [simulatedDate, setSimulatedDate] = useState("2026-05-20");
  
  // Custom multi-device portability and native student accounts states
  const [currentUser, setCurrentUser] = useState<{ displayName: string; email: string } | null>(() => {
    const saved = localStorage.getItem("workspace_student_username");
    return saved ? { displayName: saved, email: saved } : null;
  });
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [cloudLoading, setCloudLoading] = useState(false);

  // Authentication & portability panel states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "backup">("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [backupKeyInput, setBackupKeyInput] = useState("");

  // Navigation tabs (each element is on a dedicated page/section)
  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks" | "habits" | "calendar" | "timer" | "atmosphere" | "media" | "tags" | "support" | "tag-filter">("dashboard");
  const [selectedTagPageId, setSelectedTagPageId] = useState<string | null>(null);
  const [showSecuritySpec, setShowSecuritySpec] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return window.innerWidth < 1024;
  });

  const [audioConfigVersion, setAudioConfigVersion] = useState(0);
  const userHasInteracted = useRef(false);
  const [audioOverrides, setAudioOverrides] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("academic_suite_audio_overrides");
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  // Custom Soundtracks list and playing state
  const [customSoundtracks, setCustomSoundtracks] = useState<{ id: string; name: string; url: string }[]>(() => {
    try {
      const saved = localStorage.getItem("academic_suite_custom_soundtracks");
      return saved ? JSON.parse(saved) : [
        { id: "cs-1", name: "✨ Relaxing Study Beats (Direct MP3)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
        { id: "cs-2", name: "🎧 Lofi Girl Study Stream", url: "https://www.youtube.com/live/EWrX250Zhko?si=4CNYa4m5uy8I4rmW" },
        { id: "cs-3", name: "🎵 Deep Focus Study Playlist", url: "https://open.spotify.com/playlist/0oPyDVNdgcPFAWmOYSK7O1?si=1DAYLknIQqGQ8kPEle1onQ" }
      ];
    } catch (_) {
      return [];
    }
  });

  const [activeSoundtrackId, setActiveSoundtrackId] = useState<string | null>(() => {
    return localStorage.getItem("academic_suite_active_soundtrack_id") || null;
  });

  const [customTrackName, setCustomTrackName] = useState("");
  const [customTrackUrl, setCustomTrackUrl] = useState("");

  const handleAddCustomTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTrackName.trim() || !customTrackUrl.trim()) return;
    const newTrack = {
      id: `cs-${Date.now()}`,
      name: customTrackName.trim(),
      url: customTrackUrl.trim()
    };
    const updated = [...customSoundtracks, newTrack];
    setCustomSoundtracks(updated);
    localStorage.setItem("academic_suite_custom_soundtracks", JSON.stringify(updated));
    setCustomTrackName("");
    setCustomTrackUrl("");
  };

  const handleDeleteCustomTrack = (id: string) => {
    const updated = customSoundtracks.filter(t => t.id !== id);
    setCustomSoundtracks(updated);
    localStorage.setItem("academic_suite_custom_soundtracks", JSON.stringify(updated));
    if (activeSoundtrackId === id) {
      setActiveSoundtrackId(null);
      localStorage.removeItem("academic_suite_active_soundtrack_id");
    }
  };

  const handleSelectSoundtrack = (id: string | null) => {
    setActiveSoundtrackId(id);
    if (id) {
      localStorage.setItem("academic_suite_active_soundtrack_id", id);
    } else {
      localStorage.removeItem("academic_suite_active_soundtrack_id");
    }
  };

  const getSpotifyEmbedUrl = (url: string) => {
    try {
      const match = url.match(/https?:\/\/open\.spotify\.com\/(track|playlist|album|show|artist)\/([a-zA-Z0-9]+)/);
      if (match) {
        return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
      }
    } catch (_) {}
    return null;
  };

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?autoplay=0`;
      }
      const playlistMatch = url.match(/[&?]list=([^&#]+)/);
      if (playlistMatch) {
         return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`;
      }
    } catch (_) {}
    return null;
  };

  const getAppleMusicEmbedUrl = (url: string) => {
    try {
      if (url.includes("music.apple.com")) {
        return url.replace("music.apple.com", "embed.music.apple.com");
      }
    } catch (_) {}
    return null;
  };

  const getAmazonMusicEmbedUrl = (url: string) => {
    try {
      if (url.includes("music.amazon.com")) {
        return url.replace("music.amazon.com", "music.amazon.com/embed");
      }
    } catch (_) {}
    return null;
  };

  const isExternalPlatform = (url: string) => {
    const lower = url.toLowerCase();
    return lower.includes("spotify.com") || 
           lower.includes("youtube.com") || 
           lower.includes("youtu.be") || 
           lower.includes("music.youtube.com") || 
           lower.includes("music.apple.com") || 
           lower.includes("music.amazon.com");
  };

  const handleTabChange = (tab: "dashboard" | "tasks" | "habits" | "calendar" | "timer" | "atmosphere" | "media" | "tags" | "support" | "tag-filter", tagId: string | null = null) => {
    setSelectedTagPageId(tagId);
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  };
  
  // Modal states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // New task form states
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskStart, setNewTaskStart] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskTags, setNewTaskTags] = useState<string[]>([]);
  const [newTaskPoints, setNewTaskPoints] = useState<number>(3); // default points system (1p, 3p, 5p, 10p, 15p, 20p)

  // Page tag configure modes
  const [showTagConfig, setShowTagConfig] = useState(false);
  const [customTagName, setCustomTagName] = useState("");
  const [customTagColor, setCustomTagColor] = useState("#3B82F6");

  // Edit Tag Modal
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [editingTagColor, setEditingTagColor] = useState("");

  // Interactive Onboarding Tour/Tutorial states
  const [showTour, setShowTour] = useState(() => {
    return localStorage.getItem("aetria_first_time_tour_completed") !== "true";
  });
  const [tourStep, setTourStep] = useState(0);

  const handleFinishTour = () => {
    setShowTour(false);
    localStorage.setItem("aetria_first_time_tour_completed", "true");
  };

  // Auto-persist state to localStorage whenever it changes
  useEffect(() => {
    if (data) {
      localStorage.setItem("aetria_app_state", JSON.stringify(data));
    }
  }, [data]);

  // Load app data
  const loadState = async (dateStr?: string) => {
    try {
      // Prioritize client state if offline device data exists to ensure no loss of items
      const localStateStr = localStorage.getItem("aetria_app_state");
      if (localStateStr) {
        try {
          const localParsed = JSON.parse(localStateStr);
          setData(localParsed);
          // Silently sync local modifications back to the express server database in background
          fetchAppData(dateStr || simulatedDate).then(async (serverRes) => {
            await saveFullState(localParsed).catch(err => {
              console.warn("Express sync failed (running offline mode):", err);
            });
          }).catch(() => {});
          return;
        } catch (pe) {
          console.error("Local state parse error:", pe);
        }
      }

      const res = await fetchAppData(dateStr || simulatedDate);
      setData(res);
      localStorage.setItem("aetria_app_state", JSON.stringify(res));
    } catch (err) {
      console.error("Error drawing state from backend:", err);
      const localStateStr = localStorage.getItem("aetria_app_state");
      if (localStateStr) {
        try {
          setData(JSON.parse(localStateStr));
        } catch (_) {}
      }
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  // Custom credential-based authentication & portability handlers
  const handleCustomRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    try {
      if (!authUsername.trim() || !authEmail.trim() || !authPassword) {
        throw new Error("Please enter your username, email address, and security password.");
      }
      const res = await registerStudent(authUsername.trim(), authEmail.trim(), authPassword, data || undefined);
      setAuthSuccess(`Success! Account registered. A 6-digit verification code has been dispatched to ${res.email}.`);
      setShowVerificationInput(true);
    } catch (err: any) {
      setAuthError(err.message || "Registration failed. Verify username/email format.");
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    try {
      if (!authEmail.trim() || !authPassword) {
        throw new Error("Please enter your registration email and password.");
      }
      const res = await loginStudent(authEmail.trim(), authPassword);
      if (res.needsVerification) {
        setAuthSuccess(`Account pending email verification. A new 6-digit code has been dispatched to ${res.email}.`);
        setShowVerificationInput(true);
      } else {
        localStorage.setItem("workspace_student_username", res.username);
        setCurrentUser({ displayName: res.username, email: res.email || res.username });
        if (res.state) setData(res.state);
        setAuthSuccess(`Welcome back, ${res.username}! Loading workspace...`);
        setTimeout(() => setShowAuthModal(false), 1500);
      }
    } catch (err: any) {
      setAuthError(err.message || "Login failed. Verify your email and password.");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    try {
      if (!verificationCode.trim()) {
        throw new Error("Please enter the 6-digit verification code.");
      }
      const res = await verifyStudentCode(authEmail.trim(), verificationCode.trim());
      localStorage.setItem("workspace_student_username", res.username);
      setCurrentUser({ displayName: res.username, email: res.email });
      setData(res.state);
      setAuthSuccess(`Successfully verified as "${res.username}"! Sync completed!`);
      setShowVerificationInput(false);
      setTimeout(() => setShowAuthModal(false), 1500);
    } catch (err: any) {
      setAuthError(err.message || "Invalid or expired verification code.");
    }
  };

  const handleResendCode = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    try {
      if (!authEmail.trim()) {
        throw new Error("Email is required to dispatch code.");
      }
      const res = await resendVerificationCode(authEmail.trim());
      setAuthSuccess(res.message || "Verification code successfully resent!");
    } catch (err: any) {
      setAuthError(err.message || "Resend failed. Verify email.");
    }
  };

  const handleCustomSignOut = () => {
    localStorage.removeItem("workspace_student_username");
    setCurrentUser(null);
    loadState();
  };

  const handleExportState = () => {
    if (!data) return;
    try {
      const payload = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      navigator.clipboard.writeText(payload);
      setAuthSuccess("Full Workspace backup code copied to clipboard! Keep it safe.");
    } catch (err) {
      setAuthSuccess("Copying failed - copy manually from the box.");
    }
  };

  const handleImportState = async () => {
    try {
      setAuthError(null);
      setAuthSuccess(null);
      if (!backupKeyInput.trim()) {
        throw new Error("Paste your workspace backup code.");
      }
      const decodedState = JSON.parse(decodeURIComponent(escape(atob(backupKeyInput.trim()))));
      if (!decodedState.tasks || !decodedState.habits) {
        throw new Error("Invalid format structure.");
      }
      setData(decodedState);
      await saveFullState(decodedState);
      setAuthSuccess("Workspace backup imported and applied successfully!");
      setBackupKeyInput("");
      setTimeout(() => setShowAuthModal(false), 1500);
    } catch (err: any) {
      setAuthError(err.message || "Invalid backup code - confirm your code.");
    }
  };

  // Mark that the user has interacted with the page (required for Chrome's autoplay policy)
  useEffect(() => {
    const markInteracted = () => { userHasInteracted.current = true; };
    window.addEventListener("click", markInteracted, { once: true });
    window.addEventListener("keydown", markInteracted, { once: true });
    return () => {
      window.removeEventListener("click", markInteracted);
      window.removeEventListener("keydown", markInteracted);
    };
  }, []);

  // Update background audio when ambient settings lock in
  useEffect(() => {
    if (data && userHasInteracted.current) {
      startAmbientSound(data.ambientSound, data.ambientVolume);
    }
    return () => {
      stopAmbientSound();
    };
  }, [data?.ambientSound, data?.ambientVolume, audioConfigVersion]);

  const handleSimulatedDateChange = async (newDate: string) => {
    setSimulatedDate(newDate);
    await loadState(newDate);
  };

  const handleManualReminderSweep = async () => {
    try {
      const res = await triggerManualReminderCheck(simulatedDate);
      setData(res.state);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to award points dynamically
  const awardPoints = async (amount: number, reason: string, updatedState?: AppData) => {
    const currentState = updatedState || data;
    if (!currentState) return;

    const newPoints = currentState.userPoints + amount;

    const newNotif = {
      id: `notif-points-${Date.now()}`,
      message: `🎉 Earned +${amount} Productivity points! Reason: ${reason}`,
      type: "system" as const,
      timestamp: new Date().toISOString(),
      read: false
    };

    const nextState: AppData = {
      ...currentState,
      userPoints: newPoints,
      notifications: [newNotif, ...currentState.notifications]
    };

    try {
      await saveFullState(nextState);
      setData(nextState);
    } catch (err) {
      console.error("Failed to auto-award progress points:", err);
    }
  };

  // Automated Task Creation
  const handleAddNewTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const id = `task-${Date.now()}`;
    const newTask: Task = {
      id,
      title: newTaskTitle,
      description: newTaskDesc,
      startDate: newTaskStart || simulatedDate,
      deadline: newTaskDeadline || simulatedDate,
      tags: newTaskTags,
      subtasks: [],
      progress: 0,
      status: "Not Started",
      points: newTaskPoints,
      reminderPreferences: {
        browserEnabled: true,
        frequencyHours: 24
      }
    };

    try {
      const res = await saveTask(newTask);
      setData(res.state);
      // Reset form fields
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskStart("");
      setNewTaskDeadline("");
      setNewTaskTags([]);
      setNewTaskPoints(3);
      setShowAddTaskForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickCreateOnDate = (date: string, isDeadline: boolean) => {
    setNewTaskTitle(`Milestone Objective for ${date}`);
    setNewTaskStart(date);
    setNewTaskDeadline(date);
    if (isDeadline) {
      setNewTaskStart(simulatedDate);
    }
    setNewTaskPoints(3);
    setShowAddTaskForm(true);
    handleTabChange("tasks");
  };

  const handleTaskModalSave = async (updatedTask: Task) => {
    try {
      // Catch task transition to 100% completed
      const oldTask = data?.tasks.find(t => t.id === updatedTask.id);
      const isNewlyCompleted = (!oldTask || oldTask.progress < 100) && updatedTask.progress === 100;

      const res = await saveTask(updatedTask);
      
      if (isNewlyCompleted && data) {
        // Automatically reward the student
        const stateAfterSave = { ...res.state, tasks: res.state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) };
        await awardPoints(updatedTask.points || 3, `Completed study milestone "${updatedTask.title}"`, stateAfterSave);
      } else {
        setData(res.state);
      }
      
      setSelectedTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const res = await deleteTask(taskId);
      setData(res.state);
      setSelectedTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Automated progress checkbox check toggling directly on the list
  const handleToggleTaskCheckboxInList = async (task: Task) => {
    const nextProgress = task.progress === 100 ? 0 : 100;
    const nextStatus = nextProgress === 100 ? "Completed" as const : "Not Started" as const;
    
    // Auto-update all subtasks too
    const nextSubtasks = task.subtasks.map(s => ({ ...s, completed: nextProgress === 100 }));
    const updatedTask: Task = {
      ...task,
      progress: nextProgress,
      status: nextStatus,
      subtasks: nextSubtasks
    };

    try {
      const isNewlyCompleted = task.progress < 100 && nextProgress === 100;
      const res = await saveTask(updatedTask);
      
      if (isNewlyCompleted && data) {
        const localNext = { ...res.state, tasks: res.state.tasks.map(t => t.id === task.id ? updatedTask : t) };
        await awardPoints(task.points || 3, `Instantly checked/completed task: "${task.title}"`, localNext);
      } else {
        setData(res.state);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add tag selection filter in creation form
  const toggleNewTaskFormTag = (tagId: string) => {
    setNewTaskTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  // Custom Tags operations
  const handleCreateCustomTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTagName.trim()) return;

    const tagId = `tag-${Date.now()}`;
    const newTag: Tag = {
      id: tagId,
      name: customTagName,
      color: customTagColor
    };

    try {
      const res = await saveTag(newTag);
      setData(res.state);
      setCustomTagName("");
      setShowTagConfig(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditTagClick = (tag: Tag) => {
    setEditingTag(tag);
    setEditingTagName(tag.name);
    setEditingTagColor(tag.color);
  };

  const handleSaveEditedTag = async () => {
    if (!editingTag || !editingTagName.trim()) return;
    const updated: Tag = {
      ...editingTag,
      name: editingTagName,
      color: editingTagColor
    };
    try {
      const res = await saveTag(updated);
      setData(res.state);
      setEditingTag(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCustomTag = async (tagId: string) => {
    if (!confirm("Are you sure you want to delete this custom tag list? It will remove tag ties from all tasks & habits.")) return;
    try {
      const res = await deleteTag(tagId);
      setData(res.state);
      if (selectedTagPageId === tagId) {
        handleTabChange("tasks");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Habits triggers
  const handleSaveHabit = async (habit: Habit) => {
    try {
      const res = await saveHabit(habit);
      setData(res.state);
      await awardPoints(15, `Started new discipline challenge habit "${habit.title}"`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleHabitDay = async (id: string, date: string) => {
    try {
      const targetHabit = data?.habits.find(h => h.id === id);
      const isToggledDone = targetHabit ? !targetHabit.completionHistory.includes(date) : false;

      const res = await toggleHabitDate(id, date);
      setData(res.state);

      if (isToggledDone) {
        // Consistency streak award
        await awardPoints(15, `Marked habit consistency "${targetHabit?.title}" done for ${date}!`);
        
        // Calculate streak to award bonus milestone points!
        const cleanHistory = [...(targetHabit?.completionHistory || []), date];
        const uniqueHistory = Array.from(new Set(cleanHistory));
        if (uniqueHistory.length >= 3 && data && !data.unlockedBadges.includes("streak-master")) {
          // Reward multiplier
          await awardPoints(30, `Earned 3+ days habit streak bonus!`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      const res = await deleteHabit(id);
      setData(res.state);
    } catch (err) {
      console.error(err);
    }
  };

  // Floating Notes triggers
  const handleSaveNote = async (note: FloatingNote) => {
    try {
      const res = await saveNote(note);
      setData(res.state);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await deleteNote(id);
      setData(res.state);
    } catch (err) {
      console.error(err);
    }
  };

  // Pomodoro settings
  const handleUpdatePomodoro = async (settings: PomodoroSettings) => {
    try {
      const res = await savePomodoro(settings);
      if (data) {
        setData({
          ...data,
          pomodoroSettings: res.pomodoroSettings
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update atmosphere states
  const handleUpdateAtmosphere = async (changes: Partial<AppData>) => {
    if (!data) return;
    const updated: AppData = {
      ...data,
      ...changes
    };
    try {
      const res = await saveFullState(updated);
      setData(res);
    } catch (err) {
      console.error("Failed to update ambiance settings:", err);
    }
  };

  // Preference Settings
  const handleUpdateNotificationPrefs = async (prefs: NotificationPreferences) => {
    try {
      const res = await saveNotificationPrefs(prefs);
      if (data) {
        setData({
          ...data,
          notificationPreferences: res.notificationPreferences
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const res = await readNotification(id);
      setData(res.state);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await readAllNotifications();
      setData(res.state);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearNotifications = async () => {
    try {
      const res = await clearNotifications();
      setData(res.state);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSystemNotification = async (message: string, type: "system" | "reminder" | "deadline" | "habit") => {
    if (!data) return;
    const newNotif = {
      id: `notif-${Date.now()}`,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    const newState = {
      ...data,
      notifications: [newNotif, ...data.notifications]
    };
    try {
      await saveFullState(newState);
      setData(newState);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center p-4 bg-slate-100 font-sans" id="applet-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
        <p className="text-xs font-semibold text-slate-500 tracking-wider">Loading student ecosystem...</p>
      </div>
    );
  }

  // Adaptive palette variables based on theme selected
  const activeTheme = THEME_PALETTES.find((t) => t.id === data.themeBackground) || THEME_PALETTES[0];
  const isDark = activeTheme.isDark;
  const bgThemeClass = "";
  
  const cardClass = activeTheme.cardClass;
  const bannerClass = activeTheme.bannerClass;
  const lightAccentClass = activeTheme.lightAccentClass;
  const sideClass = activeTheme.sideClass;
  const primaryColor = activeTheme.primaryColor;
  const headerClass = activeTheme.headerClass;
  const accentClass = activeTheme.accentClass;

  // Task filtering base on current page view selections
  let displayedTasks = data.tasks;
  if (activeTab === "tag-filter" && selectedTagPageId) {
    displayedTasks = data.tasks.filter((t) => t.tags.includes(selectedTagPageId));
  } else if (selectedTagPageId) {
    // Sync tab is tag-filter
    displayedTasks = data.tasks.filter((t) => t.tags.includes(selectedTagPageId));
  }

  // Get active selected tag object details
  const activeTagDetails = selectedTagPageId 
    ? data.tags.find(t => t.id === selectedTagPageId) 
    : null;

  // Day/Week/Month deadlines indicators
  const calculateLoomingDeadlines = () => {
    const todayStr = simulatedDate;
    const todayDate = new Date(todayStr);

    const check7DaysLooming = new Date(todayStr);
    check7DaysLooming.setDate(todayDate.getDate() + 7);

    const check30DaysLooming = new Date(todayStr);
    check30DaysLooming.setDate(todayDate.getDate() + 30);

    const activeTasks = data.tasks.filter(t => t.status !== "Completed");

    const todayDue = activeTasks.filter(t => t.deadline === todayStr);
    const weekDue = activeTasks.filter(t => {
      const dueD = new Date(t.deadline);
      return dueD > todayDate && dueD <= check7DaysLooming;
    });
    const monthDue = activeTasks.filter(t => {
      const dueD = new Date(t.deadline);
      return dueD > check7DaysLooming && dueD <= check30DaysLooming;
    });

    return { todayDue, weekDue, monthDue };
  };

  const { todayDue, weekDue, monthDue } = calculateLoomingDeadlines();

  const presetHexColors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#8B5CF6", // Purple
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#6B7280"  // Gray
  ];

  // Calculate high quality level info
  const points = data.userPoints || 0;

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col transition-all duration-500" style={activeTheme.bgStyle} id="student-suite-root">
      
      {/* 2D weather canvas floating on top of screen backgrounds, behind focus boxes */}
      <WeatherOverlay 
        effect={data.weatherEffect} 
        opacity={data.weatherOpacity}
        density={data.weatherDensity}
      />

      {/* Header Bar */}
      <header className={`border-b ${headerClass} backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between transition-all duration-300`}>
        <div className="flex items-center gap-2.5">
          {/* Bento Workspace Menu Expand Grid button */}
          <button
            id="sidebar-collapse-trigger"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold select-none ${
              isDark ? "hover:bg-slate-800/60 text-rose-50" : "hover:bg-black/5 text-slate-800"
            }`}
            title="Toggle Bento Workspace Pages Sidebar"
          >
            <LayoutGrid size={18} className={`transition-transform duration-300 ${!sidebarCollapsed ? "rotate-45" : ""}`} />
            <span className="text-[10.5px] font-semibold uppercase tracking-wider hidden sm:inline-block">Menu</span>
          </button>
          
          <div className="h-9 sm:h-11 flex items-center">
            <img
              src={aetriaBanner}
              alt="Aetria Workspace"
              className="h-full w-auto object-contain select-none max-w-[155px] sm:max-w-[190px]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Points summary overview top header bar widget - visible on mobile container */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            onClick={() => { setTourStep(0); setShowTour(true); }}
            className="p-1.5 px-2.5 sm:px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold leading-none cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: isDark ? "rgba(245, 158, 11, 0.12)" : "rgba(217, 119, 6, 0.08)",
              borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "rgba(217, 119, 6, 0.16)",
              color: isDark ? "#fbbf24" : "#b45309"
            }}
            title="Check out Aetria's Interactive Features Tour"
          >
            <span>💡</span>
            <span className="hidden sm:inline">App Tour</span>
          </button>

          <div className="p-1.5 px-2.5 sm:px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all duration-300"
               style={{
                 backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)",
                 borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)"
               }}>
            <span className="font-extrabold text-[13px]">💎</span>
            <span><span className="hidden sm:inline">Productivity Points: </span><strong className="font-mono font-black" style={{ color: primaryColor }}>{points}p</strong></span>
          </div>
          
          {/* Global Simulated Date Controls */}
          <NotificationsCenter
            notifications={data.notifications}
            preferences={data.notificationPreferences}
            simulatedDate={simulatedDate}
            onUpdateSimulatedDate={handleSimulatedDateChange}
            onMarkRead={handleMarkNotificationRead}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onClearAll={handleClearNotifications}
            onUpdatePrefs={handleUpdateNotificationPrefs}
            onTriggerCheck={handleManualReminderSweep}
            isDark={isDark}
            primaryColor={primaryColor}
            accentClass={activeTheme.accentClass}
            cardClass={cardClass}
            bannerClass={bannerClass}
            lightAccentClass={lightAccentClass}
            headerClass={headerClass}
          />
        </div>
      </header>

      {/* Main Container Grid */}
      <div className="flex-1 flex flex-col lg:flex-row h-full relative">
        
        {/* Mobile sidebar overlay grey backdrop */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        {/* Left Sidebar Menu (Collapse-able drawer overlay on mobile/tablet, adaptive inline panel on desktop) */}
        <aside className={`transition-all duration-300 ease-in-out flex-shrink-0 z-40 
          max-lg:fixed max-lg:top-[65px] max-lg:left-0 max-lg:bottom-0 max-lg:h-[calc(100vh-65px)] max-lg:w-72 max-lg:max-w-[85vw] max-lg:shadow-2xl
          ${sidebarCollapsed 
            ? "max-lg:-translate-x-full lg:w-16 lg:p-3 lg:overflow-hidden lg:h-auto" 
            : "max-lg:translate-x-0 lg:w-64 lg:p-4 lg:h-auto"
          } ${sideClass} space-y-5 shadow-xs overflow-y-auto max-lg:p-4`}
        >
          
          {/* Sidebar Brand Header in Klemer Font */}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 px-1 pb-1 border-b border-slate-200/10 mb-2">
              <div className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center">
                <img
                  src={aetriaLogo}
                  alt="Aetria"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-base font-extrabold tracking-wide" style={{ fontFamily: "var(--font-klemer)", color: isDark ? "#ffffff" : "#1e293b" }}>
                Aetria
              </span>
            </div>
          )}
          
          {/* Sidebar Profile & Custom multi-device portability hub */}
          {!sidebarCollapsed ? (
            <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/95 border-slate-200"} space-y-3 shadow-xs`}>
              {currentUser ? (
                <div className="space-y-3">
                  <div className={`flex items-center gap-2.5 p-1.5 rounded-xl ${lightAccentClass}`}>
                    <div className="h-9 w-9 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs" style={{ backgroundColor: primaryColor }}>
                      {currentUser.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : "ST"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[10px] font-extrabold tracking-tight truncate uppercase leading-none mb-1" style={{ color: primaryColor }}>Student Profile</h4>
                      <p className={`text-xs font-bold truncate ${isDark ? "text-slate-100" : "text-slate-800"} leading-none mb-1`}>{currentUser.displayName}</p>
                      <p className="text-[10px] text-emerald-505 flex items-center gap-1 font-semibold" style={{ color: isDark ? "#10b981" : "#059669" }}>
                        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: isDark ? "#10b981" : "#059669" }}></span> Offline Synced
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-200/20 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                      <span>Ledger balance:</span>
                      <span className="font-mono text-[#696fc7] font-extrabold">{points} Points</span>
                    </div>
                    
                    <button
                      onClick={() => { setAuthMode("backup"); setShowAuthModal(true); setAuthError(null); setAuthSuccess(null); }}
                      className="w-full text-left py-1 px-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-[10px] text-slate-400 hover:text-slate-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      📦 Export / Backup Workspace
                    </button>

                    <button
                      onClick={handleCustomSignOut}
                      className={`w-full py-1.5 rounded-xl text-center text-[10px] font-bold border cursor-pointer transition-all ${
                        isDark ? "bg-slate-805 hover:bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                      }`}
                    >
                      🚪 Sign Out of Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 flex flex-col items-center">
                  {/* Decorative Logo above login option */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md flex items-center justify-center my-0.5 bg-white/5 p-0.5 border border-slate-200/10 hover:scale-[1.04] transition-transform duration-300">
                    <img
                      src={aetriaLogo}
                      alt="Aetria Logo"
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* The App name logo written in Klemer display font */}
                  <span className="text-sm font-extrabold tracking-wide text-center" style={{ fontFamily: "var(--font-klemer)", color: isDark ? "#ffffff" : "#1e293b" }}>
                    Aetria
                  </span>

                  <div className={`w-full p-2 rounded-lg text-center text-[10.5px] font-medium leading-normal ${isDark ? 'bg-slate-800/40 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>
                    🔑 Save progress to change devices safely without losing data!
                  </div>
                  <button
                    onClick={() => { setAuthMode("login"); setShowAuthModal(true); setAuthError(null); setAuthSuccess(null); }}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all text-white text-[11px] font-extrabold shadow-xs cursor-pointer hover:scale-[1.01] ${activeTheme.accentClass}`}
                  >
                    <LogIn size={13} /> Sign In & Sync Hub
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-2">
              {currentUser ? (
                <div className="h-8 w-8 rounded-full border-2 border-emerald-500 flex items-center justify-center cursor-pointer overflow-hidden shadow-xs" title="Profile Active" onClick={() => setSidebarCollapsed(false)}>
                  <div className="h-full w-full text-white flex items-center justify-center font-bold text-xs select-none" style={{ backgroundColor: primaryColor }}>
                    {currentUser.displayName ? currentUser.displayName.substring(0, 1).toUpperCase() : "S"}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer hover:scale-105 ${lightAccentClass}`}
                  title="Unlock Cloud Sync"
                >
                  <LogIn size={15} />
                </button>
              )}
            </div>
          )}

          {/* Core pages section anchors (each element represented on a new section page) */}
          <div className="space-y-1">
            <span className={`text-[9px] font-bold uppercase tracking-widest block px-1.5 mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {sidebarCollapsed ? "NAV" : "Workspace Pages"}
            </span>
            
            <button
              onClick={() => { handleTabChange("dashboard"); }}
              className={`w-full text-left font-semibold text-xs px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 ${
                activeTab === "dashboard"
                  ? `${activeTheme.accentClass} font-bold`
                  : isDark ? "hover:bg-slate-800/45 text-slate-300" : "hover:bg-slate-100/90 text-slate-600"
              }`}
              title="Overview Dashboard & Gamification Profile"
            >
              <Home size={16} /> 
              {!sidebarCollapsed && <span>Desk Dash & Points</span>}
            </button>

            <button
              onClick={() => { handleTabChange("tasks"); }}
              className={`w-full text-left font-semibold text-xs px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                activeTab === "tasks" && !selectedTagPageId
                  ? `${activeTheme.accentClass} font-bold`
                  : isDark ? "hover:bg-slate-800/45 text-slate-300" : "hover:bg-slate-100/90 text-slate-600"
              }`}
              title="All Study Tasks List"
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare size={16} /> 
                {!sidebarCollapsed && <span>Course Milestones</span>}
              </div>
              {!sidebarCollapsed && (
                <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold ${activeTab === "tasks" ? "bg-black/15 text-white" : "bg-black/5 dark:bg-white/10 text-current"}`}>
                  {data.tasks.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { handleTabChange("habits"); }}
              className={`w-full text-left font-semibold text-xs px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 ${
                activeTab === "habits"
                  ? `${activeTheme.accentClass} font-bold`
                  : isDark ? "hover:bg-slate-800/45 text-slate-300" : "hover:bg-slate-100/90 text-slate-600"
              }`}
              title="Daily & Weekly Habit Calendars"
            >
              <Flame size={16} /> 
              {!sidebarCollapsed && <span>Discipline Tracker</span>}
            </button>

            <button
              onClick={() => { handleTabChange("calendar"); }}
              className={`w-full text-left font-semibold text-xs px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 ${
                activeTab === "calendar"
                  ? `${activeTheme.accentClass} font-bold`
                  : isDark ? "hover:bg-slate-800/45 text-slate-300" : "hover:bg-slate-100/90 text-slate-600"
              }`}
              title="Academic Events & Schedules Calendar"
            >
              <Calendar size={16} /> 
              {!sidebarCollapsed && <span>Visual Calendar</span>}
            </button>

            <button
              onClick={() => { handleTabChange("timer"); }}
              className={`w-full text-left font-semibold text-xs px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 ${
                activeTab === "timer"
                  ? `${activeTheme.accentClass} font-bold`
                  : isDark ? "hover:bg-slate-800/45 text-slate-300" : "hover:bg-slate-100/90 text-slate-600"
              }`}
              title="Focus Pomodoro timer, custom chimes"
            >
              <Clock size={16} /> 
              {!sidebarCollapsed && <span>Study Focus Timer</span>}
            </button>

            <button
              onClick={() => { handleTabChange("atmosphere"); }}
              className={`w-full text-left font-semibold text-xs px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 ${
                activeTab === "atmosphere"
                  ? `${activeTheme.accentClass} font-bold`
                  : isDark ? "hover:bg-slate-800/45 text-slate-300" : "hover:bg-slate-100/90 text-slate-600"
              }`}
              title="Ambiance Canvas and Weather Overlays Configuration"
            >
              <Palette size={16} /> 
              {!sidebarCollapsed && <span>Visual Atmosphere</span>}
            </button>

            <button
              onClick={() => { handleTabChange("media"); }}
              className={`w-full text-left font-semibold text-xs px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 ${
                activeTab === "media"
                  ? `${activeTheme.accentClass} font-bold`
                  : isDark ? "hover:bg-slate-800/45 text-slate-300" : "hover:bg-slate-100/90 text-slate-600"
              }`}
              title="Relaxing focus soundscapes, binaural frequencies, custom links"
            >
              <Headphones size={16} /> 
              {!sidebarCollapsed && <span>Focus soundscapes</span>}
            </button>

            <button
              onClick={() => { handleTabChange("tags"); }}
              className={`w-full text-left font-semibold text-xs px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 ${
                activeTab === "tags"
                  ? `${activeTheme.accentClass} font-bold`
                  : isDark ? "hover:bg-slate-800/45 text-slate-300" : "hover:bg-slate-100/90 text-slate-600"
              }`}
              title="Rename, custom recolor and delete lists/tags"
            >
              <Tags size={16} /> 
              {!sidebarCollapsed && <span>Manage Lists & Tags</span>}
            </button>

            <button
              onClick={() => { handleTabChange("support"); }}
              className={`w-full text-left font-semibold text-xs px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 ${
                activeTab === "support"
                  ? `${activeTheme.accentClass} font-bold`
                  : isDark ? "hover:bg-slate-800/45 text-slate-300" : "hover:bg-slate-100/90 text-slate-600"
              }`}
              title="Support Me (Ko-fi)"
            >
              <Heart size={16} className="text-rose-500 animate-pulse" /> 
              {!sidebarCollapsed && <span className="text-rose-500 font-bold">Support Me</span>}
            </button>
          </div>

          {/* Quick Active Custom list sections links */}
          {!sidebarCollapsed && (
            <div className="space-y-1.5 border-t border-slate-700/10 pt-4">
              <div className="flex items-center justify-between px-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Tag Pages
                </span>
                <button
                  id="toggle-tag-config-btn"
                  onClick={() => setShowTagConfig(!showTagConfig)}
                  className="text-[10px] font-bold hover:underline"
                  style={{ color: primaryColor }}
                >
                  {showTagConfig ? "Close" : "+ New"}
                </button>
              </div>

              {showTagConfig && (
                <form onSubmit={handleCreateCustomTag} className={`p-2.5 rounded-xl border text-xs gap-2 space-y-2 ${isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white/90 border-slate-200"}`}>
                  <input
                    type="text"
                    required
                    value={customTagName}
                    onChange={(e) => setCustomTagName(e.target.value)}
                    placeholder="e.g. Physics Lab"
                    className={`w-full border rounded p-1.5 text-xs focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-white focus:border-slate-500" : "bg-white border-slate-300 text-slate-800 focus:border-slate-400"}`}
                  />
                  <div className="grid grid-cols-4 gap-1">
                    {presetHexColors.map((col) => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setCustomTagColor(col)}
                        style={{ backgroundColor: col }}
                        className={`h-4 rounded-md border ${
                          customTagColor === col ? "border-slate-800 scale-105" : "border-transparent"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    className={`w-full font-bold py-1 rounded text-[10px] ${activeTheme.accentClass}`}
                  >
                    Save List Page
                  </button>
                </form>
              )}

              <div className="space-y-0.5">
                {data.tags.map((tg) => {
                  const isActive = activeTab === "tag-filter" && selectedTagPageId === tg.id;
                  const tagCount = data.tasks.filter((t) => t.tags.includes(tg.id)).length;
                  return (
                    <button
                      key={tg.id}
                      onClick={() => {
                        handleTabChange("tag-filter", tg.id);
                      }}
                      style={{
                        backgroundColor: isActive ? `${primaryColor}22` : undefined,
                        color: isActive ? primaryColor : undefined
                      }}
                      className={`w-full flex items-center justify-between font-semibold text-[11px] px-2.5 py-1.5 rounded-lg transition-all ${
                        isActive 
                          ? "font-bold" 
                          : isDark ? "text-slate-400 hover:bg-slate-900/40" : "text-slate-500 hover:bg-black/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-1">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tg.color }} />
                        <span className="truncate">{tg.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">({tagCount})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Looming alerts checklist summary inside sidebar */}
          {!sidebarCollapsed && todayDue.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 space-y-1.5 text-xs">
              <span className="font-bold text-red-500 uppercase tracking-wider text-[9px] flex items-center gap-1">
                ⚠️ Deadline alert
              </span>
              <p className="text-[10px] text-red-400 line-clamp-1">
                You have {todayDue.length} essay/test milestones today!
              </p>
              <button
                onClick={() => { handleTabChange("tasks"); }}
                className="text-[10px] text-red-500 underline hover:text-red-400 block"
              >
                Go handle them &rarr;
              </button>
            </div>
          )}

        </aside>

        {/* Center Canvas View space */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto w-full">
          
          {/* Header Description Sub-section overview */}
          <div className={`p-4 rounded-3xl ${cardClass} flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300`}>
            <div>
              <div className="flex items-center gap-2">
            
              </div>
              <h2 className="text-xl font-bold tracking-tight mt-1 capitalize">
                {activeTab === "dashboard" && "Study Station Dashboard"}
                {activeTab === "tasks" && "Milestone Homework desk"}
                {activeTab === "habits" && "Discipline Habits calendar"}
                {activeTab === "calendar" && "Interactive Visual scheduling"}
                {activeTab === "timer" && "Focus Room Pomodoro"}
                {activeTab === "atmosphere" && "Ambiance & Sound control"}
                {activeTab === "tags" && "Configuration list tags panel"}
                {activeTab === "tag-filter" && `Course channel: ${activeTagDetails?.name}`}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTab === "dashboard" && "Track personalized productivity points, monitor study checklist progress, and build status habits."}
                {activeTab === "tasks" && "Toggle automated status checking. Add notes, set custom dates, and complete homeworks."}
                {activeTab === "habits" && "Complete healthy student routines to multiplier consecutive day statistics."}
                {activeTab === "calendar" && "Plan study start dates and examination deadlines visually. Click days to add task."}
                {activeTab === "timer" && "Study intervals without stress. Loops white noise, rain soundscapes, or coffee cups."}
                {activeTab === "atmosphere" && "Build your sensory aesthetic. Swap backgrounds plus falling elements overlays."}
                {activeTab === "tags" && "Edit existing database list names, color themes, or delete old list channels."}
                {activeTab === "tag-filter" && `Filtered list overview for tag "${activeTagDetails?.name}".`}
              </p>
            </div>

            {/* Quick action helper togglers */}
            <div className="flex gap-2.5">
              {(activeTab === "tasks" || activeTab === "tag-filter") && (
                <button
                  id="tasks-show-form-btn"
                  onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                  className={`font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 ${activeTheme.accentClass}`}
                >
                  <Plus size={16} /> {showAddTaskForm ? "Cancel Form" : "Upload Task"}
                </button>
              )}
              {activeTab === "dashboard" && (
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Total Points</span>
                  <span className="text-xl font-bold font-mono inline-flex items-center gap-1" style={{ color: primaryColor }}>
                    💎 {points} Points
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE VIEW TAB CONTENT OR SECTIONS */}

          {/* ==================== 0. DASHBOARD VIEW ==================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6" id="dashboard-desk-section">
              {/* Top Summary widgets row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Points Stat Card */}
                <div className={`p-5 rounded-3xl ${cardClass} flex items-center gap-4`}>
                  <div className={`p-3 rounded-2xl ${lightAccentClass}`}>
                    <Award size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Productivity Score</span>
                    <span className="text-2xl font-black font-mono" style={{ color: primaryColor }}>{points} Points</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Earned from completed tasks</span>
                  </div>
                </div>

                {/* Task Stats Card */}
                <div className={`p-5 rounded-3xl ${cardClass} flex items-center gap-4`}>
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                    <CheckSquare size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Checklists status</span>
                    <span className="text-2xl font-black font-mono">
                      {data.tasks.filter(t => t.progress === 100).length} / {data.tasks.length}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Milestones completed</span>
                  </div>
                </div>

                {/* Habit consistency stats */}
                <div className={`p-5 rounded-3xl ${cardClass} flex items-center gap-4`}>
                  <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl">
                    <Flame size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Habit Streaks</span>
                    <span className="text-2xl font-black font-mono">
                      {data.habits.length > 0 
                        ? Math.max(...data.habits.map(h => h.completionHistory.length), 0)
                        : 0} Days
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Consecutive highest streak</span>
                  </div>
                </div>

              </div>

              {/* Pending Task Desk Checklist overview */}
              <div className={`p-6 rounded-3xl ${cardClass} space-y-4`}>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5 text-slate-500">
                  <CheckSquare size={16} /> Urgent High Priority Milestones
                </h3>

                <div className="space-y-2.5">
                  {data.tasks.filter(t => t.progress < 100).length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Excellent workspace status. No pending study tasks are currently registered.
                    </div>
                  ) : (
                    data.tasks.filter(t => t.progress < 100).slice(0, 3).map((task) => (
                      <div key={task.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
                        <div className="truncate">
                          <h4 className="font-bold text-xs truncate">{task.title}</h4>
                          <span className="text-[10px] text-red-500 font-semibold font-mono">Due: {task.deadline}</span>
                        </div>
                        <button
                          onClick={() => { setSelectedTask(task); }}
                          className={`font-bold text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${activeTheme.accentClass}`}
                        >
                          Milestone Desk &rarr;
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 1. TASKS / MILESTONES DESK ==================== */}
          {(activeTab === "tasks" || activeTab === "tag-filter") && (
            <div className="space-y-4" id="tasks-desk-section">
              {/* Form container */}
              {showAddTaskForm && (
                <div className={`p-5 rounded-3xl ${cardClass} border space-y-4`} style={{ borderColor: primaryColor }}>
                  <h3 className="font-bold text-xs uppercase flex items-center gap-1.5" style={{ color: primaryColor }}>
                    <CalendarCheck size={16} /> File New Homework Agenda
                  </h3>
                  <form onSubmit={handleAddNewTask} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Milestone Heading</label>
                        <input
                          type="text"
                          required
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="e.g. Linear Algebra Vector proofs"
                          className={`w-full p-2.5 rounded-xl border ${isDark ? "bg-slate-850 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Brief Prompts details</label>
                        <input
                          type="text"
                          value={newTaskDesc}
                          onChange={(e) => setNewTaskDesc(e.target.value)}
                          placeholder="e.g. Solve problems 1-12 in book"
                          className={`w-full p-2.5 rounded-xl border ${isDark ? "bg-slate-850 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                        <input
                          type="date"
                          value={newTaskStart}
                          onChange={(e) => setNewTaskStart(e.target.value)}
                          className={`w-full p-2 rounded-xl border ${isDark ? "bg-slate-850 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-red-500 uppercase">Due Deadline</label>
                        <input
                          type="date"
                          required
                          value={newTaskDeadline}
                          onChange={(e) => setNewTaskDeadline(e.target.value)}
                          className={`w-full p-2 rounded-xl border ${isDark ? "bg-slate-850 border-slate-700 bg-red-950/20 text-white border-red-500/30" : "bg-red-50/50 border-red-200 text-slate-800"}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase block font-mono" style={{ color: primaryColor }}>Award Points</label>
                        <select
                          value={newTaskPoints}
                          onChange={(e) => setNewTaskPoints(Number(e.target.value))}
                          className={`w-full p-2 rounded-xl border text-xs font-bold leading-tight ${isDark ? "bg-slate-850 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
                        >
                          <option value={1}>1p</option>
                          <option value={3}>3p</option>
                          <option value={5}>5p</option>
                          <option value={10}>10p</option>
                          <option value={15}>15p</option>
                          <option value={20}>20p</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Assign Tag Lists</label>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {data.tags.map((t) => {
                            const hasSelected = newTaskTags.includes(t.id);
                            return (
                              <button
                                type="button"
                                key={t.id}
                                onClick={() => toggleNewTaskFormTag(t.id)}
                                className="text-[10px] px-2.5 py-1 rounded-full border transition-all"
                                style={{
                                  borderColor: t.color,
                                  backgroundColor: hasSelected ? t.color : "transparent",
                                  color: hasSelected ? "#fff" : t.color
                                }}
                              >
                                {t.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`w-full font-bold py-2.5 rounded-xl shadow-md transition-all ${activeTheme.accentClass}`}
                    >
                      Save Homework Agenda
                    </button>
                  </form>
                </div>
              )}

              {/* Tasks List rendering */}
              {displayedTasks.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl ${cardClass} text-slate-400 font-medium`}>
                  {activeTab === "tag-filter" 
                    ? `No current tasks are associated with "${activeTagDetails?.name}".`
                    : "No academic milestones pending. You are completely clean on homework!"}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`${cardClass} rounded-3xl p-5 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between gap-4`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {/* Auto progress check toggled with click of a checkbox button */}
                            <button
                              id={`checkbox-complete-task-${task.id}`}
                              onClick={() => handleToggleTaskCheckboxInList(task)}
                              className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                                task.progress === 100 
                                  ? "bg-emerald-500 border-emerald-600 text-white" 
                                  : "opacity-85 hover:opacity-100"
                              }`}
                              style={{ borderColor: task.progress === 100 ? undefined : primaryColor }}
                              title="Instant Toggle Complete Button"
                            >
                              {task.progress === 100 && <CheckCircle size={14} className="stroke-[3]" />}
                            </button>
                            <h4 className={`font-bold text-sm leading-tight ${task.progress === 100 ? "line-through text-slate-400" : ""}`}>
                              {task.title}
                            </h4>
                          </div>
                          
                          <span className={`text-[9px] font-bold uppercase rounded-md px-2 py-0.5 border ${
                            task.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : task.status === "In Progress"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                          }`}>
                            {task.status}
                          </span>
                        </div>

                        <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} line-clamp-2 leading-relaxed`}>
                          {task.description || "No customized prompt instructions."}
                        </p>

                        {/* Subtask counts indicator */}
                        {task.subtasks.length > 0 && (
                          <div className={`text-[10px] p-2 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                            <span className="font-bold text-[9px] uppercase tracking-wider block mb-1">Checklist progress steps:</span>
                            <div className="space-y-0.5 max-h-16 overflow-y-auto">
                              {task.subtasks.map(s => (
                                <div key={s.id} className="flex items-center gap-1">
                                  <span>{s.completed ? "☑️" : "⬜"}</span>
                                  <span className={s.completed ? "line-through opacity-50" : ""}>{s.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                            <span>Step Progress:</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-300/30 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${task.progress}%`, backgroundColor: primaryColor }} />
                          </div>
                        </div>
                      </div>

                      {/* footer details */}
                      <div className="flex items-center justify-between border-t border-slate-200-dark pt-3">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-bold font-mono text-orange-500 uppercase bg-orange-500/10 px-2 py-0.5 rounded-md">
                            ⏰ Due: {task.deadline}
                          </span>
                          <span className="text-[10px] font-bold font-mono text-blue-500 uppercase bg-blue-500/10 px-2 py-0.5 rounded-md">
                            💎 Reward: {task.points || 3}p
                          </span>
                        </div>

                        <button
                          id={`details-task-btn-${task.id}`}
                          onClick={() => { setSelectedTask(task); }}
                          className="text-xs font-bold transition-all hover:underline"
                          style={{ color: primaryColor }}
                        >
                          Actions &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== 2. HABITS DESK ==================== */}
          {activeTab === "habits" && (
            <HabitTracker
              habits={data.habits}
              tags={data.tags}
              simulatedDate={simulatedDate}
              onSaveHabit={handleSaveHabit}
              onToggleHabit={handleToggleHabitDay}
              onDeleteHabit={handleDeleteHabit}
              isDark={isDark}
              primaryColor={primaryColor}
              lightAccentClass={lightAccentClass}
              cardClass={cardClass}
              bannerClass={bannerClass}
              accentClass={accentClass}
            />
          )}

          {/* ==================== 3. ACADEMIC CALENDAR ==================== */}
          {activeTab === "calendar" && (
            <CalendarView
              tasks={data.tasks}
              tags={data.tags}
              simulatedDate={simulatedDate}
              onCreateTaskOnDate={handleQuickCreateOnDate}
              onSelectTask={(task) => setSelectedTask(task)}
              isDark={isDark}
              primaryColor={primaryColor}
              lightAccentClass={lightAccentClass}
              cardClass={cardClass}
              bannerClass={bannerClass}
              accentClass={accentClass}
            />
          )}

          {/* ==================== 4. POMODORO TIMER ==================== */}
          {activeTab === "timer" && (
            <div className="max-w-md mx-auto" id="pomodoro-timer-desk-section">
              <PomodoroTimer
                settings={data.pomodoroSettings}
                onUpdateSettings={handleUpdatePomodoro}
                onAddNotification={handleAddSystemNotification}
                isDark={isDark}
                primaryColor={primaryColor}
                lightAccentClass={lightAccentClass}
                cardClass={cardClass}
                bannerClass={bannerClass}
                accentClass={accentClass}
              />
            </div>
          )}

          {/* ==================== 5. ATMOSPHERIC STUDIO ==================== */}
          {activeTab === "atmosphere" && (
            <div className={`p-6 rounded-3xl ${cardClass} space-y-6`} id="atmosphere-desk-section">
              
              {/* Background theme selector */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Palette size={18} style={{ color: primaryColor }} /> Choose Cozy Study Background
                </h3>
                <p className="text-xs text-slate-400">Transform the desk theme. Gradients dynamically adapt interface contrast.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
                  {THEME_PALETTES.map((bg) => {
                    const isBgActive = data.themeBackground === bg.id;
                    return (
                      <button
                        key={bg.id}
                        onClick={() => handleUpdateAtmosphere({ themeBackground: bg.id })}
                        style={{
                          ...bg.bgStyle,
                          boxShadow: isBgActive ? `0 0 0 2px ${primaryColor}` : undefined,
                          borderColor: isBgActive ? primaryColor : undefined
                        }}
                        className={`p-3.5 rounded-2xl border text-[11px] font-bold text-center transition-all cursor-pointer shadow-xs hover:scale-[1.015] ${
                          bg.isDark ? "text-slate-100 border-slate-700/60" : "text-slate-800 border-slate-200/60"
                        } ${
                          isBgActive ? "scale-[1.03] font-black" : ""
                        }`}
                      >
                        {bg.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weather effect selectors */}
              <div className="space-y-3 pt-4 border-t border-slate-700/10">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <CloudRain size={18} style={{ color: primaryColor }} /> Weather Particle Overlays
                </h3>
                <p className="text-xs text-slate-400">Spawn dynamic canvas physics on top of your studying workspace.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { id: "none", name: "☀️ Cozy Sunshine" },
                    { id: "rain", name: "🌧️ Soft Rain" },
                    { id: "heavy-rain", name: "⛈️ Torrential Thunderstorm" },
                    { id: "cherry-blossoms", name: "🌸 Falling Cherry Blossoms" },
                    { id: "snow", name: "❄️ Drift Snowflakes" },
                    { id: "autumn-leaves", name: "🍁 Tumble Autumn Leaves" }
                  ].map((we) => (
                    <button
                      key={we.id}
                      onClick={() => handleUpdateAtmosphere({ weatherEffect: we.id as any })}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        data.weatherEffect === we.id 
                          ? `${activeTheme.accentClass} scale-105` 
                          : isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {we.name}
                    </button>
                  ))}
                </div>

                {/* Weather custom sliders (opacity and amount/density) */}
                {data.weatherEffect !== "none" && (
                  <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl p-4 rounded-2xl border ${
                    isDark ? "bg-slate-900/30 border-slate-800" : "bg-slate-50 border-slate-200/60"
                  }`}>
                    
                    {/* Weather Opacity Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400 font-bold">
                        <span>Element Opacity</span>
                        <span>{data.weatherOpacity !== undefined ? data.weatherOpacity : 70}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold">Faint</span>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={data.weatherOpacity !== undefined ? data.weatherOpacity : 70}
                          onChange={(e) => handleUpdateAtmosphere({ weatherOpacity: parseInt(e.target.value) })}
                          style={{ accentColor: primaryColor }}
                          className="flex-1 h-1 bg-slate-200 rounded-lg appearance-auto cursor-pointer"
                        />
                        <span className="text-[10px] font-bold" style={{ color: primaryColor }}>Vivid</span>
                      </div>
                    </div>

                    {/* Weather Density Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400 font-bold">
                        <span>Weather Density</span>
                        <span>{data.weatherDensity !== undefined ? data.weatherDensity : 50}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold">Light</span>
                        <input
                          type="range"
                          min="10"
                          max="150"
                          value={data.weatherDensity !== undefined ? data.weatherDensity : 50}
                          onChange={(e) => handleUpdateAtmosphere({ weatherDensity: parseInt(e.target.value) })}
                          style={{ accentColor: primaryColor }}
                          className="flex-1 h-1 bg-slate-200 rounded-lg appearance-auto cursor-pointer"
                        />
                        <span className="text-[10px] font-bold" style={{ color: primaryColor }}>Dense</span>
                      </div>
                    </div>

                  </div>
                )}
              </div>





            </div>
          )}

          {/* ==================== 5B. FOCUS AUDIO & MUSIC (CUSTOM MEDIA) ==================== */}
          {activeTab === "media" && (
            <div className={`p-6 rounded-3xl ${cardClass} space-y-6`} id="media-desk-section">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700/10">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Headphones size={18} style={{ color: primaryColor }} /> Acoustic Focus Hub
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Isolate noise. Tune into your cognitive rhythm.
                </span>
              </div>

              {/* sound effects loop synth controllers */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Volume2 size={18} style={{ color: primaryColor }} /> Acoustic Focus Frequencies
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 font-mono font-bold px-2 py-0.5 rounded-md uppercase" style={{ color: isDark ? '#34d399' : '#059669', borderColor: isDark ? '#10b98133' : '#05966933' }}>
                    Built-in Web Audio Native Synth
                  </span>
                </div>
                <p className="text-xs text-slate-400">Zero loading delay. Continuously loop therapeutic noise levels or organic ambient cafe chatter.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: "none", name: "🔇 Mute audio" },
                    { id: "white-noise", name: "🎚️ White Noise" },
                    { id: "pink-noise", name: "🎚️ Pink Noise" },
                    { id: "brown-noise", name: "🎚️ Brown Noise" },
                    { id: "rain", name: "🌧️ Gentle Rain" },
                    { id: "heavy-rain", name: "⛈️ Heavy Rain & Thunder" },
                    { id: "cafe", name: "☕ Local Café Chatter" }
                  ].map((as) => (
                    <button
                      key={as.id}
                      onClick={() => handleUpdateAtmosphere({ ambientSound: as.id as any })}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        data.ambientSound === as.id 
                          ? `${activeTheme.accentClass} scale-105` 
                          : isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {as.name}
                    </button>
                  ))}
                </div>

                {/* Ambient dynamic volume slider controller */}
                {data.ambientSound !== "none" && (
                  <div className="pt-3 max-w-sm space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 font-bold">
                      <span>Soundscape Volume</span>
                      <span>{data.ambientVolume}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <VolumeX size={15} className="text-slate-400" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={data.ambientVolume}
                        onChange={(e) => handleUpdateAtmosphere({ ambientVolume: parseInt(e.target.value) })}
                        style={{ accentColor: primaryColor }}
                        className="flex-1 h-1 bg-slate-200 rounded-lg appearance-auto cursor-pointer"
                      />
                      <Volume2 size={15} className="font-bold" style={{ color: primaryColor }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Soundtracks Panel */}
              <div className={`p-5 rounded-2xl border ${
                isDark ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200/60"
              }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Music size={18} className="text-rose-500 animate-pulse" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Custom Soundtracks
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Overlay your own playlist, study song, or podcast with the ambient background noises. Add any links from <strong>Spotify</strong>, <strong>YouTube</strong>, <strong>YouTube Music</strong>, <strong>Apple Music</strong>, or <strong>Amazon Music</strong>.
                  </p>

                  {/* Add soundtrack form */}
                  <form onSubmit={handleAddCustomTrack} className="space-y-3 mb-5 p-3 rounded-xl bg-black/10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Save a Track or Playlist</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={customTrackName}
                        onChange={(e) => setCustomTrackName(e.target.value)}
                        placeholder="e.g. Lofi Study Session Beats"
                        className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-hidden ${
                          isDark 
                            ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-650 focus:border-rose-550" 
                            : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                        }`}
                      />
                      <input
                        type="text"
                        value={customTrackUrl}
                        onChange={(e) => setCustomTrackUrl(e.target.value)}
                        placeholder="Paste link: Spotify, YouTube, Apple, or Amazon..."
                        className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-hidden ${
                          isDark 
                            ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-650 focus:border-rose-550" 
                            : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 text-xs font-bold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all select-none cursor-pointer"
                    >
                      ➕ Add Custom Soundtrack
                    </button>
                  </form>

                  {/* Soundtrack Selection Hub */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center pb-1 border-b border-slate-705/10">
                      <span className="text-[10px] text-slate-450 font-bold uppercase">Saved Soundtracks ({customSoundtracks.length})</span>
                      {activeSoundtrackId && (
                        <button
                          onClick={() => handleSelectSoundtrack(null)}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ⏹️ Stop Soundtrack
                        </button>
                      )}
                    </div>

                    {customSoundtracks.length === 0 ? (
                      <p className="text-[11px] text-slate-450 italic text-center py-2">No custom soundtracks loaded yet.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto">
                        {customSoundtracks.map((track) => {
                          const isActive = activeSoundtrackId === track.id;
                          const isSpot = track.url.includes("spotify.com");
                          const isYT = track.url.includes("youtube.com") || track.url.includes("youtu.be");
                          const isApple = track.url.includes("music.apple.com");
                          const isAmazon = track.url.includes("music.amazon.com");

                          let tagGroup = "Direct File";
                          let tagStyle = "bg-sky-500/10 text-sky-500 border-sky-500/15";
                          if (isSpot) {
                            tagGroup = "Spotify";
                            tagStyle = "bg-emerald-500/10 text-emerald-500 border-emerald-500/15";
                          } else if (isYT) {
                            tagGroup = "YouTube";
                            tagStyle = "bg-rose-500/10 text-rose-400 border-rose-500/15";
                          } else if (isApple) {
                            tagGroup = "Apple Music";
                            tagStyle = "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/15";
                          } else if (isAmazon) {
                            tagGroup = "Amazon Music";
                            tagStyle = "bg-amber-550/10 text-amber-500 border-amber-500/15";
                          }

                          return (
                            <div
                              key={track.id}
                              className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                                isActive 
                                  ? isDark
                                    ? "bg-slate-800 border-emerald-500 text-white"
                                    : "bg-emerald-50 border-emerald-555 text-emerald-900"
                                  : isDark 
                                    ? "bg-slate-950/45 border-slate-850 hover:bg-slate-800" 
                                    : "bg-white border-slate-150 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-2 max-w-[70%] truncate">
                                <span className={`text-[9px] font-mono border rounded px-1 flex-shrink-0 uppercase ${tagStyle}`}>
                                  {tagGroup}
                                </span>
                                <span className="font-semibold truncate">{track.name}</span>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() => handleSelectSoundtrack(isActive ? null : track.id)}
                                  className={`px-2 py-1 text-[10px] font-bold rounded-md select-none cursor-pointer transition-all ${
                                    isActive
                                      ? "bg-rose-500 text-white hover:bg-rose-600"
                                      : isDark 
                                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200" 
                                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {isActive ? "Pause" : "Play/Select"}
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomTrack(track.id)}
                                  className="text-slate-450 hover:text-rose-555 p-1 transition-colors"
                                  title="Remove Saved Track"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Active embedded music interface */}
                  {activeSoundtrackId && (() => {
                    const track = customSoundtracks.find(t => t.id === activeSoundtrackId);
                    if (!track) return null;

                    const isSpot = track.url.includes("spotify.com");
                    const isYT = track.url.includes("youtube.com") || track.url.includes("youtu.be");
                    const isApple = track.url.includes("music.apple.com");
                    const isAmazon = track.url.includes("music.amazon.com");

                    if (isSpot) {
                      const spotUrl = getSpotifyEmbedUrl(track.url);
                      return spotUrl ? (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Spotify In-App Player
                          </p>
                          <iframe
                            src={spotUrl}
                            width="100%"
                            height="152"
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="rounded-2xl border-0 shadow-lg"
                          />
                        </div>
                      ) : null;
                    }

                    if (isYT) {
                      const ytUrl = getYoutubeEmbedUrl(track.url);
                      return ytUrl ? (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> YouTube Video Connection
                          </p>
                          <iframe
                            width="100%"
                            height="180"
                            src={ytUrl}
                            title="YouTube Player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-2xl border-0 shadow-lg"
                          />
                        </div>
                      ) : null;
                    }

                    if (isApple) {
                      const appleUrl = getAppleMusicEmbedUrl(track.url);
                      return appleUrl ? (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" /> Apple Music Embed
                          </p>
                          <iframe
                            allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                            frameBorder="0"
                            height="150"
                            style={{ width: "100%", overflow: "hidden", background: "transparent" }}
                            src={appleUrl}
                            className="rounded-2xl"
                          />
                        </div>
                      ) : null;
                    }

                    if (isAmazon) {
                      const amazonUrl = getAmazonMusicEmbedUrl(track.url);
                      return amazonUrl ? (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Amazon Music Embed
                          </p>
                          <iframe
                            src={amazonUrl}
                            width="100%"
                            height="150"
                            style={{ border: "0" }}
                            className="rounded-2xl"
                          />
                        </div>
                      ) : null;
                    }

                    // Non-embed files simply provide visual connection details
                    return (
                      <div className="p-4 rounded-2xl bg-slate-950/25 border border-slate-705/10 space-y-2 text-center">
                        <p className="text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 font-sans">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected Media Stream
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{track.name}</p>
                        <p className="text-[10px] text-slate-500 truncate select-all font-mono">{track.url}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
          )}

          {/* ==================== 5C. SUPPORT ME PAGE ==================== */}
          {activeTab === "support" && (
            <div className={`p-8 rounded-3xl ${cardClass} space-y-6 max-w-3xl mx-auto`} id="support-desk-section">
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-rose-500/10 text-rose-500 mb-1">
                  <Heart size={32} className="text-rose-500 animate-pulse fill-rose-500/10" />
                </div>
                <h2 className="text-2xl font-black tracking-tight font-sans">Support Aetria's Development (and me!)</h2>
                <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: primaryColor }}>
                  "Breathe in, Tune out"
                </p>
              </div>

              <div className={`p-6 rounded-2xl border text-sm text-left leading-relaxed space-y-6 ${
                isDark ? "bg-slate-900/40 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-150 text-slate-600"
              }`}>
                
                {/* Section: Welcome to Aetria */}
                <div className="space-y-3">
                  <h3 className={`font-extrabold text-sm ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    WELCOME TO AETRIA!!!!(yippee!!):
                  </h3>
                  <div className={`space-y-3 text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    <p>
                      Aetria is not just any student productivity app; it's the ultimate multitasking ninja that brings all your tasks, habits, focus, and progress together under one roof. No juggling, no context-switching, just you and your work having a blast.
                    </p>
                    <p>
                      With Aetria, you can create tasks and projects while enjoying built-in progress tracking. Set deadlines and get notified ahead of time; you even get to choose how many days in advance. Plus, you can use custom tags to keep everything as neatly organized as a pantry stocked by Marie Kondo.
                    </p>
                    <p>
                      The built-in focus timer is like your personal cheerleader, helping you get into the zone and stay there. The longer you focus, the more points you earn. It's like a game, but with the added bonus of actually getting stuff done! It's not just about completing tasks; it's about earning points for completing tasks and focus sessions. It's a small but satisfying nudge to keep the momentum going, and who doesn't love a good old dopamine rush?
                    </p>
                    <p>
                      With Aetria's habit tracker, you can build and track daily habits that are fully editable to fit your routine. It's like having a personal coach cheering you on, but without the judgmental stares.
                    </p>
                    <p>
                      Aetria offers personalization options that make it feel like it's yours. You can switch between themes, tweak the UI colors, add background noise to help you concentrate, and even bring in weather elements for a little ambient vibe. It's like having a personal assistant that knows just how you like things.
                    </p>
                  </div>
                </div>

                {/* Section: Meet the Developer */}
                <div className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"} pt-5 space-y-3`}>
                  <h3 className={`font-extrabold text-sm ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    MEET THE DEVELOPER (me, hehe):
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                    Hey there, I'm Calypso/Apocalypso/Cal, a young developer and student still figuring things out. Aetria is my first major project, but let's be real, it was born more out of frustration than a desire for a coding challenge. I mean, who has time to juggle a bunch of apps just to keep up with their own work? Not me, that's for sure! So, I thought, why not create one super app to rule them all? Genius, right? Experience-wise, I may not have a lifetime of it, but hey, I know what us students really need because, well, I am one. Aetria is my way of tackling a genuine problem for real people, and boy, am I learning a truckload in the process!
                  </p>
                </div>

                {/* Section: Why must I listen */}
                <div className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"} pt-5 space-y-3`}>
                  <h3 className={`font-extrabold text-sm ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    WHY MUST I LISTEN TO YOU WEIRD HUMAN?:
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                    Why Aetria, you ask? Well, because productivity tools shouldn't feel like another chore. Aetria is designed to be simple enough to actually use, and complete enough that you won't need anything else (This app is still a beta version for now...). It's like the cool kid in the productivity tools world; it's here to make things easier and more fun. (Trust me, I know, I'm a student myself hehe..)
                  </p>
                </div>

                {/* Section: Give me feedback */}
                <div className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"} pt-5 space-y-3`}>
                  <h3 className={`font-extrabold text-sm ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    GIVE ME FEEDBACK!!!:
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                    Got a suggestion or ran into something? Aetria's all ears and would love to hear it. You can open an issue or reach out directly, and be assured that your feedback won't just disappear into the app void.
                  </p>
                  <p className={`text-[11px] select-text font-mono mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    contact me: apocalypso.projects2512@gmail.com
                  </p>
                </div>

                {/* Section: Support Me Please */}
                <div className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"} pt-5 space-y-3`}>
                  <h3 className={`font-extrabold text-sm ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    SUPPORT ME PLEASE!! (i need the money (╥﹏╥) ) :
                  </h3>
                  <div className={`space-y-3 text-xs leading-relaxed ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                    <p>
                      Aetria is and will always strive to be free- no paywalls, no locked features. But, keeping it that way means I have to make a choice. I could slap ads everywhere and call it a day or sell your data to bloodthirsty hounds who want your data like how some people are obssessed over oil (jk, don't come after me), but honestly? Ads are annoying, they clutter the experience and selling data is unsafe for you guys as users, and they go against everything Aetria is supposed to be: a clean, focused and safe space for you to actually get stuff done.
                    </p>
                    <p>
                      So, instead of bombarding you with ads or tossing your data like a bone for a dog, I'm keeping Aetria ad-free and leaving it up to you. If Aetria has been your productivity wingman, helped you focus a little better, or just made you feel slightly more in control of your chaos, consider buying me a coffee. It helps me keep the lights on, keep improving the app, and most importantly, keep the ads and data selling out. No pressure at all. Even just using the app and sharing it with a friend means the world. (I will try to create a referral system, because my smooth brain is unable to figure out marketting because I'm just one person making this ദ്ദി( ༎ຶ‿༎ຶ ) )
                    </p>
                  </div>
                </div>

                {/* Buy me a coffee layout */}
                <div className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"} pt-5 text-center space-y-4`}>
                  <h3 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    Support on Polar:
                  </h3>
                  <div className="pt-2">
                    <a
                      href="https://polar.sh"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ backgroundColor: "#D552A3" }}
                      className="inline-flex items-center gap-2.5 text-white text-sm font-black px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-[1.03] active:scale-95 select-none cursor-pointer font-sans"
                    >
                      <Heart size={18} className="fill-white/30" />
                      Support Aetria (beta) on Polar (COMING SOON!)
                    </a>
                    <p className="text-[10px] text-slate-400 font-mono mt-3 uppercase tracking-widest">
                      Secure support via Polar.sh: Global payments supported (COMING SOON!)
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== 6. MANAGE LISTS & TAGS CONFIGURATION PAGE ==================== */}
          {activeTab === "tags" && (
            <div className={`p-6 rounded-3xl ${cardClass} space-y-4`} id="tags-desk-section">
              <div className="flex items-center justify-between pb-2 border-b border-slate-705/10">
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                  <Tags size={18} style={{ color: primaryColor }} /> Database study lists & tags
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Modify initial default placeholders or delete custom items completely
                </span>
              </div>

              {/* Tag grid list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {data.tags.map((tag) => {
                  const itemsCount = data.tasks.filter(t => t.tags.includes(tag.id)).length;
                  return (
                    <div
                      key={tag.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                        isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                        <div className="truncate">
                          <h4 className="font-bold text-xs truncate">{tag.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{itemsCount} tasks linked</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        <button
                          id={`edit-tag-btn-${tag.id}`}
                          onClick={() => handleEditTagClick(tag)}
                          className={`p-1 px-2.5 border text-[10px] font-bold rounded-lg transition-transform hover:scale-105 ${isDark ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                        >
                          Edit
                        </button>

                        {/* Delete button (will cleanup placeholder too) */}
                        <button
                          id={`delete-tag-btn-${tag.id}`}
                          onClick={() => handleDeleteCustomTag(tag.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-all"
                          title="Delete tag"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Edit Tag Inline Dialog modal portal pop up */}
              {editingTag && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                  <div className={`p-6 rounded-3xl border ${cardClass} w-full max-w-sm space-y-4`}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm">Edit List Details</h4>
                      <button onClick={() => setEditingTag(null)} className="text-slate-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">List/Tag Label Name</label>
                        <input
                          type="text"
                          value={editingTagName}
                          onChange={(e) => setEditingTagName(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border ${isDark ? "bg-slate-850 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-850"}`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Page Theme color</label>
                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                          {presetHexColors.map((col) => (
                            <button
                              type="button"
                              key={col}
                              onClick={() => setEditingTagColor(col)}
                              style={{ backgroundColor: col }}
                              className={`h-6 rounded border ${
                                editingTagColor === col ? "border-slate-800 scale-105 ring-1 ring-offset-2 ring-slate-400" : "border-transparent"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveEditedTag}
                      className={`w-full font-bold py-2 rounded-xl text-xs ${activeTheme.accentClass}`}
                    >
                      Save Configuration Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Draggable/Droppable and portable static Sticky Notes inside main canvas wrapper */}
          <div className="border-t border-slate-200/20 pt-5">
            <FloatingNotesManager
              notes={data.notes}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              isDark={isDark}
              primaryColor={primaryColor}
              lightAccentClass={lightAccentClass}
              cardClass={cardClass}
              bannerClass={bannerClass}
              accentClass={accentClass}
            />
          </div>

        </main>
      </div>

      {/* Dynamic Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          tags={data.tags}
          onClose={() => setSelectedTask(null)}
          onSave={handleTaskModalSave}
          onDelete={handleTaskDelete}
          isDark={isDark}
          primaryColor={primaryColor}
          lightAccentClass={lightAccentClass}
          cardClass={cardClass}
          bannerClass={bannerClass}
          accentClass={accentClass}
        />
      )}

      {/* Custom Student multi-device Portability & Account Hub Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative ${
            isDark ? "bg-[#090e1b] border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-500/15 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <FolderLock className="text-[#696fc7]" size={22} />
              <h2 className="text-xs font-bold tracking-tight uppercase">Multi-Device Synchronization Hub</h2>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-700/20 mb-5 text-semibold">
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setAuthError(null); setAuthSuccess(null); }}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  authMode === "login" ? "border-[#696fc7] text-[#696fc7]" : "border-transparent text-slate-400"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setAuthError(null); setAuthSuccess(null); }}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  authMode === "register" ? "border-[#696fc7] text-[#696fc7]" : "border-transparent text-slate-400"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("backup"); setAuthError(null); setAuthSuccess(null); }}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  authMode === "backup" ? "border-[#696fc7] text-[#696fc7]" : "border-transparent text-slate-400"
                }`}
              >
                Manual Backup / Sync
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold border border-rose-500/20 leading-relaxed">
                ⚠️ {authError}
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20 leading-relaxed">
                ✅ {authSuccess}
              </div>
            )}

            {authMode === "backup" ? (
              <div className="space-y-4">
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Instantly move all your micro-parameters (milestones, tags, notes, completed calendar history, and points balance) between any devices or browsers without creating an account using the encrypted code below.
                </p>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleExportState}
                    className="w-full py-2 px-4 rounded-xl bg-[#696fc7] hover:bg-[#585db2] text-white font-extrabold text-xs transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    📋 Click to Export Backup Code
                  </button>
                </div>

                <div className="border-t border-slate-700/10 pt-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Import Backup Key</span>
                  <textarea
                    value={backupKeyInput}
                    onChange={(e) => setBackupKeyInput(e.target.value)}
                    placeholder="Paste workspace backup code here..."
                    className="w-full h-20 p-2.5 text-[11px] font-mono rounded-xl border border-slate-700/30 bg-slate-900/40 text-slate-200 focus:outline-[#696fc7]"
                  />
                  <button
                    onClick={handleImportState}
                    className="w-full py-2 rounded-xl border border-slate-700 hover:bg-slate-500/10 text-xs font-extrabold transition-all cursor-pointer"
                  >
                    📥 Apply & Import Backup
                  </button>
                </div>
              </div>
             ) : showVerificationInput ? (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Please enter the 6-digit confirmation code we sent to <strong>{authEmail}</strong>. Feel free to retrieve your simulated email from our dev terminal.
                </p>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Confirmation Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full text-center tracking-widest px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-700/30 bg-slate-900/20 focus:outline-[#696fc7] text-slate-100"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="flex-1 py-2 rounded-xl border border-slate-700 hover:bg-slate-500/10 text-xs font-bold transition-all cursor-pointer"
                  >
                    ✉️ Resend Code
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-505 text-white font-extrabold text-xs transition-all cursor-pointer"
                  >
                    ✅ Verify & Sync
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationInput(false);
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className="w-full text-center text-[10px] text-slate-400 hover:underline uppercase font-bold pt-1 block"
                >
                  🔙 Back to registration
                </button>
              </form>
            ) : (
              <form onSubmit={authMode === "login" ? handleCustomLogin : handleCustomRegister} className="space-y-4">
                <p className="text-[11px] leading-relaxed text-slate-400">
                  {authMode === "login" 
                    ? "Enter your credentials to restore all parameters instantly on any device."
                    : "Create a permanent student account. Your current local dashboard state will be seamlessly uploaded as your starting profile!"
                  }
                </p>
                {authMode === "register" && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Username / Student ID</label>
                    <input
                      type="text"
                      required
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      placeholder="e.g. janesmith"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-700/30 bg-slate-900/20 focus:outline-[#696fc7] text-slate-100"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Student Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="e.g. student@aetria.edu"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-700/30 bg-slate-900/20 focus:outline-[#696fc7] text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Security Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-700/30 bg-slate-900/20 focus:outline-[#696fc7] text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#696fc7] hover:bg-[#585db2] text-white font-extrabold text-xs transition-all cursor-pointer hover:scale-[1.01]"
                >
                  {authMode === "login" ? "🚪 Log In Workspace" : "✨ Create & Sync Workspace"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Interactive Onboarding Tour / Tutorial Overlay */}
      {showTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" id="onboarding-guide-overlay">
          <div className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden transition-all duration-300 ${
            isDark ? "bg-[#090e1b] border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
          }`}>
            
            {/* Ambient subtle glow background */}
            <div className="absolute -top-24 -left-20 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
                 style={{ backgroundColor: TOUR_STEPS[tourStep].color }}></div>
            
            {/* Top Close indicator */}
            <button
              onClick={handleFinishTour}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-500/15 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              title="Skip and Close Tour"
            >
              <X size={18} />
            </button>

            {/* Slide Body */}
            <div className="text-center space-y-5 pt-3">
              {/* Pulsing Colored Badge and Icon Container */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div 
                  className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl transition-all duration-505 animate-pulse"
                  style={{
                    backgroundColor: `${TOUR_STEPS[tourStep].color}1A`,
                    borderColor: `${TOUR_STEPS[tourStep].color}4D`,
                    borderWidth: "2px"
                  }}
                >
                  {TOUR_STEPS[tourStep].emoji}
                </div>
                
                <span 
                  className="text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full border"
                  style={{
                    color: TOUR_STEPS[tourStep].color,
                    borderColor: `${TOUR_STEPS[tourStep].color}33`,
                    backgroundColor: `${TOUR_STEPS[tourStep].color}0D`
                  }}
                >
                  {TOUR_STEPS[tourStep].badge}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight" style={{ color: isDark ? "#ffffff" : "#1e293b" }}>
                  {TOUR_STEPS[tourStep].title}
                </h3>
                <p className={`text-[12px] sm:text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"} max-w-sm mx-auto`}>
                  {TOUR_STEPS[tourStep].description}
                </p>
              </div>

              {/* Visual mini-tip box */}
              <div className={`p-3 rounded-2xl text-left text-[11px] ${
                isDark ? "bg-slate-900/60 border border-slate-800/80 text-amber-200/90" : "bg-amber-55/60 border border-amber-200/60 text-amber-900"
              } flex gap-2 items-start`}>
                <span className="text-sm">💡</span>
                <div>
                  <span className="font-extrabold block mb-0.5">Zen Pro-Tip:</span>
                  <span className="leading-relaxed">
                    {tourStep === 0 && "Your work, sounds, weather overlays and lists are persistent and save instantly in this browser!"}
                    {tourStep === 1 && "Complete course tasks to obtain high rewards based on item difficulty level values."}
                    {tourStep === 2 && "Completing milestones automatically recalculates progress tracks and updates calendar states."}
                    {tourStep === 3 && "Drag and configure stickies as free-form whiteboards to draft lecture notes instantly."}
                    {tourStep === 4 && "Combine different background tracks like fireplace crackles + study beats to perfect your mood!"}
                  </span>
                </div>
              </div>

              {/* Progress Dots / Steps Indicators */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {TOUR_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTourStep(i)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      i === tourStep ? "w-6" : "w-2 bg-slate-600/40 hover:bg-slate-500/40"
                    }`}
                    style={{
                      backgroundColor: i === tourStep ? TOUR_STEPS[tourStep].color : undefined
                    }}
                    title={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* Control Buttons Footer Bar */}
              <div className="flex items-center justify-between border-t border-slate-200/10 pt-4 mt-2">
                {/* Skip button in the introduction */}
                <button
                  type="button"
                  onClick={handleFinishTour}
                  className={`text-slate-400 hover:text-red-400 text-[11px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer`}
                >
                  Skip Tour
                </button>

                <div className="flex gap-2">
                  {tourStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setTourStep(prev => prev - 1)}
                      className={`px-3.5 py-1.5 text-[11px] font-bold rounded-xl transition-all border cursor-pointer ${
                        isDark ? "bg-slate-850 border-slate-700 hover:bg-slate-800 text-slate-250" : "bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-800"
                      }`}
                    >
                      ⬅ Back
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (tourStep < TOUR_STEPS.length - 1) {
                        setTourStep(prev => prev + 1);
                      } else {
                        handleFinishTour();
                      }
                    }}
                    className="px-4 py-1.5 text-[11px] font-black rounded-xl text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: TOUR_STEPS[tourStep].color
                    }}
                  >
                    {tourStep === TOUR_STEPS.length - 1 ? "Start Studying ✓" : "Next Step ➡"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
