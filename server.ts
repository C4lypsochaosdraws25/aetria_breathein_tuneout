import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { AppData, Task, Habit, Tag, FloatingNote, NotificationItem, PomodoroSettings, NotificationPreferences } from "./src/types";

// Helper to get relative date strings for initial demo data
const getDateOffset = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

import crypto from "crypto";

const DATA_FILE_PATH = path.join(process.cwd(), "data.json");
const USERS_DB_PATH = path.join(process.cwd(), "users-db.json");

// Multi-user Database interface helper
function loadUsersDb(): Record<string, { passwordHash: string; state: AppData }> {
  try {
    if (fs.existsSync(USERS_DB_PATH)) {
      return JSON.parse(fs.readFileSync(USERS_DB_PATH, "utf8"));
    }
  } catch (err) {
    console.error("Error reading users database, resetting:", err);
  }
  return {};
}

function saveUsersDb(db: Record<string, { passwordHash: string; state: AppData }>) {
  try {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing users database:", err);
  }
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Default initial state for students
const initialData: AppData = {
  tasks: [
    {
      id: "task-1",
      title: "Computer Science Final Project",
      description: "Develop a full-stack student course tracker using React and Node.",
      startDate: getDateOffset(-5),
      deadline: getDateOffset(3),
      tags: ["tag-study", "tag-cs"],
      subtasks: [
        { id: "sub-1-1", title: "Set up project repository", completed: true },
        { id: "sub-1-2", title: "Define database schemas", completed: true },
        { id: "sub-1-3", title: "Build express server endpoints", completed: false },
        { id: "sub-1-4", title: "Design clean frontend dashboard", completed: false }
      ],
      progress: 50,
      status: "In Progress",
      points: 15,
      reminderPreferences: {
        browserEnabled: true,
        frequencyHours: 24
      }
    },
    {
      id: "task-2",
      title: "Linear Algebra Homework #4",
      description: "Complete problems 1-15 on vector spaces and matrix transformations.",
      startDate: getDateOffset(-1),
      deadline: getDateOffset(1),
      tags: ["tag-math", "tag-homework"],
      subtasks: [
        { id: "sub-2-1", title: "Section 4.1 Vector Spaces", completed: false },
        { id: "sub-2-2", title: "Section 4.2 Linear Transformations", completed: false }
      ],
      progress: 0,
      status: "Not Started",
      points: 5,
      reminderPreferences: {
        browserEnabled: true,
        frequencyHours: 12
      }
    },
    {
      id: "task-3",
      title: "AI & Ethics Debate Preparation",
      description: "Read assigned articles on autonomous vehicles and compile pro/con arguments.",
      startDate: getDateOffset(-2),
      deadline: getDateOffset(-1), // already missed/completed demo
      tags: ["tag-reading", "tag-general"],
      subtasks: [],
      progress: 100,
      status: "Completed",
      points: 3,
      reminderPreferences: {
        browserEnabled: true,
        frequencyHours: 24
      }
    }
  ],
  habits: [
    {
      id: "habit-1",
      title: "Review Math Lecture Notes",
      frequency: "daily",
      tags: ["tag-math"],
      completionHistory: [getDateOffset(-2), getDateOffset(-1)]
    },
    {
      id: "habit-2",
      title: "Leetcoding Practice",
      frequency: "daily",
      tags: ["tag-cs"],
      completionHistory: [getDateOffset(-3), getDateOffset(-1)]
    },
    {
      id: "habit-3",
      title: "Gym Workout",
      frequency: "custom",
      tags: ["tag-general"],
      completionHistory: [getDateOffset(-4), getDateOffset(-2)]
    }
  ],
  tags: [
    { id: "tag-study", name: "Exam Prep", color: "#3B82F6" }, // Blue
    { id: "tag-cs", name: "Computer Science", color: "#10B981" }, // Green
    { id: "tag-math", name: "Mathematics", color: "#8B5CF6" }, // Purple
    { id: "tag-homework", name: "Homeworks", color: "#F59E0B" }, // Yellow
    { id: "tag-reading", name: "Readings", color: "#EC4899" }, // Pink
    { id: "tag-general", name: "Personal", color: "#6B7280" } // Gray
  ],
  notes: [
    {
      id: "note-1",
      title: "💡 CS Project Ideas",
      isList: true,
      listItems: [
        { id: "item-1", text: "Interactive pomodoro app with retro synth overlays", checked: true, type: "checkbox" },
        { id: "item-2", text: "Add custom alarm rings like digital chime", checked: false, type: "checkbox" },
        { id: "item-3", text: "Incorporate floating draggable sticky notes", checked: false, type: "checkbox" },
        { id: "item-4", text: "Integrate student schedule visualization", checked: false, type: "checkbox" }
      ],
      text: "",
      position: { x: 50, y: 150 },
      width: 320,
      height: 250,
      isMinimized: false
    },
    {
      id: "note-2",
      title: "📚 Math Formulas Cheatsheet",
      isList: false,
      listItems: [],
      text: "• Row echelon form pivot columns\n• Rank-Nullity Theorem: dim(V) = rank(T) + nullity(T)\n• Basis if linearly independent and spans V\n• Det(AB) = Det(A) * Det(B)",
      position: { x: 420, y: 180 },
      width: 300,
      height: 220,
      isMinimized: false
    }
  ],
  notifications: [
    {
      id: "notif-1",
      message: "Welcome to your Academic Planner! Check your upcoming deadlines on the calendar.",
      type: "system",
      timestamp: new Date().toISOString(),
      read: false
    }
  ],
  pomodoroSettings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    soundName: "bell",
    volume: 80
  },
  notificationPreferences: {
    enabled: true,
    daysBeforeDeadline: 2,
    enableSystemSound: true,
    frequencyMinutes: 10
  },
  userPoints: 100,
  themeBackground: "default",
  weatherEffect: "none",
  weatherOpacity: 70,
  weatherDensity: 50,
  ambientSound: "none",
  ambientVolume: 50
};

