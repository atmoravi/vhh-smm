"use client";

import { useEffect, useMemo, useState } from "react";
import { TIME_CATEGORY_OPTIONS, TimeCategoryValue } from "@/lib/time-categories";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

type RateItem = {
  id: string;
  userId: string;
  activityType: TimeCategoryValue;
  hourlyRateEur: number;
};

const DEFAULT_RATE = 25;

export function WorkTimeSettingsManager() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [rates, setRates] = useState<Record<TimeCategoryValue, number>>({
    CONTENT_CREATION: DEFAULT_RATE,
    COMMUNITY_MANAGEMENT: DEFAULT_RATE,
    CONTENT_PLANNING: DEFAULT_RATE,
    REPORTING: DEFAULT_RATE,
    MEETING: DEFAULT_RATE,
    OTHER: DEFAULT_RATE,
    EDITING: DEFAULT_RATE,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const selectedUser = useMemo(() => users.find((user) => user.id === selectedUserId), [users, selectedUserId]);

  useEffect(() => {
    let cancelled = false;
    async function loadUsers() {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? "Unable to load users");
        }
        const payload = (await response.json()) as { users: UserItem[] };
        if (cancelled) return;
        const activeUsers = payload.users.filter((user) => user.isActive);
        setUsers(activeUsers);
        setSelectedUserId(activeUsers[0]?.id ?? "");
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof Error ? loadError.message : "Unable to load users";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;

    let cancelled = false;
    async function loadRates() {
      setError("");
      setInfo("");
      try {
        const response = await fetch(`/api/work-rates?userId=${selectedUserId}`);
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? "Unable to load rates");
        }
        const payload = (await response.json()) as { rates: RateItem[] };
        if (cancelled) return;
        const nextRates: Record<TimeCategoryValue, number> = {
          CONTENT_CREATION: DEFAULT_RATE,
          COMMUNITY_MANAGEMENT: DEFAULT_RATE,
          CONTENT_PLANNING: DEFAULT_RATE,
          REPORTING: DEFAULT_RATE,
          MEETING: DEFAULT_RATE,
          OTHER: DEFAULT_RATE,
          EDITING: DEFAULT_RATE,
        };
        for (const rate of payload.rates) {
          nextRates[rate.activityType] = rate.hourlyRateEur;
        }
        setRates(nextRates);
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof Error ? loadError.message : "Unable to load rates";
          setError(message);
        }
      }
    }

    loadRates();
    return () => {
      cancelled = true;
    };
  }, [selectedUserId]);

  async function saveAllRates() {
    if (!selectedUserId) {
      setError("Select a user first.");
      return;
    }

    setError("");
    setInfo("");
    setIsSaving(true);
    try {
      for (const category of TIME_CATEGORY_OPTIONS) {
        const response = await fetch("/api/work-rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUserId,
            activityType: category.value,
            hourlyRateEur: Number(rates[category.value] ?? 0),
          }),
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? `Failed to save rate for ${category.label}`);
        }
      }
      setInfo("Work time rates saved.");
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Unable to save rates";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="work-settings-wrap">
      <section className="panel work-settings-hero">
        <div>
          <h2>Work Time Rate Settings</h2>
          <p className="note-line">
            Assign EUR/hour per category for each worker. Timetable will automatically show earned amount.
          </p>
        </div>
        <div className="work-settings-user-chip">
          <span className="work-settings-chip-label">Current profile</span>
          <strong>{selectedUser ? selectedUser.name : "No user selected"}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="work-settings-controls">
          <div className="field">
            <label htmlFor="rate-user">Worker</label>
            <select
              id="rate-user"
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              disabled={isLoading || users.length === 0}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email}) [{user.role.toLowerCase()}]
                </option>
              ))}
            </select>
          </div>
          <button className="button button-primary" type="button" onClick={saveAllRates} disabled={isSaving || !selectedUserId}>
            {isSaving ? "Saving..." : "Save Rates"}
          </button>
        </div>

        <div className="work-rate-grid">
          {TIME_CATEGORY_OPTIONS.map((category) => (
            <div key={category.value} className="work-rate-card">
              <p className="work-rate-title">{category.label}</p>
              <label className="work-rate-input-wrap">
                <span className="work-rate-currency">EUR/hour</span>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={rates[category.value]}
                  onChange={(event) =>
                    setRates((prev) => ({
                      ...prev,
                      [category.value]: Number(event.target.value) || 0,
                    }))
                  }
                />
              </label>
            </div>
          ))}
        </div>

        {error ? <p className="error">{error}</p> : null}
        {info ? <p className="success-line">{info}</p> : null}
      </section>
    </div>
  );
}

