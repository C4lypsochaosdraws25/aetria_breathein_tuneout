import React, { useState } from "react";
import { NotificationItem, NotificationPreferences } from "../types";
import { Bell, Check, Trash2, Calendar, Settings, CalendarClock, Volume2, VolumeX } from "lucide-react";

interface NotificationsCenterProps {
  notifications: NotificationItem[];
  preferences: NotificationPreferences;
  simulatedDate: string;
  onUpdateSimulatedDate: (date: string) => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onUpdatePrefs: (preferences: NotificationPreferences) => void;
  onTriggerCheck: () => void;
  isDark?: boolean;
  primaryColor?: string;
  accentClass?: string;
  cardClass?: string;
  bannerClass?: string;
  lightAccentClass?: string;
  headerClass?: string;
}

export default function NotificationsCenter({
  notifications,
  preferences,
  simulatedDate,
  onUpdateSimulatedDate,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onUpdatePrefs,
  onTriggerCheck,
  isDark = false,
  primaryColor = "#3B82F6",
  accentClass = "",
  cardClass = "bg-white border-slate-200 text-slate-800 shadow-md",
  bannerClass = "bg-slate-50 border-slate-100 text-slate-600",
  lightAccentClass = "bg-blue-550/10 text-blue-600",
  headerClass = "bg-slate-50 border-slate-105 text-slate-800"
}: NotificationsCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" id="notifications-center-wrapper">
      {/* Target Notification Button */}
      <button
        id="toggle-notification-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-1.5 focus:outline-none ${lightAccentClass} ${
          isDark 
            ? "border-slate-850 hover:bg-slate-800" 
            : "border-slate-200 hover:bg-slate-50"
        }`}
      >
        <Bell size={18} className={unreadCount > 0 ? "animate-swing" : ""} style={{ color: unreadCount > 0 ? primaryColor : undefined }} />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white leading-none shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            {unreadCount}
          </span>
        )}
        <span className="text-xs font-semibold hidden md:inline">Alerts</span>
      </button>

      {isOpen && (
        <div
          id="notifications-dropdown"
          className={`absolute right-0 mt-2.5 w-80 sm:w-96 max-w-[calc(100vw-24px)] rounded-2xl border shadow-2xl z-50 overflow-hidden text-sm transition-all duration-300 ${cardClass}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between border-b p-4 ${headerClass}`}>
            <h3 className="font-bold flex items-center gap-2">
              <Bell size={16} style={{ color: primaryColor }} /> Notifications
            </h3>
            <div className="flex gap-2 items-center">
              <button
                id="toggle-prefs-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="Notification Preferences"
                className={`p-1.5 rounded-lg transition-colors ${
                  showSettings 
                    ? isDark ? "bg-slate-800 text-slate-205" : "bg-slate-200 text-slate-800"
                    : isDark ? "hover:bg-slate-900 text-slate-400" : "hover:bg-slate-200 text-slate-500"
                }`}
              >
                <Settings size={15} />
              </button>
              {unreadCount > 0 && (
                <button
                  id="mark-all-read-btn"
                  onClick={onMarkAllRead}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: primaryColor }}
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  id="clear-all-notif-btn"
                  onClick={onClearAll}
                  title="Clear notification list"
                  className="text-rose-500 hover:text-rose-700 hover:scale-105 p-1 transition-transform cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Settings Section */}
          {showSettings && (
            <div className={`border-b p-4 space-y-3 ${bannerClass}`}>
              <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">
                Preferences
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Enable Reminders</span>
                <input
                  type="checkbox"
                  checked={preferences.enabled}
                  onChange={(e) => onUpdatePrefs({ ...preferences, enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                  style={{ accentColor: primaryColor }}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Start notifying before deadline:</span>
                  <span className="font-bold" style={{ color: primaryColor }}>{preferences.daysBeforeDeadline} days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={preferences.daysBeforeDeadline}
                  onChange={(e) => onUpdatePrefs({ ...preferences, daysBeforeDeadline: parseInt(e.target.value) })}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-auto cursor-pointer"
                  style={{ accentColor: primaryColor }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1">
                  {preferences.enableSystemSound ? <Volume2 size={13} /> : <VolumeX size={13} />} Play Alert Sound
                </span>
                <input
                  type="checkbox"
                  checked={preferences.enableSystemSound}
                  onChange={(e) => onUpdatePrefs({ ...preferences, enableSystemSound: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                  style={{ accentColor: primaryColor }}
                />
              </div>
            </div>
          )}

          {/* Custom Simulated Testing Section */}
          <div className={`border-b p-4 space-y-2 ${bannerClass}`}>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold flex items-center gap-1 text-slate-400">
                <CalendarClock size={14} style={{ color: primaryColor }} /> Simulated Current Date:
              </span>
              <input
                type="date"
                value={simulatedDate}
                onChange={(e) => onUpdateSimulatedDate(e.target.value)}
                className={`text-xs p-1 border rounded font-mono focus:outline-none ${
                  isDark 
                    ? "bg-slate-900 border-slate-800 text-slate-200 focus:ring-1 focus:ring-slate-700" 
                    : "bg-white border-slate-200 text-slate-700 focus:ring-1 focus:ring-slate-300"
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-450 leading-tight">
              Test dynamic reminders by setting virtual school days ahead (reminds starting 2 days prior).
            </p>
            <button
              onClick={onTriggerCheck}
              className="w-full text-xs font-bold py-1.5 px-2 rounded-xl transition-all text-center shadow-xs cursor-pointer hover:scale-[1.01]"
              style={{ backgroundColor: primaryColor, color: "white" }}
            >
              Trigger Check Notifications
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/10 p-2.5 space-y-1.5">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium">
                No active notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl flex gap-2 transition-all duration-150 ${
                    n.read 
                      ? isDark ? "bg-slate-900/10 text-slate-400 opacity-60" : "bg-white text-slate-500 opacity-55 border border-slate-100"
                      : isDark ? "bg-slate-900/60 border-l-4 font-semibold text-slate-100 border-slate-800" : "bg-slate-50 border-l-4 font-semibold text-slate-800 border-slate-200"
                  }`}
                  style={{ borderLeftColor: n.read ? undefined : primaryColor }}
                >
                  <div className="flex-1">
                    <p className={`text-xs whitespace-pre-wrap ${n.read ? "text-slate-400" : isDark ? "text-slate-200" : "text-slate-850"}`}>{n.message}</p>
                    <span className="text-[9px] text-slate-400 block mt-1 font-mono">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {!n.read && (
                    <button
                      id={`mark-read-btn-${n.id}`}
                      onClick={() => onMarkRead(n.id)}
                      title="Mark as Read"
                      className="text-slate-400 hover:text-green-500 p-1 self-start transition-colors cursor-pointer"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
