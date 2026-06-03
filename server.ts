import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { AppData, Task, Habit, Tag, FloatingNote, NotificationItem, PomodoroSettings, NotificationPreferences } from "./src/types";
import crypto from "crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
} // <-- THIS WAS MISSING

const db = getFirestore();

// Helper to get relative date strings for initial demo data
const getDateOffset = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

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
      reminderPreferences: { browserEnabled: true, frequencyHours: 24 }
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
      reminderPreferences: { browserEnabled: true, frequencyHours: 12 }
    },
    {
      id: "task-3",
      title: "AI & Ethics Debate Preparation",
      description: "Read assigned articles on autonomous vehicles and compile pro/con arguments.",
      startDate: getDateOffset(-2),
      deadline: getDateOffset(-1),
      tags: ["tag-reading", "tag-general"],
      subtasks: [],
      progress: 100,
      status: "Completed",
      points: 3,
      reminderPreferences: { browserEnabled: true, frequencyHours: 24 }
    }
  ],
  habits: [
    { id: "habit-1", title: "Review Math Lecture Notes", frequency: "daily", tags: ["tag-math"], completionHistory: [getDateOffset(-2), getDateOffset(-1)] },
    { id: "habit-2", title: "Leetcoding Practice", frequency: "daily", tags: ["tag-cs"], completionHistory: [getDateOffset(-3), getDateOffset(-1)] },
    { id: "habit-3", title: "Gym Workout", frequency: "custom", tags: ["tag-general"], completionHistory: [getDateOffset(-4), getDateOffset(-2)] }
  ],
  tags: [
    { id: "tag-study", name: "Exam Prep", color: "#3B82F6" },
    { id: "tag-cs", name: "Computer Science", color: "#10B981" },
    { id: "tag-math", name: "Mathematics", color: "#8B5CF6" },
    { id: "tag-homework", name: "Homeworks", color: "#F59E0B" },
    { id: "tag-reading", name: "Readings", color: "#EC4899" },
    { id: "tag-general", name: "Personal", color: "#6B7280" }
  ],
  notes: [
    {
      id: "note-1", title: "💡 CS Project Ideas", isList: true,
      listItems: [
        { id: "item-1", text: "Interactive pomodoro app with retro synth overlays", checked: true, type: "checkbox" },
        { id: "item-2", text: "Add custom alarm rings like digital chime", checked: false, type: "checkbox" },
        { id: "item-3", text: "Incorporate floating draggable sticky notes", checked: false, type: "checkbox" },
        { id: "item-4", text: "Integrate student schedule visualization", checked: false, type: "checkbox" }
      ],
      text: "", position: { x: 50, y: 150 }, width: 320, height: 250, isMinimized: false
    },
    {
      id: "note-2", title: "📚 Math Formulas Cheatsheet", isList: false, listItems: [],
      text: "• Row echelon form pivot columns\n• Rank-Nullity Theorem: dim(V) = rank(T) + nullity(T)\n• Basis if linearly independent and spans V\n• Det(AB) = Det(A) * Det(B)",
      position: { x: 420, y: 180 }, width: 300, height: 220, isMinimized: false
    }
  ],
  notifications: [{ id: "notif-1", message: "Welcome to your Academic Planner! Check your upcoming deadlines on the calendar.", type: "system", timestamp: new Date().toISOString(), read: false }],
  pomodoroSettings: { workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, longBreakInterval: 4, soundName: "bell", volume: 80 },
  notificationPreferences: { enabled: true, daysBeforeDeadline: 2, enableSystemSound: true, frequencyMinutes: 10 },
  userPoints: 100,
  themeBackground: "default",
  weatherEffect: "none",
  weatherOpacity: 70,
  weatherDensity: 50,
  ambientSound: "none",
  ambientVolume: 50
};

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function mergeWithDefaults(state: any): AppData {
  return {
    tasks: state.tasks || [],
    habits: state.habits || [],
    tags: state.tags || [],
    notes: state.notes || [],
    notifications: state.notifications || [],
    pomodoroSettings: state.pomodoroSettings || initialData.pomodoroSettings,
    notificationPreferences: state.notificationPreferences || initialData.notificationPreferences,
    userPoints: state.userPoints !== undefined ? state.userPoints : initialData.userPoints,
    themeBackground: state.themeBackground || initialData.themeBackground,
    weatherEffect: state.weatherEffect || initialData.weatherEffect,
    weatherOpacity: state.weatherOpacity !== undefined ? state.weatherOpacity : initialData.weatherOpacity,
    weatherDensity: state.weatherDensity !== undefined ? state.weatherDensity : initialData.weatherDensity,
    ambientSound: state.ambientSound || initialData.ambientSound,
    ambientVolume: state.ambientVolume !== undefined ? state.ambientVolume : initialData.ambientVolume
  };
}