// State Managers
let appState: AppData = initialData;

// Load data
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE_PATH, "utf8"));
      // Basic merge/validation to make sure it includes required fields
      appState = {
        tasks: parsed.tasks || [],
        habits: parsed.habits || [],
        tags: parsed.tags || [],
        notes: parsed.notes || [],
        notifications: parsed.notifications || [],
        pomodoroSettings: parsed.pomodoroSettings || initialData.pomodoroSettings,
        notificationPreferences: parsed.notificationPreferences || initialData.notificationPreferences,
        userPoints: parsed.userPoints !== undefined ? parsed.userPoints : initialData.userPoints,
        themeBackground: parsed.themeBackground || initialData.themeBackground,
        weatherEffect: parsed.weatherEffect || initialData.weatherEffect,
        weatherOpacity: parsed.weatherOpacity !== undefined ? parsed.weatherOpacity : initialData.weatherOpacity,
        weatherDensity: parsed.weatherDensity !== undefined ? parsed.weatherDensity : initialData.weatherDensity,
        ambientSound: parsed.ambientSound || initialData.ambientSound,
        ambientVolume: parsed.ambientVolume !== undefined ? parsed.ambientVolume : initialData.ambientVolume
      };
    } else {
      appState = initialData;
      saveData();
    }
  } catch (err) {
    console.error("Failed to load task/habit data, utilizing in-memory state:", err);
    appState = initialData;
  }
}

// Save data
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(appState, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write task/habit data to file:", err);
  }
}

// User active session state helpers
function getActiveState(req: express.Request): AppData {
  const username = req.headers["x-student-auth"] as string | undefined;
  if (username && username.trim().length > 0) {
    const db = loadUsersDb();
    const uKey = username.trim().toLowerCase();
    if (db[uKey]) {
      const state = db[uKey].state;
      state.tasks = state.tasks || [];
      state.habits = state.habits || [];
      state.tags = state.tags || [];
      state.notes = state.notes || [];
      state.notifications = state.notifications || [];
      state.pomodoroSettings = state.pomodoroSettings || initialData.pomodoroSettings;
      state.notificationPreferences = state.notificationPreferences || initialData.notificationPreferences;
      state.userPoints = state.userPoints !== undefined ? state.userPoints : initialData.userPoints;
      state.themeBackground = state.themeBackground || initialData.themeBackground;
      state.weatherEffect = state.weatherEffect || initialData.weatherEffect;
      state.weatherOpacity = state.weatherOpacity !== undefined ? state.weatherOpacity : initialData.weatherOpacity;
      state.weatherDensity = state.weatherDensity !== undefined ? state.weatherDensity : initialData.weatherDensity;
      state.ambientSound = state.ambientSound || initialData.ambientSound;
      state.ambientVolume = state.ambientVolume !== undefined ? state.ambientVolume : initialData.ambientVolume;
      return state;
    }
  }
  return appState;
}

