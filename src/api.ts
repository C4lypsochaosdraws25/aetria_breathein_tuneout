import { AppData, Task, Habit, Tag, FloatingNote, PomodoroSettings, NotificationPreferences } from "./types";

const API_BASE = "https://aetria-breathein-tuneout.onrender.com/api";

// Custom HTTP Client to inject user security headers
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const activeUser = localStorage.getItem("workspace_student_username");
  const headers = new Headers(options.headers || {});
  if (activeUser) {
    headers.set("x-student-auth", activeUser);
  }
  return fetch(url, { ...options, headers });
}

export async function registerStudent(username: string, email: string, password: string, stateToClone?: AppData): Promise<{ success: boolean; username: string; email: string; emailVerified: boolean }> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, state: stateToClone }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to register account");
  }
  return response.json();
}

export async function loginStudent(email: string, password: string): Promise<{ success: boolean; username: string; email: string; state?: AppData; needsVerification?: boolean }> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to login");
  }
  return response.json();
}

export async function verifyStudentCode(email: string, code: string): Promise<{ success: boolean; username: string; email: string; state: AppData }> {
  const response = await fetch(`${API_BASE}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Verification failed");
  }
  return response.json();
}

export async function resendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/auth/resend-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to resend code");
  }
  return response.json();
}

export async function fetchSimulatedEmails(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/auth/simulated-emails`);
  if (!response.ok) {
    throw new Error("Failed to fetch simulated emails");
  }
  return response.json();
}

export async function fetchAppData(simDate?: string): Promise<AppData> {
  const url = simDate ? `${API_BASE}/data?simDate=${encodeURIComponent(simDate)}` : `${API_BASE}/data`;
  const response = await authFetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch app data");
  }
  return response.json();
}

export async function saveFullState(state: AppData): Promise<AppData> {
  const response = await authFetch(`${API_BASE}/data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  if (!response.ok) throw new Error("Failed to save full state");
  return response.json();
}

export async function saveTask(task: Task): Promise<{ success: boolean; task: Task; state: AppData }> {
  const response = await authFetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!response.ok) throw new Error("Failed to save task");
  return response.json();
}

export async function deleteTask(id: string): Promise<{ success: boolean; state: AppData }> {
  const response = await authFetch(`${API_BASE}/tasks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete task");
  return response.json();
}

export async function saveHabit(habit: Habit): Promise<{ success: boolean; habit: Habit; state: AppData }> {
  const response = await authFetch(`${API_BASE}/habits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(habit),
  });
  if (!response.ok) throw new Error("Failed to save habit");
  return response.json();
}

export async function toggleHabitDate(id: string, date: string): Promise<{ success: boolean; habit: Habit; state: AppData }> {
  const response = await authFetch(`${API_BASE}/habits/${encodeURIComponent(id)}/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date }),
  });
  if (!response.ok) throw new Error("Failed to toggle habit");
  return response.json();
}

export async function deleteHabit(id: string): Promise<{ success: boolean; state: AppData }> {
  const response = await authFetch(`${API_BASE}/habits/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete habit");
  return response.json();
}

export async function saveTag(tag: Tag): Promise<{ success: boolean; tag: Tag; state: AppData }> {
  const response = await authFetch(`${API_BASE}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tag),
  });
  if (!response.ok) throw new Error("Failed to save tag");
  return response.json();
}

export async function deleteTag(id: string): Promise<{ success: boolean; state: AppData }> {
  const response = await authFetch(`${API_BASE}/tags/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete tag");
  return response.json();
}

export async function saveNote(note: FloatingNote): Promise<{ success: boolean; note: FloatingNote; state: AppData }> {
  const response = await authFetch(`${API_BASE}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error("Failed to save note");
  return response.json();
}

export async function deleteNote(id: string): Promise<{ success: boolean; state: AppData }> {
  const response = await authFetch(`${API_BASE}/notes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete note");
  return response.json();
}

export async function savePomodoro(settings: PomodoroSettings): Promise<{ success: boolean; pomodoroSettings: PomodoroSettings }> {
  const response = await authFetch(`${API_BASE}/pomodoro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error("Failed to save pomodoro settings");
  return response.json();
}

export async function saveNotificationPrefs(prefs: NotificationPreferences): Promise<{ success: boolean; notificationPreferences: NotificationPreferences }> {
  const response = await authFetch(`${API_BASE}/notifications/preferences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prefs),
  });
  if (!response.ok) throw new Error("Failed to save notification preferences");
  return response.json();
}

export async function readNotification(id: string): Promise<{ success: boolean; state: AppData }> {
  const response = await authFetch(`${API_BASE}/notifications/${encodeURIComponent(id)}/read`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to mark notification read");
  return response.json();
}

export async function readAllNotifications(): Promise<{ success: boolean; state: AppData }> {
  const response = await authFetch(`${API_BASE}/notifications/read-all`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to mark all read");
  return response.json();
}

export async function clearNotifications(): Promise<{ success: boolean; state: AppData }> {
  const response = await authFetch(`${API_BASE}/notifications/clear`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to clear notifications");
  return response.json();
}

export async function triggerManualReminderCheck(simDateToTest: string): Promise<{ success: boolean; dateChecked: string; state: AppData }> {
  const response = await authFetch(`${API_BASE}/check-reminders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ simDate: simDateToTest }),
  });
  if (!response.ok) throw new Error("Failed to run manual reminder sweep");
  return response.json();
}
