"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSpreadsheet,
  Download,
  Trash2,
  Loader2,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import {
  fetchRankingHistory,
  deleteRankingHistory,
  exportCSV,
  type RankingHistoryEntry,
} from "@/services/api";

export function RankingHistorySection() {
  const [history, setHistory] = useState<RankingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchRankingHistory();
      setHistory(data);
    } catch {
      setError("Could not load ranking history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteRankingHistory(id);
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch {
      setError("Failed to delete entry.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (jobId: string, tier: 10 | 50 | 100) => {
    const key = `${jobId}-${tier}`;
    setDownloadingKey(key);
    try {
      await exportCSV(jobId, tier);
    } catch {
      alert("CSV not found. This ranking was created before CSV persistence was enabled. Run a new ranking to get downloadable results.");
    } finally {
      setDownloadingKey(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
    >
      {/* Section Header */}
      <div className="px-6 md:px-8 py-5 border-b border-white/[0.05] flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Ranking History</h3>
          <p className="text-xs text-white/40">
            {history.length} saved {history.length === 1 ? "result" : "results"}
          </p>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-400 bg-red-500/10 border-b border-red-500/20 px-6 py-3"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {history.length === 0 && (
        <div className="px-6 md:px-8 py-16 text-center">
          <FileText className="h-10 w-10 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm">No ranking results yet.</p>
          <p className="text-white/20 text-xs mt-1">
            Run a ranking from the Talent Ranker and your results will appear here.
          </p>
        </div>
      )}

      {/* History List */}
      <div className="divide-y divide-white/[0.04]">
        <AnimatePresence>
          {history.map((entry, index) => {
            const isExpanded = expandedId === entry._id;
            const isDeleting = deletingId === entry._id;

            return (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: 0.03 * index }}
                className="group"
              >
                {/* Main row */}
                <div
                  className="px-6 md:px-8 py-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : entry._id)}
                >
                  {/* Icon */}
                  <div className="h-10 w-10 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="h-4 w-4 text-white/30" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">
                      {entry.jobTitle}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <div className="text-white/20">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Expanded panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-5 pt-1 space-y-4">
                        {/* JD snippet */}
                        {entry.jobDescriptionSnippet && (
                          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                            <p className="text-xs text-white/30 mb-2">Job Description</p>
                            <p className="text-xs text-white/50 leading-relaxed line-clamp-4">
                              {entry.jobDescriptionSnippet}
                            </p>
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap gap-3 text-xs text-white/30">
                          <span className="bg-white/[0.04] px-3 py-1.5 rounded-lg">
                            File: {entry.fileName || "N/A"}
                          </span>
                          <span className="bg-white/[0.04] px-3 py-1.5 rounded-lg">
                            Job ID: {entry.jobId}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {([10, 50, 100] as const).map((tier) => {
                            const key = `${entry.jobId}-${tier}`;
                            const isDownloading = downloadingKey === key;
                            return (
                              <button
                                key={tier}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(entry.jobId, tier);
                                }}
                                disabled={isDownloading}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                                  bg-indigo-500/10 border border-indigo-500/20 text-indigo-300
                                  hover:bg-indigo-500/20 hover:border-indigo-500/30
                                  disabled:opacity-40 disabled:cursor-wait
                                  transition-all duration-200"
                              >
                                {isDownloading ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Download className="h-3 w-3" />
                                )}
                                Top {tier}
                              </button>
                            );
                          })}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(entry._id);
                            }}
                            disabled={isDeleting}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ml-auto
                              bg-white/[0.04] border border-white/[0.06] text-white/40
                              hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400
                              disabled:opacity-40 disabled:cursor-wait
                              transition-all duration-200"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