// Firestore helpers
async function getGuestState(): Promise<AppData> {
  try {
    const doc = await db.collection("guest").doc("state").get();
    if (doc.exists) return mergeWithDefaults(doc.data());
  } catch (err) {
    console.error("Error reading guest state:", err);
  }
  return { ...initialData };
}

async function saveGuestState(state: AppData): Promise<void> {
  try {
    await db.collection("guest").doc("state").set(state);
  } catch (err) {
    console.error("Error saving guest state:", err);
  }
}

async function getUserState(uKey: string): Promise<AppData | null> {
  try {
    const doc = await db.collection("users").doc(uKey).get();
    if (doc.exists) {
      const data = doc.data() as any;
      return mergeWithDefaults(data.state || {});
    }
  } catch (err) {
    console.error("Error reading user state:", err);
  }
  return null;
}

async function saveUserState(uKey: string, state: AppData): Promise<void> {
  try {
    await db.collection("users").doc(uKey).update({ state });
  } catch (err) {
    console.error("Error saving user state:", err);
  }
}

async function getActiveState(req: express.Request): Promise<AppData> {
  const username = req.headers["x-student-auth"] as string | undefined;
  if (username && username.trim().length > 0) {
    const uKey = username.trim().toLowerCase();
    const userState = await getUserState(uKey);
    if (userState) return userState;
  }
  return getGuestState();
}

async function saveActiveState(req: express.Request, state: AppData): Promise<void> {
  const username = req.headers["x-student-auth"] as string | undefined;
  if (username && username.trim().length > 0) {
    const uKey = username.trim().toLowerCase();
    await saveUserState(uKey, state);
    return;
  }
  await saveGuestState(state);
}

function syncTaskStatus(task: Task): Task {
  if (task.subtasks && task.subtasks.length > 0) {
    const completedCount = task.subtasks.filter(s => s.completed).length;
    task.progress = Math.round((completedCount / task.subtasks.length) * 100);
  } else {
    if (task.progress === undefined) task.progress = 0;
  }
  if (task.progress >= 100) { task.progress = 100; task.status = "Completed"; }
  else if (task.progress > 0) { task.status = "In Progress"; }
  else { task.status = "Not Started"; }
  return task;
}

function checkAndGenerateReminders(state: AppData, virtualDateStr?: string): AppData {
  const referenceDateStr = virtualDateStr || new Date().toISOString().split("T")[0];
  const referenceDate = new Date(referenceDateStr);
  if (!state.notificationPreferences.enabled) return state;
  const daysBefore = state.notificationPreferences.daysBeforeDeadline;
  const currentNotifs = state.notifications || [];
  state.tasks.forEach(task => {
    if (task.status === "Completed" || task.progress === 100) return;
    const deadlineDate = new Date(task.deadline);
    const timeDiff = deadlineDate.getTime() - referenceDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (daysDiff >= 0 && daysDiff <= daysBefore) {
      const alreadyNotified = currentNotifs.some(n => n.taskId === task.id && n.daysRemaining === daysDiff);
      if (!alreadyNotified) {
        let msg = "";
        if (daysDiff === 0) msg = `⚠️ Deadline Today! "${task.title}" is due today!`;
        else if (daysDiff === 1) msg = `⏳ Due tomorrow: "${task.title}" has 1 day left!`;
        else msg = `📅 Deadline approach: "${task.title}" is due in ${daysDiff} days.`;
        const newNotif: NotificationItem = {
          id: `notif-deadline-${task.id}-${daysDiff}-${Date.now()}`,
          message: msg, type: "deadline", timestamp: new Date().toISOString(),
          read: false, taskId: task.id, daysRemaining: daysDiff
        };
        state.notifications.unshift(newNotif);
      }
    }
  });
  return state;
}

interface SimulatedEmail { id: string; to: string; subject: string; body: string; code: string; timestamp: string; }
let simulatedEmails: SimulatedEmail[] = [];

