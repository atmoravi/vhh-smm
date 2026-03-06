"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { appUsers } from "@/lib/mock-data";
import { AppUser } from "@/lib/types";

const STORAGE_KEY = "vh_smm_tools_users_v1";

type RoleOption = "admin" | "worker";

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "U";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function readStoredUsers(): AppUser[] {
  if (typeof window === "undefined") {
    return appUsers;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return appUsers;
    }
    const parsed = JSON.parse(raw) as AppUser[];
    return Array.isArray(parsed) ? parsed : appUsers;
  } catch {
    return appUsers;
  }
}

function generateStrongPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let output = "";
  for (let i = 0; i < 12; i += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
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

  useEffect(() => {
    setUsers(readStoredUsers());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const totalAdmins = useMemo(() => users.filter((user) => user.role === "admin").length, [users]);

  function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

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

    setUsers((prev) => [newUser, ...prev]);
    setName("");
    setEmail("");
    setRole("worker");
    setActive(true);
    setPassword("");
    setConfirmPassword("");
    setImagePreview("");
  }

  async function copyPassword(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError("Unable to copy password.");
    }
  }

  return (
    <>
      <section className="panel">
        <h2>Tools: Add User</h2>
        <p>Create admin/worker users and attach a profile image (local UI storage for now).</p>
        <p className="note-line">
          Temporary: these credentials are stored in browser local storage until database auth is implemented.
        </p>

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
              placeholder="Worker temporary password"
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

          <button className="button button-primary" type="submit">
            Add user
          </button>
          {error ? <p className="error">{error}</p> : null}
        </form>
      </section>

      <section className="panel">
        <h2>Users ({users.length})</h2>
        <p>Admins: {totalAdmins}</p>

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
