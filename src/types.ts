export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;       // MIME type (image/*, application/pdf, text/plain, etc.)
  size: number;       // File size in bytes
  data: string;       // File base64 content
}

export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  tags: string[]; // Tag IDs
  subtasks: SubTask[];
  progress: number; // 0 to 100
  status: TaskStatus;
  points?: number; // customizable point reward: 1, 3, 5, 10, 15, or 20
  reminderPreferences: {
    browserEnabled: boolean;
    frequencyHours: number; // custom interval
  };
  attachments?: TaskAttachment[];
}

export interface Habit {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'custom';
  tags: string[]; // Tag IDs
  completionHistory: string[]; // List of YYYY-MM-DD strings
}

export interface Tag {
  id: string;
  name: string;
  color: string; // hex or CSS class
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'reminder' | 'deadline' | 'habit' | 'system';
  timestamp: string; // ISO String
  read: boolean;
  taskId?: string;
  daysRemaining?: number;
}

export interface NoteListItem {
  id: string;
  text: string;
  checked: boolean;
  type: 'bullet' | 'checkbox';
}

export interface FloatingNote {
  id: string;
  title: string;
  isList: boolean;
  listItems: NoteListItem[];
  text: string; // For rich/simple text
  position: { x: number; y: number };
  width: number;
  height: number;
  isMinimized: boolean;
  color?: string;
}

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // number of work sessions
  soundName: string; // 'bell' | 'digital' | 'chime' | 'none'
  volume: number; // 0 to 100
}

export interface NotificationPreferences {
  enabled: boolean;
  daysBeforeDeadline: number; // e.g., 2
  enableSystemSound: boolean;
  frequencyMinutes: number; // check interval
}

export interface AppData {
  tasks: Task[];
  habits: Habit[];
  tags: Tag[];
  notes: FloatingNote[];
  notifications: NotificationItem[];
  pomodoroSettings: PomodoroSettings;
  notificationPreferences: NotificationPreferences;
  userPoints: number;
  themeBackground: string; // url or gradient tailwind class
  weatherEffect: 'none' | 'rain' | 'heavy-rain' | 'cherry-blossoms' | 'snow' | 'autumn-leaves';
  weatherOpacity?: number; // 0 to 100
  weatherDensity?: number; // 0 to 100
  ambientSound: 'none' | 'cafe' | 'white-noise' | 'pink-noise' | 'brown-noise' | 'rain' | 'heavy-rain';
  ambientVolume: number; // 0 to 100
}
