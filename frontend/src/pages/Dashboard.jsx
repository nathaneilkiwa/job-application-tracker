import { useEffect, useState } from "react";
import API from "../services/api";
import JobForm from "../components/JobForm";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

const STATUS_CONFIG = {
  Applied:   { dot: "#38bdf8", pill: "bg-sky-500/10 text-sky-400 ring-sky-500/20",            header: "border-sky-500/30",     drag: "ring-sky-500/40"     },
  Interview: { dot: "#a78bfa", pill: "bg-violet-500/10 text-violet-400 ring-violet-500/20",   header: "border-violet-500/30",  drag: "ring-violet-500/40"  },
  Offer:     { dot: "#34d399", pill: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20", header: "border-emerald-500/30", drag: "ring-emerald-500/40" },
  Rejected:  { dot: "#f87171", pill: "bg-rose-500/10 text-rose-400 ring-rose-500/20",          header: "border-rose-500/30",    drag: "ring-rose-500/40"    },
};

const STAT_CARDS = (total, applied, interviews, offers, rejected) => [
  { label: "Total",      value: total,      color: "text-zinc-100",   iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { label: "Applied",    value: applied,    color: "text-sky-400",    iconPath: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
  { label: "Interviews", value: interviews, color: "text-violet-400", iconPath: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { label: "Offers",     value: offers,     color: "text-emerald-400",iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Rejected",   value: rejected,   color: "text-rose-400",   iconPath: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
];

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [editingJob, setEditingJob] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchJobs = async () => {
    const res = await API.get("/jobs");
    setJobs(res.data);
  };

  useEffect(() => { fetchJobs(); }, []);

  // Delete job
  const handleDelete = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job application?")) {
      try {
        await API.delete(`/jobs/${jobId}`);
        fetchJobs();
      } catch (err) {
        console.error("Failed to delete job:", err);
      }
    }
  };

  // Edit job
  const handleEdit = (job) => {
    setEditingJob(job);
    setShowEditModal(true);
  };

  // View job details
  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  const handleUpdate = async (updatedJob) => {
    try {
      await API.put(`/jobs/${updatedJob._id}`, updatedJob);
      fetchJobs();
      setShowEditModal(false);
      setEditingJob(null);
    } catch (err) {
      console.error("Failed to update job:", err);
    }
  };

  const totalJobs      = jobs.length;
  const appliedCount   = jobs.filter(j => j.status === "Applied").length;
  const interviewCount = jobs.filter(j => j.status === "Interview").length;
  const offerCount     = jobs.filter(j => j.status === "Offer").length;
  const rejectedCount  = jobs.filter(j => j.status === "Rejected").length;

  const filteredJobs = filter === "All" ? jobs : jobs.filter(j => j.status === filter);

  const groupedJobs = STATUSES.reduce((acc, status) => {
    acc[status] = filteredJobs.filter(j => j.status === status);
    return acc;
  }, {});

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    try {
      await API.put(`/jobs/${result.draggableId}`, { status: result.destination.droppableId });
      fetchJobs();
    } catch (err) {
      console.error("Failed to update job status:", err);
    }
  };

  const chartData = STATUSES
    .map(status => ({ name: status, value: groupedJobs[status]?.length || 0 }))
    .filter(d => d.value > 0);

  const stats = STAT_CARDS(totalJobs, appliedCount, interviewCount, offerCount, rejectedCount);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">JobTracker</span>
          </div>
          <span className="text-xs text-zinc-500 tracking-widest uppercase hidden sm:block">
            {new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-4xl font-black tracking-tight leading-none mb-1">Your Pipeline</h2>
          <p className="text-zinc-500 text-sm">Click on any card to view full details, drag to update status.</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {stats.map(({ label, value, color, iconPath }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
              <div className={`flex items-center gap-1.5 mb-3 ${color}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
              </div>
              <p className={`text-3xl font-black tabular-nums ${color}`}>{value}</p>
            </div>
          ))}
        </motion.div>

        {/* Chart + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.14 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-6">Distribution</p>

            {chartData.length > 0 ? (
              <>
                <div className="flex justify-center">
                  <PieChart width={260} height={260}>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={105}
                      strokeWidth={0}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_CONFIG[entry.name].dot} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#18181b",
                        border: "1px solid #3f3f46",
                        borderRadius: "10px",
                        color: "#f4f4f5",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  {STATUSES.map(status => (
                    <div key={status} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: STATUS_CONFIG[status].dot }} />
                      <span className="text-xs text-zinc-500">{status}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-56 text-zinc-700">
                <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p className="text-sm">Add jobs to see the chart</p>
              </div>
            )}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-6">Add Application</p>
            <JobForm fetchJobs={fetchJobs} />
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["All", ...STATUSES].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${
                filter === status
                  ? "bg-white text-zinc-900 shadow-md"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              }`}
            >
              {status}
              {status !== "All" && (
                <span className="ml-1.5 opacity-60">
                  {jobs.filter(j => j.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Kanban */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
            {STATUSES.map(status => {
              const cfg = STATUS_CONFIG[status];
              const count = groupedJobs[status]?.length || 0;
              return (
                <Droppable droppableId={status} key={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-2xl border flex flex-col min-h-64 transition-all duration-200 ${
                        snapshot.isDraggingOver
                          ? `bg-zinc-800 border-zinc-600 ring-1 ${cfg.drag}`
                          : "bg-zinc-900 border-zinc-800"
                      }`}
                    >
                      {/* Column header */}
                      <div className={`flex items-center justify-between px-4 py-3 border-b ${cfg.header}`}>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                          <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                            {status}
                          </span>
                        </div>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full ring-1 ${cfg.pill}`}>
                          {count}
                        </span>
                      </div>

                      {/* Cards */}
                      <div className="p-3 flex-1 overflow-y-auto max-h-[520px] space-y-2.5">
                        {count === 0 && (
                          <div className="flex flex-col items-center justify-center h-24 text-zinc-700 text-xs">
                            <span className="text-xl mb-1">·</span>
                            Drop here
                          </div>
                        )}

                        <AnimatePresence>
                          {groupedJobs[status]?.map((job, index) => (
                            <Draggable key={job._id} draggableId={job._id} index={index}>
                              {(provided, snapshot) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  transition={{ duration: 0.18, delay: index * 0.04 }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleViewDetails(job)}
                                  className={`group relative bg-zinc-800/70 border rounded-xl p-3.5 cursor-pointer transition-all duration-150 ${
                                    snapshot.isDragging
                                      ? `shadow-2xl border-zinc-600 ring-1 ${cfg.drag} cursor-grabbing`
                                      : "border-zinc-700/60 hover:border-zinc-600 hover:bg-zinc-800/90"
                                  }`}
                                >
                                  {/* Action Buttons */}
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(job);
                                      }}
                                      className="p-1 bg-zinc-700 hover:bg-zinc-600 rounded-md transition-colors"
                                      title="Edit"
                                    >
                                      <svg className="w-3 h-3 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(job._id);
                                      }}
                                      className="p-1 bg-zinc-700 hover:bg-rose-600 rounded-md transition-colors"
                                      title="Delete"
                                    >
                                      <svg className="w-3 h-3 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>

                                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                                     style={{ color: cfg.dot }}>
                                    {status}
                                  </p>
                                  <h4 className="font-bold text-sm text-zinc-100 leading-snug pr-12">{job.company}</h4>
                                  <p className="text-xs text-zinc-500 mt-0.5">{job.position}</p>
                                  {job.notes && (
                                    <p className="text-[11px] text-zinc-600 mt-2 truncate">📝 {job.notes.substring(0, 50)}</p>
                                  )}
                                </motion.div>
                              )}
                            </Draggable>
                          ))}
                        </AnimatePresence>
                      </div>

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>

      </main>

      {/* Edit Modal */}
      {showEditModal && editingJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Edit Job Application</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Company</label>
                <input
                  type="text"
                  value={editingJob.company}
                  onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Position</label>
                <input
                  type="text"
                  value={editingJob.position}
                  onChange={(e) => setEditingJob({ ...editingJob, position: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Status</label>
                <select
                  value={editingJob.status}
                  onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Notes</label>
                <textarea
                  value={editingJob.notes || ""}
                  onChange={(e) => setEditingJob({ ...editingJob, notes: e.target.value })}
                  rows="3"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleUpdate(editingJob)}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingJob(null);
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Job Details Modal */}
      <AnimatePresence>
        {showDetailModal && selectedJob && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`p-6 border-b ${STATUS_CONFIG[selectedJob.status].header}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_CONFIG[selectedJob.status].pill}`}>
                        {selectedJob.status}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Added {formatDate(selectedJob.createdAt)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedJob.company}</h2>
                    <p className="text-zinc-400 mt-1">{selectedJob.position}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Application Details */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Application Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-xs text-zinc-500 mb-1">Company</p>
                      <p className="text-sm font-medium text-white">{selectedJob.company}</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-xs text-zinc-500 mb-1">Position</p>
                      <p className="text-sm font-medium text-white">{selectedJob.position}</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-xs text-zinc-500 mb-1">Current Status</p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: STATUS_CONFIG[selectedJob.status].dot }} />
                        <p className="text-sm font-medium text-white">{selectedJob.status}</p>
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-xs text-zinc-500 mb-1">Application ID</p>
                      <p className="text-xs font-mono text-zinc-400">{selectedJob._id}</p>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Notes</h3>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    {selectedJob.notes ? (
                      <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {selectedJob.notes}
                      </p>
                    ) : (
                      <p className="text-zinc-500 italic">No notes added for this application.</p>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                {selectedJob.createdAt && (
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Timeline</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-zinc-400">Application submitted:</span>
                        <span className="text-white">{formatDate(selectedJob.createdAt)}</span>
                      </div>
                      {selectedJob.updatedAt && selectedJob.updatedAt !== selectedJob.createdAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="text-zinc-400">Last updated:</span>
                          <span className="text-white">{formatDate(selectedJob.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-zinc-800 flex gap-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedJob);
                  }}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Edit Application
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleDelete(selectedJob._id);
                  }}
                  className="flex-1 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white font-medium py-2 rounded-lg transition-colors border border-rose-500/30 hover:border-rose-500"
                >
                  Delete Application
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}988