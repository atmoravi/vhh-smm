import { UserRole } from "@/lib/auth";

type ProfileMenuProps = {
  userName: string;
  role: UserRole;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "U";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function ProfileMenu({ userName, role }: ProfileMenuProps) {
  const initials = getInitials(userName);
  return (
    <details className="profile-menu">
      <summary className="profile-trigger">
        <span className="profile-avatar">{initials}</span>
        <span className="profile-name">{userName}</span>
      </summary>
      <div className="profile-dropdown">
        <p className="profile-line">
          <strong>User:</strong> {userName}
        </p>
        <p className="profile-line">
          <strong>Role:</strong> {role}
        </p>
      </div>
    </details>
  );
}

