"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { UserRole } from "@/lib/auth";
import { getTimeCategoryLabel, TIME_CATEGORY_OPTIONS, TimeCategoryValue } from "@/lib/time-categories";

type TimeEntryItem = {
  id: string;
  userId: string;
  workDate: string;
  minutesSpent: number;
  activityType: TimeCategoryValue;
  notes?: string | null;
};

type TimetableTrackerProps = {
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

function buildEmptyRates() {
  return {
    CONTENT_CREATION: 0,
    COMMUNITY_MANAGEMENT: 0,
    CONTENT_PLANNING: 0,
    REPORTING: 0,
    MEETING: 0,
    OTHER: 0,
    EDITING: 0,
  } as Record<TimeCategoryValue, number>;
}

export function TimetableTracker({ userId, role }: TimetableTrackerProps) {
  const [logs, setLogs] = useState<TimeEntryItem[]>([]);
  const [rates, setRates] = useState<Record<TimeCategoryValue, number>>(buildEmptyRates());
  const [workDate, setWorkDate] = useState(getCurrentDateInput());
  const [minutes, setMinutes] = useState("");
  const [activityType, setActivityType] = useState<TimeCategoryValue>("CONTENT_CREATION");
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
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? "Could not load time entries.");
        }
        const payload = (await response.json()) as { entries: TimeEntryItem[] };
        if (!cancelled) {
          setLogs(payload.entries);
        }
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof Error ? loadError.message : "Unable to load time entries.";
          setError(message);
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

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      if (!userId && role !== "admin" && role !== "owner") {
        return;
      }
      try {
        const query = userId ? `?userId=${userId}` : "";
        const response = await fetch(`/api/work-rates${query}`);
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as {
          rates: Array<{ activityType: TimeCategoryValue; hourlyRateEur: number }>;
        };
        if (cancelled) return;
        const nextRates = buildEmptyRates();
        for (const rate of payload.rates) {
          nextRates[rate.activityType] = rate.hourlyRateEur;
        }
        setRates(nextRates);
      } catch {
        // Keep zero-rate defaults
      }
    }

    loadRates();
    return () => {
      cancelled = true;
    };
  }, [userId, role]);

  const visibleLogs = useMemo(() => {
    if (role === "admin" || role === "owner") return logs;
    if (!userId) return [];
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
      const label = getTimeCategoryLabel(log.activityType);
      acc[label] = (acc[label] ?? 0) + log.minutesSpent;
      return acc;
    }, {});

    const calcEarnings = (list: TimeEntryItem[]) =>
      list.reduce((sum, item) => sum + (item.minutesSpent / 60) * (rates[item.activityType] ?? 0), 0);

    return {
      weekMins,
      monthMins,
      categoryBreakdown,
      weekEarnings: calcEarnings(weekLogs),
      monthEarnings: calcEarnings(monthLogs),
    };
  }, [visibleLogs, rates]);

  async function addLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!minutes || Number.isNaN(Number(minutes)) || Number(minutes) <= 0) {
      setError("Enter valid minutes.");
      return;
    }
    if (!userId && role !== "admin" && role !== "owner") {
      setError("Missing session user context.");
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
        throw new Error(payload.error ?? "Failed to save effort.");
      }
      const payload = (await response.json()) as { entry: TimeEntryItem };
      setLogs((prev) => [payload.entry, ...prev]);
      setMinutes("");
      setNotes("");
      setInfo("Effort saved.");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to save effort.";
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
        throw new Error("Unable to delete entry.");
      }
      setLogs((prev) => prev.filter((entry) => entry.id !== id));
      setInfo("Entry deleted.");
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Unable to delete entry.";
      setError(message);
    }
  }

  return (
    <div className="timetable-grid">
      <div className="timetable-left">
        <div className="panel">
          <h2>SMM Effort Tracker</h2>
          <p className="note-line">Log daily minutes and track productivity and earnings.</p>

          <div className="timetable-stats">
            <div className="planner-stat-card">
              <p className="kpi-label">This Week</p>
              <p className="kpi-value">{formatTime(stats.weekMins)}</p>
            </div>
            <div className="planner-stat-card">
              <p className="kpi-label">This Month</p>
              <p className="kpi-value">{formatTime(stats.monthMins)}</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>Add New Effort</h2>
          <form className="tools-form" onSubmit={addLog}>
            <div className="field">
              <label htmlFor="tt-date">Date</label>
              <input id="tt-date" type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="tt-minutes">Time Spent (Minutes)</label>
              <input
                id="tt-minutes"
                type="number"
                min={1}
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
                placeholder="e.g. 45"
              />
            </div>
            <div className="field">
              <label htmlFor="tt-category">Category</label>
              <select
                id="tt-category"
                value={activityType}
                onChange={(event) => setActivityType(event.target.value as TimeCategoryValue)}
              >
                {TIME_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="tt-note">Note (Optional)</label>
              <textarea
                id="tt-note"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="input-textarea"
                placeholder="What did you work on?"
              />
            </div>
            <button className="button button-primary" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Effort"}
            </button>
            {error ? <p className="error">{error}</p> : null}
            {info ? <p className="success-line">{info}</p> : null}
          </form>
        </div>

        <div className="panel">
          <h2>Monthly Breakdown</h2>
          <div className="earnings-strip">
            <div>
              <span>Weekly Earned</span>
              <strong>{stats.weekEarnings.toFixed(2)} EUR</strong>
            </div>
            <div>
              <span>Monthly Earned</span>
              <strong>{stats.monthEarnings.toFixed(2)} EUR</strong>
            </div>
          </div>
          <div className="category-bars">
            {TIME_CATEGORY_OPTIONS.map((option) => {
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
            {stats.monthMins === 0 ? <p className="note-line">No logs for this month yet.</p> : null}
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Recent Activity</h2>
        {isLoading ? <p className="note-line">Loading entries...</p> : null}
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Note</th>
              <th>Duration</th>
              <th>Earned</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleLogs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.workDate).toLocaleDateString()}</td>
                <td>{getTimeCategoryLabel(log.activityType)}</td>
                <td>{log.notes || <span className="empty-note">No note</span>}</td>
                <td>{formatTime(log.minutesSpent)}</td>
                <td className="earn-cell">{((log.minutesSpent / 60) * (rates[log.activityType] ?? 0)).toFixed(2)} EUR</td>
                <td>
                  <button className="button button-secondary tiny-button" type="button" onClick={() => deleteLog(log.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && visibleLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-row">
                  No effort logs found. Start by adding one.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

