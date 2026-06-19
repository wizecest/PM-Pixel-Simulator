"use client";

import type { Role } from "@/types/simulation";

interface RoleSelectorProps {
  roles: Role[];
  selectedRoleIds: string[];
  onChange: (roleIds: string[]) => void;
}

export function RoleSelector({ roles, selectedRoleIds, onChange }: RoleSelectorProps) {
  function toggleRole(roleId: string) {
    onChange(selectedRoleIds.includes(roleId) ? selectedRoleIds.filter((id) => id !== roleId) : [...selectedRoleIds, roleId]);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {roles.map((role) => (
        <button
          key={role.id}
          type="button"
          onClick={() => toggleRole(role.id)}
          className={`pixel-select-card text-left ${selectedRoleIds.includes(role.id) ? "is-selected" : ""}`}
        >
          <span className="flex items-center gap-3">
            <span className="pixel-avatar">{role.name.slice(0, 1)}</span>
            <span>
              <span className="block font-bold text-pixel-yellow">{role.name}</span>
              <span className="mt-1 block text-xs text-pixel-muted">{role.title}</span>
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
