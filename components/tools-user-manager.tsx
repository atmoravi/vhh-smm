"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { appUsers } from "@/lib/mock-data";
import { AppUser } from "@/lib/types";

const STORAGE_KEY = "vh_smm_tools_users_v1";
type RoleOption = "admin" | "owner" | "manager" | "worker";

const roleToApi: Record<RoleOption, "ADMIN" | "OWNER" | "MANAGER" | "WORKER"> = {
  admin: "ADMIN",
  owner: "OWNER",
  manager: "MANAGER",
  worker: "WORKER",
};

function roleFromApi(role: string): RoleOption {
  if (role === "ADMIN") return "admin";
  if (role === "OWNER") return "owner";
  if (role === "MANAGER") return "manager";
  return "worker";
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function generateStrongPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let output = "";
  for (let i = 0; i < 12; i += 1) output += chars[Math.floor(Math.random() * chars.length)];
  return output;
}

function readStoredUsers(): AppUser[] {
  if (typeof window === "undefined") return appUsers;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return appUsers;
    const parsed = JSON.parse(raw) as AppUser[];
    return Array.isArray(parsed) ? parsed : appUsers;
  } catch {
    return appUsers;
  }
}

export function ToolsUserManager() {
  const [users, setUsers] = useState<AppUser[]>(appUsers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleOption>("worker");
  const [active, setActive] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [dbMode, setDbMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        const response = await fetch("/api/users", { method: "GET" });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? `Unable to load users (HTTP ${response.status}).`);
        }
        const payload = (await response.json()) as {
          users: Array<{
            id: string;
            name: string;
            email: string;
            role: string;
            isActive: boolean;
            profileImageUrl?: string | null;
          }>;
        };
        if (cancelled) return;
        setDbMode(true);
        setUsers(
          payload.users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: roleFromApi(user.role),
            active: user.isActive,
            profileImageUrl: user.profileImageUrl ?? undefined,
          })),
        );
      } catch {
        if (cancelled) return;
        setDbMode(false);
        setUsers(readStoredUsers());
        if (!cancelled) {
          setError(
            "Database mode unavailable. Check /api/health/db and Vercel env vars. Running in local fallback.",
          );
        }
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!dbMode) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
  }, [dbMode, users]);

  const totalAdmins = useMemo(
    () => users.filter((user) => user.role === "admin" || user.role === "owner").length,
    [users],
  );

  function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setError("Image is too large. Use an image below 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      setError("A user with this email already exists.");
      return;
    }

    const newUser: AppUser = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : `u-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      role,
      active,
      profileImageUrl: imagePreview || undefined,
      tempPassword: password,
    };

    setIsSaving(true);
    try {
      if (dbMode) {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newUser.name,
            email: newUser.email,
            role: roleToApi[newUser.role],
            password: newUser.tempPassword,
            isActive: newUser.active,
            profileImageUrl: newUser.profileImageUrl,
          }),
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? "Failed to save user in database.");
        }
        const payload = (await response.json()) as {
          user: {
            id: string;
            name: string;
            email: string;
            role: string;
            isActive: boolean;
            profileImageUrl?: string | null;
          };
        };
        setUsers((prev) => [
          {
            id: payload.user.id,
            name: payload.user.name,
            email: payload.user.email,
            role: roleFromApi(payload.user.role),
            active: payload.user.isActive,
            profileImageUrl: payload.user.profileImageUrl ?? undefined,
            tempPassword: password,
          },
          ...prev,
        ]);
        setInfo("User saved to database.");
      } else {
        setUsers((prev) => [newUser, ...prev]);
        setInfo("Database mode is off. User saved in local browser storage.");
      }

      setName("");
      setEmail("");
      setRole("worker");
      setActive(true);
      setPassword("");
      setConfirmPassword("");
      setImagePreview("");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to save user.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function copyPassword(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setInfo("Password copied.");
    } catch {
      setError("Unable to copy password.");
    }
  }

  return (
    <>
      <section className="panel">
        <h2>Tools: Add User</h2>
        <p>Create team users and attach a profile image.</p>
        <p className="note-line">{dbMode ? "Mode: database storage active" : "Mode: local browser fallback"}</p>

        <form className="tools-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="tool-name">Name</label>
            <input
              id="tool-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="tool-email">Email</label>
            <input
              id="tool-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="tool-role">Role</label>
            <select id="tool-role" value={role} onChange={(event) => setRole(event.target.value as RoleOption)}>
              <option value="worker">worker</option>
              <option value="manager">manager</option>
              <option value="owner">owner</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="tool-image">Profile Image</label>
            <input id="tool-image" type="file" accept="image/*" onChange={onImageChange} />
          </div>

          <div className="field">
            <label htmlFor="tool-password">Password</label>
            <input
              id="tool-password"
              type="text"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Temporary password"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="tool-password-confirm">Confirm Password</label>
            <input
              id="tool-password-confirm"
              type="text"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat password"
              required
            />
          </div>

          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              const generated = generateStrongPassword();
              setPassword(generated);
              setConfirmPassword(generated);
            }}
          >
            Generate Password
          </button>

          {imagePreview ? (
            <div className="image-preview-wrap">
              <img className="image-preview" src={imagePreview} alt="Profile preview" />
              <button className="button button-secondary" type="button" onClick={() => setImagePreview("")}>
                Remove image
              </button>
            </div>
          ) : null}

          <label className="checkbox-line">
            <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
            Active user
          </label>

          <button className="button button-primary" type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Add user"}
          </button>
          {error ? <p className="error">{error}</p> : null}
          {info ? <p className="success-line">{info}</p> : null}
        </form>
      </section>

      <section className="panel">
        <h2>Users ({users.length})</h2>
        <p>Admins/Owners: {totalAdmins}</p>

        <div className="users-grid">
          {users.map((user) => (
            <article className="user-card" key={user.id}>
              {user.profileImageUrl ? (
                <img className="user-avatar-image" src={user.profileImageUrl} alt={`${user.name} profile`} />
              ) : (
                <div className="user-avatar-fallback">{toInitials(user.name)}</div>
              )}
              <div>
                <p className="user-name">{user.name}</p>
                <p className="user-meta">{user.email}</p>
                <p className="user-meta">
                  {user.role} · {user.active ? "active" : "inactive"}
                </p>
                {user.tempPassword ? (
                  <div className="password-line">
                    <code>{user.tempPassword}</code>
                    <button
                      className="button button-secondary tiny-button"
                      type="button"
                      onClick={() => copyPassword(user.tempPassword ?? "")}
                    >
                      Copy
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
