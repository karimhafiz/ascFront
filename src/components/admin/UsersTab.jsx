import React, { useState } from "react";
import { getAuthToken } from "../../auth/auth";
import SortableHeader from "../common/SortableHeader";
import { formatDate, roleBadgeClass, usePagination } from "./adminHelpers";
import Pagination from "./Pagination";

const ROLE_ORDER = { admin: 0, moderator: 1, user: 2 };

export default function UsersTab({ users, currentUserId, onRoleChange }) {
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sort.key) return 0;
    let va, vb;
    if (sort.key === "role") {
      va = ROLE_ORDER[a.role] ?? 3;
      vb = ROLE_ORDER[b.role] ?? 3;
    } else if (sort.key === "joined") {
      va = new Date(a.createdAt);
      vb = new Date(b.createdAt);
    }
    return sort.dir === "asc" ? va - vb : vb - va;
  });

  const pg = usePagination(sorted, [search, sort.key, sort.dir]);

  const handleRole = async (userId, newRole) => {
    setUpdating(userId);
    const token = getAuthToken();
    try {
      const res = await fetch(`${import.meta.env.VITE_DEV_URI}admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) onRoleChange(userId, newRole);
      else alert(data.message);
    } catch {
      alert("Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="glass-input mb-4"
      />
      <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
              <th className="px-4 py-3 font-semibold text-base-content">Name</th>
              <th className="px-4 py-3 font-semibold text-base-content">Email</th>
              <SortableHeader label="Role" sortKey="role" sort={sort} onSort={setSort} />
              <SortableHeader label="Joined" sortKey="joined" sort={sort} onSort={setSort} />
              <th className="px-4 py-3 font-semibold text-base-content text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-100">
            {pg.paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-base-content/50">
                  No users found
                </td>
              </tr>
            ) : (
              pg.paged.map((u) => (
                <tr key={u._id} className="bg-white hover:bg-base-200/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-base-content">{u.name}</td>
                  <td className="px-4 py-3 text-base-content/70">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "text-xs font-medium px-2 py-0.5 rounded-full border capitalize " +
                        (roleBadgeClass[u.role] ?? roleBadgeClass.user)
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-base-content/50">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    {u._id === currentUserId ? (
                      <span className="text-xs text-base-content/50 italic">you</span>
                    ) : (
                      <select
                        value={u.role}
                        disabled={updating === u._id}
                        onChange={(e) => handleRole(u._id, e.target.value)}
                        className="glass-input glass-select text-xs px-2 py-1 disabled:opacity-50"
                      >
                        <option value="user">user</option>
                        <option value="moderator">moderator</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={pg.page}
        totalPages={pg.totalPages}
        setPage={pg.setPage}
        total={filtered.length}
        label={`user${filtered.length !== 1 ? "s" : ""}`}
      />
    </div>
  );
}