async function startServer() {
  const app = express();

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://aetria-breathein-tuneout.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, x-student-auth");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // AUTH ENDPOINTS
  app.get("/api/auth/simulated-emails", (req, res) => { res.json(simulatedEmails); });

  app.post("/api/auth/register", async (req, res) => {
    const { username, email, password, state } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "Username, Email and Password are required" });
    const uKey = email.trim().toLowerCase();
    try {
      const existing = await db.collection("users").doc(uKey).get();
      if (existing.exists) return res.status(400).json({ error: "Email address already registered" });
      const codeSet = Math.floor(100000 + Math.random() * 900000).toString();
      const stateToSave = state || initialData;
      await db.collection("users").doc(uKey).set({
        email: email.trim(), displayName: username.trim(),
        passwordHash: hashPassword(password), emailVerified: false,
        verificationCode: codeSet, state: stateToSave
      });
      const emailObj: SimulatedEmail = {
        id: crypto.randomUUID ? crypto.randomUUID() : `email-${Date.now()}`,
        to: email.trim(), subject: "✨ Verify Your Aetria Workspace Account",
        body: `Hi ${username.trim()},\n\nYour 6-digit security code is: ${codeSet}\n\n"Breathe in, Tune out"\n- Aetria Student Team`,
        code: codeSet, timestamp: new Date().toISOString()
      };
      simulatedEmails.unshift(emailObj);
      res.json({ success: true, username: username.trim(), email: email.trim(), emailVerified: false });
    } catch (err) { res.status(500).json({ error: "Registration failed" }); }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const uKey = email.trim().toLowerCase();
    try {
      const doc = await db.collection("users").doc(uKey).get();
      if (!doc.exists) return res.status(401).json({ error: "Invalid email or password" });
      const user = doc.data() as any;
      if (user.passwordHash !== hashPassword(password)) return res.status(401).json({ error: "Invalid email or password" });
      if (user.emailVerified === false) {
        return res.json({ success: true, needsVerification: true, email: user.email, username: user.displayName || user.email });
      }
      res.json({ success: true, username: user.displayName || user.email, email: user.email, state: user.state });
    } catch (err) { res.status(500).json({ error: "Login failed" }); }
  });

  app.post("/api/auth/verify", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Email and verification code are required" });
    const uKey = email.trim().toLowerCase();
    try {
      const doc = await db.collection("users").doc(uKey).get();
      if (!doc.exists) return res.status(404).json({ error: "Account not found" });
      const user = doc.data() as any;
      if (user.verificationCode !== code.trim()) return res.status(400).json({ error: "Invalid code!" });
      await db.collection("users").doc(uKey).update({ emailVerified: true });
      res.json({ success: true, username: user.displayName || user.email, email: user.email, state: user.state });
    } catch (err) { res.status(500).json({ error: "Verification failed" }); }
  });

  app.post("/api/auth/resend-code", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const uKey = email.trim().toLowerCase();
    try {
      const doc = await db.collection("users").doc(uKey).get();
      if (!doc.exists) return res.status(404).json({ error: "Account not found" });
      const user = doc.data() as any;
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      await db.collection("users").doc(uKey).update({ verificationCode: newCode });
      const emailObj: SimulatedEmail = {
        id: crypto.randomUUID ? crypto.randomUUID() : `email-${Date.now()}`,
        to: user.email || email, subject: "🔒 Aetria Verification Code Link",
        body: `Hi ${user.displayName || email},\n\nYour new verification code is: ${newCode}\n\n"Breathe in, Tune out"\n- Aetria Student Team`,
        code: newCode, timestamp: new Date().toISOString()
      };
      simulatedEmails.unshift(emailObj);
      res.json({ success: true, message: "A new code has been sent!" });
    } catch (err) { res.status(500).json({ error: "Resend failed" }); }
  });

  // API ENDPOINTS
  app.get("/api/data", async (req, res) => {
    const simDate = req.query.simDate as string | undefined;
    let state = await getActiveState(req);
    state.tasks = state.tasks.map(syncTaskStatus);
    state = checkAndGenerateReminders(state, simDate);
    await saveActiveState(req, state);
    res.json(state);
  });

  app.post("/api/data", async (req, res) => {
    let state = req.body as AppData;
    state.tasks = (state.tasks || []).map(syncTaskStatus);
    await saveActiveState(req, state);
    res.json(state);
  });

  app.post("/api/tasks", async (req, res) => {
    const incomingTask = req.body as Task;
    const synced = syncTaskStatus(incomingTask);
    const state = await getActiveState(req);
    const existingIndex = state.tasks.findIndex(t => t.id === synced.id);
    if (existingIndex > -1) state.tasks[existingIndex] = synced;
    else state.tasks.push(synced);
    const updated = checkAndGenerateReminders(state);
    await saveActiveState(req, updated);
    res.json({ success: true, task: synced, state: updated });
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const state = await getActiveState(req);
    state.tasks = state.tasks.filter(t => t.id !== id);
    state.notifications = (state.notifications || []).filter(n => n.taskId !== id);
    await saveActiveState(req, state);
    res.json({ success: true, state });
  });

  app.post("/api/habits", async (req, res) => {
    const incomingHabit = req.body as Habit;
    const state = await getActiveState(req);
    const existingIndex = state.habits.findIndex(h => h.id === incomingHabit.id);
    if (existingIndex > -1) state.habits[existingIndex] = incomingHabit;
    else state.habits.push(incomingHabit);
    await saveActiveState(req, state);
    res.json({ success: true, habit: incomingHabit, state });
  });

  app.post("/api/habits/:id/toggle", async (req, res) => {
    const { id } = req.params;
    const { date } = req.body;
    const state = await getActiveState(req);
    const habitIndex = state.habits.findIndex(h => h.id === id);
    if (habitIndex > -1) {
      const habit = state.habits[habitIndex];
      const dateIndex = habit.completionHistory.indexOf(date);
      if (dateIndex > -1) habit.completionHistory.splice(dateIndex, 1);
      else habit.completionHistory.push(date);
      await saveActiveState(req, state);
      res.json({ success: true, habit, state });
    } else {
      res.status(404).json({ error: "Habit not found" });
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    const { id } = req.params;
    const state = await getActiveState(req);
    state.habits = state.habits.filter(h => h.id !== id);
    await saveActiveState(req, state);
    res.json({ success: true, state });
  });

  app.post("/api/tags", async (req, res) => {
    const incomingTag = req.body as Tag;
    const state = await getActiveState(req);
    const existingIndex = state.tags.findIndex(t => t.id === incomingTag.id);
    if (existingIndex > -1) state.tags[existingIndex] = incomingTag;
    else state.tags.push(incomingTag);
    await saveActiveState(req, state);
    res.json({ success: true, tag: incomingTag, state });
  });

  app.delete("/api/tags/:id", async (req, res) => {
    const { id } = req.params;
    const state = await getActiveState(req);
    state.tags = state.tags.filter(t => t.id !== id);
    state.tasks = state.tasks.map(t => ({ ...t, tags: t.tags.filter(tagId => tagId !== id) }));
    state.habits = state.habits.map(h => ({ ...h, tags: h.tags.filter(tagId => tagId !== id) }));
    await saveActiveState(req, state);
    res.json({ success: true, state });
  });

  app.post("/api/notes", async (req, res) => {
    const incomingNote = req.body as FloatingNote;
    const state = await getActiveState(req);
    const existingIndex = state.notes.findIndex(n => n.id === incomingNote.id);
    if (existingIndex > -1) state.notes[existingIndex] = incomingNote;
    else state.notes.push(incomingNote);
    await saveActiveState(req, state);
    res.json({ success: true, note: incomingNote, state });
  });

  app.delete("/api/notes/:id", async (req, res) => {
    const { id } = req.params;
    const state = await getActiveState(req);
    state.notes = state.notes.filter(n => n.id !== id);
    await saveActiveState(req, state);
    res.json({ success: true, state });
  });

  app.post("/api/pomodoro", async (req, res) => {
    const state = await getActiveState(req);
    state.pomodoroSettings = req.body as PomodoroSettings;
    await saveActiveState(req, state);
    res.json({ success: true, pomodoroSettings: state.pomodoroSettings });
  });

  app.post("/api/notifications/preferences", async (req, res) => {
    const state = await getActiveState(req);
    state.notificationPreferences = req.body as NotificationPreferences;
    await saveActiveState(req, state);
    res.json({ success: true, notificationPreferences: state.notificationPreferences });
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    const { id } = req.params;
    const state = await getActiveState(req);
    const notif = state.notifications.find(n => n.id === id);
    if (notif) { notif.read = true; await saveActiveState(req, state); }
    res.json({ success: true, state });
  });

  app.post("/api/notifications/read-all", async (req, res) => {
    const state = await getActiveState(req);
    state.notifications = state.notifications.map(n => ({ ...n, read: true }));
    await saveActiveState(req, state);
    res.json({ success: true, state });
  });

  app.post("/api/notifications/clear", async (req, res) => {
    const state = await getActiveState(req);
    state.notifications = [];
    await saveActiveState(req, state);
    res.json({ success: true, state });
  });

  app.post("/api/check-reminders", async (req, res) => {
    const { simDate } = req.body;
    let state = await getActiveState(req);
    state = checkAndGenerateReminders(state, simDate);
    await saveActiveState(req, state);
    res.json({ success: true, dateChecked: simDate || new Date().toISOString().split("T")[0], state });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const express2 = await import("express");
    app.use(express2.default.static(distPath));
    app.get("*", (req, res) => { res.sendFile(path.join(distPath, "index.html")); });
  }

  app.listen(PORT, "0.0.0.0", () => { console.log(`Server running on port ${PORT}`); });
}

startServer();

   
