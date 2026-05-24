import React, { useState, useEffect } from "react";
import { Task, Tag, SubTask, TaskAttachment } from "../types";
import { X, Calendar, Plus, Trash2, CheckCircle2, Circle, AlertCircle, RefreshCw, Paperclip, File, FileText, Image, Film, Music, Eye, Download, UploadCloud } from "lucide-react";

interface TaskDetailsModalProps {
  task: Task | null;
  tags: Tag[];
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
  isDark?: boolean;
  primaryColor?: string;
  lightAccentClass?: string;
  cardClass?: string;
  bannerClass?: string;
  accentClass?: string;
}

export default function TaskDetailsModal({
  task,
  tags,
  onClose,
  onSave,
  onDelete,
  isDark = false,
  primaryColor = "#3B82F6",
  lightAccentClass = "bg-blue-50 text-blue-600",
  cardClass = "bg-white border-slate-200 text-slate-800 shadow-xs",
  bannerClass = "bg-slate-50 border-slate-200",
  accentClass = "bg-blue-600 hover:bg-blue-700 text-white"
}: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Field values
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [points, setPoints] = useState(3);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [activePreviewFile, setActivePreviewFile] = useState<TaskAttachment | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStartDate(task.startDate);
      setDeadline(task.deadline);
      setSelectedTags(task.tags || []);
      setSubtasks(task.subtasks || []);
      setProgress(task.progress || 0);
      setPoints(task.points || 3);
      setAttachments(task.attachments || []);
      setIsEditing(task.id.startsWith("new-"));
    }
  }, [task]);

  if (!task) return null;

  // Calculate automated progress percentage based on checked subtasks.
  // Direct matching to: "automatically change progress status of a task or project instead of user changing manually (like progress check and change with the click of a button)"
  const recalculateProgressAndStatus = (currentSubtasks: SubTask[]) => {
    let newProgress = progress;
    if (currentSubtasks.length > 0) {
      const completedCount = currentSubtasks.filter(s => s.completed).length;
      newProgress = Math.round((completedCount / currentSubtasks.length) * 100);
    }
    
    let newStatus: Task['status'] = "Not Started";
    if (newProgress === 100) {
      newStatus = "Completed";
    } else if (newProgress > 0) {
      newStatus = "In Progress";
    }

    const updatedTask: Task = {
      ...task,
      title,
      description,
      startDate,
      deadline,
      tags: selectedTags,
      subtasks: currentSubtasks,
      progress: newProgress,
      status: newStatus,
      points,
      attachments
    };

    setProgress(newProgress);
    onSave(updatedTask);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updated = subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    setSubtasks(updated);
    recalculateProgressAndStatus(updated);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim()) return;

    const newSub: SubTask = {
      id: `sub-${Date.now()}`,
      title: newSubTaskTitle,
      completed: false
    };

    const updated = [...subtasks, newSub];
    setSubtasks(updated);
    setNewSubTaskTitle("");
    recalculateProgressAndStatus(updated);
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updated = subtasks.filter(s => s.id !== subtaskId);
    setSubtasks(updated);
    recalculateProgressAndStatus(updated);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  // Direct manual check complete shortcut: toggles process 0 <-> 100
  const handleQuickCompletedToggle = () => {
    const nextProgress = progress === 100 ? 0 : 100;
    setProgress(nextProgress);
    
    // Toggle all subtasks to correspond
    const updatedSubtasks = subtasks.map(s => ({
      ...s,
      completed: nextProgress === 100
    }));
    
    setSubtasks(updatedSubtasks);

    const updatedTask: Task = {
      ...task,
      title,
      description,
      startDate,
      deadline,
      tags: selectedTags,
      subtasks: updatedSubtasks,
      progress: nextProgress,
      status: nextProgress === 100 ? "Completed" : "Not Started",
      points,
      attachments
    };

    onSave(updatedTask);
  };

  const handleSaveAllFields = () => {
    let finalProgress = progress;
    if (subtasks.length > 0) {
      const completedCount = subtasks.filter(s => s.completed).length;
      finalProgress = Math.round((completedCount / subtasks.length) * 100);
    }
    
    const finalStatus: Task['status'] = finalProgress === 100 
      ? "Completed" 
      : finalProgress > 0 ? "In Progress" : "Not Started";

    onSave({
      ...task,
      title,
      description,
      startDate,
      deadline,
      tags: selectedTags,
      subtasks,
      progress: finalProgress,
      status: finalStatus,
      points,
      attachments
    });
    setIsEditing(false);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newAttachment: TaskAttachment = {
          id: `attach-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          data: base64String
        };
        
        setAttachments(prev => {
          const updated = [...prev, newAttachment];
          onSave({
            ...task,
            title,
            description,
            startDate,
            deadline,
            tags: selectedTags,
            subtasks,
            progress,
            status: task.status,
            points,
            attachments: updated
          });
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    setAttachments(prev => {
      const updated = prev.filter(a => a.id !== attachmentId);
      onSave({
        ...task,
        title,
        description,
        startDate,
        deadline,
        tags: selectedTags,
        subtasks,
        progress,
        status: task.status,
        points,
        attachments: updated
      });
      return updated;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto" id="task-modal-backdrop">
      <div className={`rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8 border ${cardClass}`} id="task-modal-box">
        {/* Modal Top */}
        <div className={`p-5 flex items-center justify-between border-b ${isDark ? "bg-slate-950/65 border-slate-800/80" : "bg-slate-50 border-slate-100"}`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${lightAccentClass}`}>
              {task.status} ({progress}%)
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {task.id}</span>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${isDark ? "hover:bg-slate-800 text-slate-450 hover:text-white" : "hover:bg-slate-200 text-slate-400 hover:text-slate-700"}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Container Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {isEditing ? (
            // EDITING SECTION
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase opacity-80">Task Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full text-sm p-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                    isDark 
                      ? "bg-slate-900 border-slate-850 text-slate-101 focus:ring-slate-700" 
                      : "bg-white border-slate-300 text-slate-850 focus:ring-blue-500"
                  }`}
                  placeholder="Task subject..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase opacity-80">Description / Objectives</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`w-full text-sm p-2.5 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                    isDark 
                      ? "bg-slate-900 border-slate-850 text-slate-101 focus:ring-slate-700" 
                      : "bg-white border-slate-300 text-slate-850 focus:focus:ring-blue-500"
                  }`}
                  placeholder="Insert essay prompt, homework requirements..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase opacity-80">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full text-sm p-2 border rounded-lg focus:outline-none focus:ring-1 ${
                      isDark 
                        ? "bg-slate-900 border-slate-800 text-slate-100 focus:ring-slate-700" 
                        : "bg-white border-slate-301 text-slate-850 focus:ring-blue-400"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase opacity-80">Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={`w-full text-sm p-2 border rounded-lg focus:outline-none focus:ring-1 ${
                      isDark 
                        ? "bg-slate-900 border-slate-800 text-slate-100 focus:ring-slate-700" 
                        : "bg-white border-slate-301 text-slate-850 focus:ring-blue-400"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase font-mono" style={{ color: primaryColor }}>Completion Award</label>
                  <select
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className={`w-full text-sm p-2 border rounded-lg font-bold focus:outline-none focus:ring-2 ${
                      isDark 
                        ? "bg-slate-900 border-slate-800 text-slate-100 focus:ring-slate-750" 
                        : "bg-white border-slate-300 text-slate-850 focus:ring-blue-500"
                    }`}
                  >
                    <option value={1}>1p</option>
                    <option value={3}>3p</option>
                    <option value={5}>5p</option>
                    <option value={10}>10p</option>
                    <option value={15}>15p</option>
                    <option value={20}>20p</option>
                  </select>
                </div>
              </div>

              {/* Tag Picker list */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase block opacity-80">Assign Course Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => {
                    const isSelected = selectedTags.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        className="text-xs px-3 py-1 rounded-full border transition-all cursor-pointer font-medium"
                        style={{
                          borderColor: t.color,
                          backgroundColor: isSelected ? t.color : "transparent",
                          color: isSelected ? "#fff" : t.color
                        }}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action editors buttons */}
              <div className={`flex gap-2 justify-end border-t pt-4 ${isDark ? "border-slate-800/80" : "border-slate-100"}`}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={`text-xs px-4 py-2 border rounded-lg transition-colors cursor-pointer ${
                    isDark 
                      ? "border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-white" 
                      : "border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAllFields}
                  className={`text-xs px-4 py-2 rounded-lg font-bold shadow-2xs transition-colors cursor-pointer ${accentClass}`}
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            // DETAIL DISPLAY
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold" style={{ color: isDark ? "#fff" : "#1e293b" }}>{title}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`text-xs px-3 py-1 rounded-lg border transition-all cursor-pointer font-semibold ${
                      isDark 
                        ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300" 
                        : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                    }`}
                  >
                    Edit Fields
                  </button>
                </div>
                
                {/* tags rendered */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map(tagId => {
                    const t = tags.find(tg => tg.id === tagId);
                    if (!t) return null;
                    return (
                      <span
                        key={tagId}
                        className="text-xs px-2.5 py-0.5 rounded-full text-white font-semibold"
                        style={{ backgroundColor: t.color }}
                      >
                        {t.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              {description && (
                <div className={`rounded-xl p-4 text-xs leading-relaxed max-h-48 overflow-y-auto border ${
                  isDark ? "bg-slate-900/60 border-slate-850/80 text-slate-300" : "bg-slate-50 border-slate-150 text-slate-650"
                }`}>
                  {description}
                </div>
              )}

              {/* Dates & Points indicator widget */}
              <div className={`grid grid-cols-3 gap-3 rounded-xl p-3 border text-xs ${
                isDark ? "bg-slate-900/40 border-slate-850/70 text-slate-300" : "bg-slate-50 border-slate-150 text-slate-600"
              }`}>
                <div>
                  <span className="text-slate-450 block uppercase font-bold text-[9px] opacity-80">Start Date</span>
                  <span className="font-bold font-mono">{startDate || "Not scheduled"}</span>
                </div>
                <div>
                  <span className="text-slate-455 block uppercase font-bold text-[9px] opacity-80">Deadline</span>
                  <span className="text-rose-500 font-bold font-mono">{deadline || "Not Scheduled"}</span>
                </div>
                <div>
                  <span className="block uppercase font-bold text-[9px] font-mono opacity-90" style={{ color: primaryColor }}>Award Reward</span>
                  <span className="font-black font-mono text-sm" style={{ color: primaryColor }}>{task.points || 3}p</span>
                </div>
              </div>

              {/* Automated Progress Status Panel */}
              <div className={`space-y-2 border-t pt-4 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider">
                    Automated Status: <span style={{ color: primaryColor }}>{task.status}</span>
                  </h3>
                  <button
                    id="modal-quick-complete-toggle"
                    type="button"
                    onClick={handleQuickCompletedToggle}
                    className={`text-[10px] font-black border px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      isDark 
                        ? "bg-indigo-950/30 border-indigo-900 text-indigo-400 hover:bg-indigo-900/30" 
                        : "bg-indigo-55/70 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    ⚡ Toggle Complete Checked ({progress}%)
                  </button>
                </div>

                <div className={`w-full rounded-full h-2 ${isDark ? "bg-slate-850" : "bg-slate-100"}`}>
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ backgroundColor: primaryColor, width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-450 italic block leading-snug">
                  Objectives checklist completion updates task statuses dynamically (0% is Not Started, 1-99% is In Progress, 100% is Completed)!
                </span>
              </div>

              {/* CHECKLIST SUBTASKS SECTION */}
              <div className={`space-y-3 border-t pt-4 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Checklist Objectives
                </h3>

                {/* Addition form */}
                <form onSubmit={handleAddSubtask} className="flex gap-2">
                  <input
                    type="text"
                    value={newSubTaskTitle}
                    onChange={(e) => setNewSubTaskTitle(e.target.value)}
                    placeholder="Add step/milestone objective..."
                    className={`flex-1 text-xs px-2.5 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                      isDark 
                        ? "bg-slate-900 border-slate-850 text-slate-100 placeholder-slate-500" 
                        : "bg-white border-slate-300 text-slate-850"
                    }`}
                  />
                  <button
                    type="submit"
                    className={`p-2 rounded-lg text-white cursor-pointer hover:opacity-90 ${accentClass}`}
                  >
                    <Plus size={16} />
                  </button>
                </form>

                {/* Subtasks rendering list */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {subtasks.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                      No milestones registered yet.
                    </div>
                  ) : (
                    subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                          isDark 
                            ? "bg-slate-900/40 hover:bg-slate-900/80 border-slate-850 text-slate-300" 
                            : "bg-slate-50/70 hover:bg-slate-100/80 border-slate-150 text-slate-750"
                        }`}
                      >
                        <button
                          id={`toggle-subtask-${sub.id}`}
                          type="button"
                          onClick={() => handleToggleSubtask(sub.id)}
                          className="flex items-center gap-2.5 text-xs text-left cursor-pointer"
                        >
                          {sub.completed ? (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          ) : (
                            <Circle size={16} className="text-slate-450" />
                          )}
                          <span className={sub.completed ? "line-through text-slate-450 font-medium" : "font-semibold"}>
                            {sub.title}
                          </span>
                        </button>

                        <button
                          id={`delete-subtask-${sub.id}`}
                          type="button"
                          onClick={() => handleDeleteSubtask(sub.id)}
                          className="text-slate-400 hover:text-rose-500 rounded p-1 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dangerous operations */}
              <div className={`border-t pt-4 flex justify-between items-center text-xs ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                <button
                  id="modal-delete-task-btn"
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    isDark 
                      ? "text-rose-450 hover:bg-rose-950/20 border-rose-950/60" 
                      : "text-red-650 hover:bg-red-50 border-red-100"
                  }`}
                >
                  <Trash2 size={14} /> Remove Task
                </button>
                <span className="text-slate-400 font-medium">Press Esc or Close to save instantly.</span>
              </div>
            </div>
          )}

          {/* Unified Workspace Attachments Section */}
          <div className={`mt-6 pt-5 border-t ${isDark ? "border-slate-800/80" : "border-slate-100"} space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
                <Paperclip size={14} className="text-emerald-500" /> Task Files &amp; Workspace Attachments ({attachments.length})
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Max: 50MB</span>
            </div>

            {/* Drag & drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 ${
                dragOver 
                  ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]" 
                  : isDark 
                    ? "border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-705" 
                    : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/75 hover:border-slate-300"
              }`}
            >
              <input
                type="file"
                id="task-file-input"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <label htmlFor="task-file-input" className="cursor-pointer space-y-1 block select-none">
                <UploadCloud size={24} className="mx-auto text-slate-405 opacity-80" />
                <p className="text-xs font-semibold text-slate-400">
                  Drag &amp; drop files here, or <span className="text-emerald-500 underline hover:text-emerald-400 font-bold">browse</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  Allows Images, PDFs, Text, Code, Audio, &amp; Video files
                </p>
              </label>
            </div>

            {/* Files List */}
            {attachments.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {attachments.map((file) => {
                  let FileIcon = File;
                  if (file.type.startsWith("image/")) FileIcon = Image;
                  else if (file.type.startsWith("text/")) FileIcon = FileText;
                  else if (file.type.startsWith("audio/")) FileIcon = Music;
                  else if (file.type.startsWith("video/")) FileIcon = Film;

                  const formattedSize = file.size > 1024 * 1024
                    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                    : `${(file.size / 1024).toFixed(0)} KB`;

                  return (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                        isDark 
                          ? "bg-slate-900/40 hover:bg-slate-900/80 border-slate-850/80" 
                          : "bg-slate-50/50 hover:bg-slate-100/60 border-slate-150"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 max-w-[60%] truncate">
                        <FileIcon size={16} className="text-slate-450 flex-shrink-0" />
                        <div className="truncate text-left">
                          <p className="font-semibold truncate text-[11px]">{file.name}</p>
                          <p className="text-[9px] text-slate-403 font-mono uppercase">{formattedSize} • {file.type.split("/")[1] || "unknown"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActivePreviewFile(file)}
                          className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all select-none cursor-pointer ${
                            isDark 
                              ? "bg-slate-950 border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                          title="Open/View details in-app"
                        >
                          <Eye size={11} /> View
                        </button>

                        <a
                          href={file.data}
                          download={file.name}
                          className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all select-none cursor-pointer ${
                            isDark 
                              ? "bg-slate-950 border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                          title="Download attachment"
                        >
                          <Download size={11} /> Save
                        </a>

                        <button
                          onClick={() => handleDeleteAttachment(file.id)}
                          className="p-1.5 rounded-lg border border-rose-500/10 text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all"
                          title="Delete file"
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
        </div>
      </div>

      {/* Embedded File Opener & Lightbox Previewer */}
      {activePreviewFile && (
        <div className="fixed inset-0 bg-black/80 z-55 flex items-center justify-center p-4 overflow-y-auto animate-fade-in" style={{ zIndex: 99999 }}>
          <div className={`rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border transition-all ${
            isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className={`p-4 flex items-center justify-between border-b ${isDark ? "bg-slate-900 border-slate-850" : "bg-slate-50 border-slate-100"}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <Paperclip size={16} className="text-emerald-500 flex-shrink-0" />
                <span className="font-bold text-xs truncate max-w-md select-all">{activePreviewFile.name}</span>
              </div>
              <button
                onClick={() => setActivePreviewFile(null)}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  isDark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex items-center justify-center bg-black/15 min-h-[300px] max-h-[65vh] overflow-y-auto text-center">
              {activePreviewFile.type.startsWith("image/") ? (
                <img
                  src={activePreviewFile.data}
                  alt={activePreviewFile.name}
                  className="max-w-full max-h-[55vh] object-contain rounded-xl shadow-md border border-slate-700/10"
                  referrerPolicy="no-referrer"
                />
              ) : activePreviewFile.type.startsWith("text/") || activePreviewFile.name.endsWith(".txt") || activePreviewFile.name.endsWith(".json") || activePreviewFile.name.endsWith(".md") || activePreviewFile.name.endsWith(".ts") || activePreviewFile.name.endsWith(".tsx") || activePreviewFile.type === "application/json" ? (
                <div className="w-full text-left">
                  <pre className="p-4 bg-slate-900 border border-slate-850 text-emerald-400 rounded-xl overflow-auto font-mono text-[11px] leading-relaxed max-h-[50vh] whitespace-pre-wrap select-text">
                    {(() => {
                      try {
                        const parts = activePreviewFile.data.split(",");
                        const base64 = parts[1] || parts[0];
                        return decodeURIComponent(escape(atob(base64)));
                      } catch (err) {
                        return "Unable to decode text representation. Consider downloading the file.";
                      }
                    })()}
                  </pre>
                </div>
              ) : activePreviewFile.type === "application/pdf" ? (
                <iframe
                  src={activePreviewFile.data}
                  title="PDF Viewer"
                  className="w-full h-[55vh] rounded-xl border-0 bg-white"
                />
              ) : activePreviewFile.type.startsWith("audio/") ? (
                <div className="space-y-4 py-8">
                  <Music size={54} className="mx-auto text-emerald-500 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-400">Playing Attached Audio Clip</p>
                  <audio controls src={activePreviewFile.data} className="mx-auto block" />
                </div>
              ) : activePreviewFile.type.startsWith("video/") ? (
                <video controls src={activePreviewFile.data} className="max-w-full max-h-[50vh] rounded-xl mx-auto shadow-md" />
              ) : (
                <div className="text-center py-10 space-y-4 max-w-sm mx-auto">
                  <AlertCircle size={48} className="mx-auto text-amber-500" />
                  <p className="text-xs font-bold">Preview unavailable for this format ({activePreviewFile.type})</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Simply download the attachment to open and view with your default system application natively!
                  </p>
                  <a
                    href={activePreviewFile.data}
                    download={activePreviewFile.name}
                    className="inline-flex items-center gap-1 px-4 py-2 mt-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer select-none"
                  >
                    <Download size={13} /> Download File
                  </a>
                </div>
              )}
            </div>
            
            <div className={`p-4 border-t flex justify-end gap-2 ${isDark ? "bg-slate-900 border-slate-850" : "bg-slate-50 border-slate-100"}`}>
              <a
                href={activePreviewFile.data}
                download={activePreviewFile.name}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all cursor-pointer select-none flex items-center gap-1 shadow-xs"
              >
                <Download size={13} /> Save to Disk
              </a>
              <button
                onClick={() => setActivePreviewFile(null)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  isDark ? "border-slate-800 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