function saveActiveState(req: express.Request, state: AppData) {
  const username = req.headers["x-student-auth"] as string | undefined;
  if (username && username.trim().length > 0) {
    const db = loadUsersDb();
    const uKey = username.trim().toLowerCase();
    if (db[uKey]) {
      db[uKey].state = state;
      saveUsersDb(db);
      return;
    }
  }
  appState = state;
  saveData();
}

// Automatically recalculate single task status based on subtasks
function syncTaskStatus(task: Task): Task {
  if (task.subtasks && task.subtasks.length > 0) {
    const completedCount = task.subtasks.filter(s => s.completed).length;
    task.progress = Math.round((completedCount / task.subtasks.length) * 100);
  } else {
    // If no subtasks, progress is either 0 or 100, or preserved
    if (task.progress === undefined) {
      task.progress = 0;
    }
  }

  if (task.progress >= 100) {
    task.progress = 100;
    task.status = "Completed";
  } else if (task.progress > 0) {
    task.status = "In Progress";
  } else {
    task.status = "Not Started";
  }
  return task;
}

// Background sweep to evaluate and update state (reminders, status, auto progress counts)
function checkAndGenerateReminders(state: AppData, virtualDateStr?: string): AppData {
  const referenceDateStr = virtualDateStr || new Date().toISOString().split("T")[0];
  const referenceDate = new Date(referenceDateStr);
  
  if (!state.notificationPreferences.enabled) return state;

  const daysBefore = state.notificationPreferences.daysBeforeDeadline;
  const currentNotifs = state.notifications || [];

  state.tasks.forEach(task => {
    // skip completed tasks
    if (task.status === "Completed" || task.progress === 100) return;

    // calculate difference in days
    const deadlineDate = new Date(task.deadline);
    const timeDiff = deadlineDate.getTime() - referenceDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Give notification 2 days before deadline, till the deadline itself
    if (daysDiff >= 0 && daysDiff <= daysBefore) {
      // Check if notification already exists for this task and daysRemaining combination
      const alreadyNotified = currentNotifs.some(n => 
        n.taskId === task.id && n.daysRemaining === daysDiff
      );

      if (!alreadyNotified) {
        let msg = "";
        if (daysDiff === 0) {
          msg = `⚠️ Deadline Today! "${task.title}" is due today!`;
        } else if (daysDiff === 1) {
          msg = `⏳ Due tomorrow: "${task.title}" has 1 day left!`;
        } else {
          msg = `📅 Deadline approach: "${task.title}" is due in ${daysDiff} days.`;
        }

        const newNotif: NotificationItem = {
          id: `notif-deadline-${task.id}-${daysDiff}-${Date.now()}`,
          message: msg,
          type: "deadline",
          timestamp: new Date().toISOString(),
          read: false,
          taskId: task.id,
          daysRemaining: daysDiff
        };

        state.notifications.unshift(newNotif);
      }
    }
  });

  return state;
}

// In-memory array of simulated emails sent during runtime
interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  code: string;
  timestamp: string;
}
let simulatedEmails: SimulatedEmail[] = [];

