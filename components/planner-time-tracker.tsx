"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { UserRole } from "@/lib/auth";

type ActivityOption = {
  value:
    | "CONTENT_CREATION"
    | "COMMUNITY_MANAGEMENT"
    | "CONTENT_PLANNING"
    | "REPORTING"
    | "MEETING"
    | "OTHER"
    | "EDITING";
  label: string;
};

const ACTIVITY_OPTIONS: ActivityOption[] = [
  { value: "CONTENT_CREATION", label: "Content Creation" },
  { value: "COMMUNITY_MANAGEMENT", label: "Engagement/Community Mgmt" },
  { value: "CONTENT_PLANNING", label: "Strategy & Planning" },
  { value: "REPORTING", label: "Analytics & Reporting" },
  { value: "EDITING", label: "Editing" },
  { value: "MEETING", label: "Client Meetings" },
  { value: "OTHER", label: "Admin/Misc" },
];

type TimeEntryItem = {
  id: string;
  userId: string;
  workDate: string;
  minutesSpent: number;
  activityType: ActivityOption["value"];
  notes?: string | null;
};

type PlannerTimeTrackerProps = {
  userId: string | null;
  role: UserRole;
};

function formatTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}h ${mins}m`;
}

function getCurrentDateInput() {
  return new Date().toISOString().split("T")[0];
}

function getActivityLabel(value: string) {
  return ACTIVITY_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function PlannerTimeTracker({ userId, role }: PlannerTimeTrackerProps) {
  const [logs, setLogs] = useState<TimeEntryItem[]>([]);
  const [workDate, setWorkDate] = useState(getCurrentDateInput());
  const [minutes, setMinutes] = useState("");
  const [activityType, setActivityType] = useState<ActivityOption["value"]>("CONTENT_CREATION");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadLogs() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/time-entries");
        if (!response.ok) {
          throw new Error("Could not load time entries.");
        }
        const payload = (await response.json()) as { entries: TimeEntryItem[] };
        if (cancelled) return;
        setLogs(payload.entries);
      } catch {
        if (!cancelled) {
          setError("Unable to load time entries.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadLogs();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleLogs = useMemo(() => {
    if (role === "admin" || role === "owner") {
      return logs;
    }
    if (!userId) {
      return [];
    }
    return logs.filter((log) => log.userId === userId);
  }, [logs, role, userId]);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const weekLogs = visibleLogs.filter((log) => new Date(log.workDate) >= startOfWeek);
    const monthLogs = visibleLogs.filter((log) => new Date(log.workDate) >= startOfMonth);
    const weekMins = weekLogs.reduce((sum, log) => sum + log.minutesSpent, 0);
    const monthMins = monthLogs.reduce((sum, log) => sum + log.minutesSpent, 0);

    const categoryBreakdown = monthLogs.reduce<Record<string, number>>((acc, log) => {
      const key = getActivityLabel(log.activityType);
      acc[key] = (acc[key] ?? 0) + log.minutesSpent;
      return acc;
    }, {});

    return { weekMins, monthMins, categoryBreakdown };
  }, [visibleLogs]);

  async function saveLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!minutes || Number.isNaN(Number(minutes)) || Number(minutes) <= 0) {
      setError("Enter a valid number of minutes.");
      return;
    }

    if (!userId && role !== "admin" && role !== "owner") {
      setError("Missing user context for this session. Please log in again.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          workDate,
          minutesSpent: Number(minutes),
          activityType,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Failed to save time entry.");
      }

      const payload = (await response.json()) as { entry: TimeEntryItem };
      setLogs((prev) => [payload.entry, ...prev]);
      setMinutes("");
      setNotes("");
      setInfo("Time entry saved.");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to save time entry.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteLog(id: string) {
    setError("");
    setInfo("");
    try {
      const response = await fetch(`/api/time-entries/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete entry.");
      }
      setLogs((prev) => prev.filter((log) => log.id !== id));
      setInfo("Entry deleted.");
    } catch {
      setError("Unable to delete entry.");
    }
  }

  return (
    <section className="planner-tracker-grid">
      <article className="panel">
        <h2>Hours Tracker</h2>
        <p className="note-line">Log daily minutes by work type for effort and salary justification tracking.</p>
        <div className="planner-stat-cards">
          <div className="planner-stat-card">
            <p className="kpi-label">This Week</p>
            <p className="kpi-value">{formatTime(stats.weekMins)}</p>
          </div>
          <div className="planner-stat-card">
            <p className="kpi-label">This Month</p>
            <p className="kpi-value">{formatTime(stats.monthMins)}</p>
          </div>
        </div>

        <form className="tools-form" onSubmit={saveLog}>
          <div className="field">
            <label htmlFor="entry-date">Date</label>
            <input id="entry-date" type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="entry-minutes">Time Spent (Minutes)</label>
            <input
              id="entry-minutes"
              type="number"
              min={1}
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
              placeholder="e.g. 45"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="entry-activity">Category</label>
            <select
              id="entry-activity"
              value={activityType}
              onChange={(event) => setActivityType(event.target.value as ActivityOption["value"])}
            >
              {ACTIVITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="entry-notes">Note (Optional)</label>
            <textarea
              id="entry-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What did you work on?"
              className="input-textarea"
            />
          </div>

          <button className="button button-primary" type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Effort"}
          </button>
          {error ? <p className="error">{error}</p> : null}
          {info ? <p className="success-line">{info}</p> : null}
        </form>

        <div className="month-breakdown">
          <h3>Monthly Breakdown</h3>
          <div className="category-bars">
            {ACTIVITY_OPTIONS.map((option) => {
              const value = stats.categoryBreakdown[option.label] ?? 0;
              const percentage = stats.monthMins > 0 ? (value / stats.monthMins) * 100 : 0;
              return (
                <div key={option.value}>
                  <div className="bar-row-label">
                    <span>{option.label}</span>
                    <span>{formatTime(value)}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </article>

      <article className="panel">
        <h2>Recent Activity</h2>
        {isLoading ? <p className="note-line">Loading entries...</p> : null}
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Note</th>
              <th>Duration</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleLogs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.workDate).toLocaleDateString()}</td>
                <td>{getActivityLabel(log.activityType)}</td>
                <td>{log.notes || <span className="empty-note">No note</span>}</td>
                <td>{formatTime(log.minutesSpent)}</td>
                <td>
                  <button className="button button-secondary tiny-button" type="button" onClick={() => deleteLog(log.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {visibleLogs.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={5} className="empty-row">
                  No time logs yet. Add your first effort entry.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </article>
    </section>
  );
}

