import React, { useState } from "react";
import { Notice } from "../../types";
import { Search, Plus, Trash2, Calendar, Bell, Send } from "lucide-react";

interface AdminNoticesProps {
  notices: Notice[];
  onAddNotice: (notice: Partial<Notice>) => Promise<void>;
  onDeleteNotice: (id: string) => Promise<void>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export function AdminNotices({ notices, onAddNotice, onDeleteNotice, showNotification }: AdminNoticesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<Notice["type"]>("General");
  const [priority, setPriority] = useState<Notice["priority"]>("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      showNotification("Please fill in the announcement title and description.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddNotice({ title, content, type, priority });
      showNotification("Placement circular broadcasted successfully!", "success");
      setTitle("");
      setContent("");
      setType("General");
      setPriority("Medium");
      setShowForm(false);
    } catch (err: any) {
      showNotification(err.message || "Failed to broadcast notice", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete and un-publish this circular?")) {
      try {
        await onDeleteNotice(id);
        showNotification("Announcement un-published.", "info");
      } catch (err: any) {
        showNotification(err.message || "Failed to delete notice", "error");
      }
    }
  };

  const filteredNotices = notices.filter((n) => {
    return n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getPriorityStyle = (prio: string) => {
    switch (prio) {
      case "High":
        return "bg-red-50 text-red-700 border-red-100";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6" id="admin-notices-view">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Announcements</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Publish, edit, or delete circulars, drive dates, and test results lists.</p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            id="broadcast-notice-btn"
          >
            <Plus className="w-4 h-4" />
            Broadcast Circular
          </button>
        )}
      </div>

      {/* Broadcast Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-indigo-600 animate-bounce" />
            Publish New University Circular / Announcement
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notice / Circular Title *</label>
              <input
                type="text"
                required
                placeholder="Google Software Dev Drive: Pre-Placement Talk Slot Allocated"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold bg-slate-50 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notice Category</label>
                <select
                  value={type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as Notice["type"])}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold bg-slate-50 focus:outline-none cursor-pointer"
                >
                  <option value="General">General Announcement</option>
                  <option value="Company">Company Specific</option>
                  <option value="Exam">Exam / Code Assessment</option>
                  <option value="Placement">Placement Drives</option>
                  <option value="Reminder">Time-bound Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Circular Priority</label>
                <select
                  value={priority}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as Notice["priority"])}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold bg-slate-50 focus:outline-none cursor-pointer"
                >
                  <option value="High">High (Immediate Action)</option>
                  <option value="Medium">Medium (General Update)</option>
                  <option value="Low">Low (FYI / Academic)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description Content *</label>
              <textarea
                required
                rows={4}
                placeholder="State the core details, dates, criteria, links, or instructions clearly. Supports newline spacing..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs bg-slate-50 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer disabled:bg-slate-400 inline-flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? "Broadcasting..." : "Broadcast Notice"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toolbar filter */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search circular title, text context, or key terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all bg-slate-50/50"
          />
        </div>
      </div>

      {/* Broadcasted notice history */}
      {filteredNotices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-sm text-slate-500 italic">No published placement circulars match search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((not) => (
            <div
              key={not._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase rounded-md border border-indigo-100">
                    {not.type}
                  </span>
                  
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded border ${getPriorityStyle(not.priority)}`}>
                    {not.priority} Priority
                  </span>

                  <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {not.createdAt ? new Date(not.createdAt).toLocaleDateString() : "Today"}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{not.title}</h4>
                  <p className="text-slate-600 text-xs mt-2 bg-slate-50 border border-slate-100 p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed">
                    {not.content}
                  </p>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(not._id)}
                className="h-9 w-9 rounded-xl border border-slate-150 bg-white text-slate-400 hover:text-red-600 hover:bg-slate-50 inline-flex items-center justify-center cursor-pointer transition-colors"
                title="Wipe and unbroadcast announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default AdminNotices;