// Initialize server
async function startServer() {
  loadData();

  const app = express();
  import cors from "express";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://aetria-breathein-tuneout.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, x-student-auth");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const PORT = 3000;

  // Run initial checks for guest data
  checkAndGenerateReminders(appState);

  // AUTH ENDPOINTS WITH SIMULATED EMAIL CONFIRMATION SYSTEM
  app.get("/api/auth/simulated-emails", (req, res) => {
    res.json(simulatedEmails);
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, email, password, state } = req.body;
    if (!username || !email || !password || username.trim().length === 0 || email.trim().length === 0 || password.trim().length === 0) {
      return res.status(400).json({ error: "Username, Email and Password are required" });
    }

    const db = loadUsersDb();
    const uKey = email.trim().toLowerCase();
    if (db[uKey]) {
      return res.status(400).json({ error: "Email address already registered" });
    }

    const codeSet = Math.floor(100000 + Math.random() * 900000).toString();
    const stateToSave = state || appState;

    db[uKey] = {
      email: email.trim(),
      displayName: username.trim(),
      passwordHash: hashPassword(password),
      emailVerified: false,
      verificationCode: codeSet,
      state: JSON.parse(JSON.stringify(stateToSave))
    } as any;
    saveUsersDb(db);

    const emailObj: SimulatedEmail = {
      id: crypto.randomUUID ? crypto.randomUUID() : `email-${Date.now()}-${Math.random()}`,
      to: email.trim(),
      subject: "✨ Verify Your Aetria Workspace Account",
      body: `Hi ${username.trim()},\n\nThank you for choosing Aetria!\n\nYour 6-digit security code is: ${codeSet}\n\nEnter this code in the Aetria verify panel to secure your academic profile.\n\n"Breathe in, Tune out"\n- Aetria Student Team`,
      code: codeSet,
      timestamp: new Date().toISOString()
    };
    simulatedEmails.unshift(emailObj);

    res.json({ success: true, username: username.trim(), email: email.trim(), emailVerified: false });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = loadUsersDb();
    const uKey = email.trim().toLowerCase();
    const user = db[uKey] as any;
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.emailVerified === false) {
      return res.json({
        success: true,
        needsVerification: true,
        email: user.email,
        username: user.displayName || user.email
      });
    }

    res.json({ success: true, username: user.displayName || user.email, email: user.email, state: user.state });
  });

  app.post("/api/auth/verify", (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Email and verification code are required" });
    }

    const db = loadUsersDb();
    const uKey = email.trim().toLowerCase();
    const user = db[uKey] as any;
    if (!user) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (user.verificationCode !== code.trim()) {
      return res.status(400).json({ error: "Invalid code. Please check your simulated mailbox!" });
    }

    user.emailVerified = true;
    db[uKey] = user;
    saveUsersDb(db);

    res.json({ success: true, username: user.displayName || user.email, email: user.email, state: user.state });
  });

  app.post("/api/auth/resend-code", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const db = loadUsersDb();
    const uKey = email.trim().toLowerCase();
    const user = db[uKey] as any;
    if (!user) {
      return res.status(404).json({ error: "Account not found" });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    db[uKey] = user;
    saveUsersDb(db);

    const emailObj: SimulatedEmail = {
      id: crypto.randomUUID ? crypto.randomUUID() : `email-${Date.now()}-${Math.random()}`,
      to: user.email || email,
      subject: "🔒 Aetria Verification Code Link",
      body: `Hi ${user.displayName || email},\n\nYour new verification code is: ${newCode}\n\nEnter this code in the Aetria verify panel to secure your academic profile.\n\n"Breathe in, Tune out"\n- Aetria Student Team`,
      code: newCode,
      timestamp: new Date().toISOString()
    };
    simulatedEmails.unshift(emailObj);

    res.json({ success: true, message: "A new code has been sent to your simulated mailbox!" });
  });

  // API Endpoints
  // Get all data
  app.get("/api/data", (req, res) => {
    const simDate = req.query.simDate as string | undefined;
    let state = getActiveState(req);
    // Recalc all tasks progress/status to make sure it is completely accurate
    state.tasks = state.tasks.map(syncTaskStatus);
    state = checkAndGenerateReminders(state, simDate);
    saveActiveState(req, state);
    res.json(state);
  });

  // Save/Update full app state
  app.post("/api/data", (req, res) => {
    let state = req.body as AppData;
    state.tasks = (state.tasks || []).map(syncTaskStatus);
    saveActiveState(req, state);
    res.json(state);
  });

  // Tasks endpoints
  app.post("/api/tasks", (req, res) => {
    const incomingTask = req.body as Task;
    const synced = syncTaskStatus(incomingTask);
    const state = getActiveState(req);
    const existingIndex = state.tasks.findIndex(t => t.id === synced.id);

    if (existingIndex > -1) {
      state.tasks[existingIndex] = synced;
    } else {
      state.tasks.push(synced);
    }
    
    const updated = checkAndGenerateReminders(state);
    saveActiveState(req, updated);
    res.json({ success: true, task: synced, state: updated });
  });

  app.delete("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const state = getActiveState(req);
    state.tasks = state.tasks.filter(t => t.id !== id);
    // remove target notifications as well to clean up
    state.notifications = (state.notifications || []).filter(n => n.taskId !== id);
    saveActiveState(req, state);
    res.json({ success: true, state });
  });

  // Habits endpoints
  app.post("/api/habits", (req, res) => {
    const incomingHabit = req.body as Habit;
    const state = getActiveState(req);
    const existingIndex = state.habits.findIndex(h => h.id === incomingHabit.id);

    if (existingIndex > -1) {
      state.habits[existingIndex] = incomingHabit;
    } else {
      state.habits.push(incomingHabit);
    }
    saveActiveState(req, state);
    res.json({ success: true, habit: incomingHabit, state });
  });

  // Toggle habit date completion
  app.post("/api/habits/:id/toggle", (req, res) => {
    const { id } = req.params;
    const { date } = req.body; // YYYY-MM-DD
    const state = getActiveState(req);
    const habitIndex = state.habits.findIndex(h => h.id === id);

    if (habitIndex > -1) {
      const habit = state.habits[habitIndex];
      const dateIndex = habit.completionHistory.indexOf(date);
      if (dateIndex > -1) {
        habit.completionHistory.splice(dateIndex, 1);
      } else {
        habit.completionHistory.push(date);
      }
      saveActiveState(req, state);
      res.json({ success: true, habit, state });
    } else {
      res.status(404).json({ error: "Habit not found" });
    }
  });

  app.delete("/api/habits/:id", (req, res) => {
    const { id } = req.params;
    const state = getActiveState(req);
    state.habits = state.habits.filter(h => h.id !== id);
    saveActiveState(req, state);
    res.json({ success: true, state });
  });

  // Tags endpoints
  app.post("/api/tags", (req, res) => {
    const incomingTag = req.body as Tag;
    const state = getActiveState(req);
    const existingIndex = state.tags.findIndex(t => t.id === incomingTag.id);

    if (existingIndex > -1) {
      state.tags[existingIndex] = incomingTag;
    } else {
      state.tags.push(incomingTag);
    }
    saveActiveState(req, state);
    res.json({ success: true, tag: incomingTag, state });
  });

  app.delete("/api/tags/:id", (req, res) => {
    const { id } = req.params;
    const state = getActiveState(req);
    state.tags = state.tags.filter(t => t.id !== id);
    // remove tag references from tasks and habits
    state.tasks = state.tasks.map(t => ({
      ...t,
      tags: t.tags.filter(tagId => tagId !== id)
    }));
    state.habits = state.habits.map(h => ({
      ...h,
      tags: h.tags.filter(tagId => tagId !== id)
    }));
    saveActiveState(req, state);
    res.json({ success: true, state });
  });

  // Floating Notes endpoints
  app.post("/api/notes", (req, res) => {
    const incomingNote = req.body as FloatingNote;
    const state = getActiveState(req);
    const existingIndex = state.notes.findIndex(n => n.id === incomingNote.id);

    if (existingIndex > -1) {
      state.notes[existingIndex] = incomingNote;
    } else {
      state.notes.push(incomingNote);
    }
    saveActiveState(req, state);
    res.json({ success: true, note: incomingNote, state });
  });

  app.delete("/api/notes/:id", (req, res) => {
    const { id } = req.params;
    const state = getActiveState(req);
    state.notes = state.notes.filter(n => n.id !== id);
    saveActiveState(req, state);
    res.json({ success: true, state });
  });

  // Settings & preferences
  app.post("/api/pomodoro", (req, res) => {
    const state = getActiveState(req);
    state.pomodoroSettings = req.body as PomodoroSettings;
    saveActiveState(req, state);
    res.json({ success: true, pomodoroSettings: state.pomodoroSettings });
  });

  app.post("/api/notifications/preferences", (req, res) => {
    const state = getActiveState(req);
    state.notificationPreferences = req.body as NotificationPreferences;
    saveActiveState(req, state);
    res.json({ success: true, notificationPreferences: state.notificationPreferences });
  });

  // Notification read/write
  app.post("/api/notifications/:id/read", (req, res) => {
    const { id } = req.params;
    const state = getActiveState(req);
    const notif = state.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      saveActiveState(req, state);
    }
    res.json({ success: true, state });
  });

  app.post("/api/notifications/read-all", (req, res) => {
    const state = getActiveState(req);
    state.notifications = state.notifications.map(n => ({ ...n, read: true }));
    saveActiveState(req, state);
    res.json({ success: true, state });
  });

  app.post("/api/notifications/clear", (req, res) => {
    const state = getActiveState(req);
    state.notifications = [];
    saveActiveState(req, state);
    res.json({ success: true, state });
  });

  // Simulate dates sweeping triggers helper
  app.post("/api/check-reminders", (req, res) => {
    const { simDate } = req.body; // YYYY-MM-DD
    let state = getActiveState(req);
    state = checkAndGenerateReminders(state, simDate);
    saveActiveState(req, state);
    res.json({ success: true, dateChecked: simDate || new Date().toISOString().split("T")[0], state });
  });

  // Vite Integration for Asset and SPA serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
