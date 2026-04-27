import React, { useState } from "react";
import { fetchWithAuth } from "../../auth/auth";
import SortableHeader from "../common/SortableHeader";
import ConfirmModal from "../common/ConfirmModal";
import { formatDate, roleBadgeClass, usePagination } from "./adminHelpers";
import Pagination from "./Pagination";

const ROLE_ORDER = { admin: 0, moderator: 1, user: 2 };
const ROLE_LABELS = { admin: "Admin", moderator: "Moderator", user: "User" };

export default function UsersTab({ users, currentUserId, onRoleChange, onBanToggle }) {
  const [updating, setUpdating] = useState(null);
  const [banning, setBanning] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [modal, setModal] = useState(null);

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

  const executeRole = async (userId, newRole) => {
    setUpdating(userId);
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_DEV_URI}admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) onRoleChange(userId, newRole);
      else alert(data.error || data.message);
    } catch {
      alert("Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const executeBan = async (userId) => {
    setBanning(userId);
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_DEV_URI}admin/users/${userId}/ban`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) onBanToggle(userId, data.isBanned);
      else alert(data.error || data.message);
    } catch {
      alert("Failed to update ban status");
    } finally {
      setBanning(null);
    }
  };

  const promptRoleChange = (user, newRole) => {
    if (newRole === user.role) return;
    const isPromotion = ROLE_ORDER[newRole] < ROLE_ORDER[user.role];
    setModal({
      title: isPromotion ? "Promote user?" : "Demote user?",
      message: `Change ${user.name} from ${ROLE_LABELS[user.role]} to ${ROLE_LABELS[newRole]}?`,
      confirmLabel: isPromotion ? "Promote" : "Demote",
      onConfirm: () => {
        setModal(null);
        executeRole(user._id, newRole);
      },
    });
  };

  const promptBan = (user) => {
    const willBan = !user.isBanned;
    setModal({
      title: willBan ? "Ban user?" : "Unban user?",
      message: willBan
        ? `${user.name} will be banned and unable to log in.`
        : `${user.name} will be unbanned and able to log in again.`,
      confirmLabel: willBan ? "Ban" : "Unban",
      onConfirm: () => {
        setModal(null);
        executeBan(user._id);
      },
    });
  };

  return (
    <div>
      <ConfirmModal
        isOpen={!!modal}
        title={modal?.title}
        message={modal?.message}
        confirmLabel={modal?.confirmLabel}
        onConfirm={modal?.onConfirm}
        onCancel={() => setModal(null)}
      />

      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="glass-input mb-4"
      />

      {/* ── Mobile card layout ── */}
      <div className="sm:hidden space-y-3">
        {pg.paged.length === 0 ? (
          <p className="text-center text-base-content/50 py-10">No users found</p>
        ) : (
          pg.paged.map((u) => (
            <div
              key={u._id}
              className={`rounded-2xl border shadow-sm p-4 ${
                u.isBanned ? "border-red-200 bg-red-50/50" : "border-base-300 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-base-content truncate">{u.name}</p>
                  <p className="text-xs text-base-content/50 truncate mt-0.5">{u.email}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={
                      "text-xs font-medium px-2 py-0.5 rounded-full border capitalize " +
                      (roleBadgeClass[u.role] ?? roleBadgeClass.user)
                    }
                  >
                    {u.role}
                  </span>
                  {u.isBanned ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200">
                      Banned
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
                      Active
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-base-content/40 mt-2">Joined {formatDate(u.createdAt)}</p>

              {u._id === currentUserId ? (
                <p className="text-xs text-base-content/50 italic mt-3">you</p>
              ) : (
                <div className="flex items-center gap-2 mt-3">
                  <select
                    value={u.role}
                    disabled={updating === u._id}
                    onChange={(e) => promptRoleChange(u, e.target.value)}
                    className="glass-input glass-select text-xs px-2 py-1.5 disabled:opacity-50 flex-1"
                  >
                    <option value="user">user</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    onClick={() => promptBan(u)}
                    disabled={banning === u._id}
                    className={`text-xs font-medium px-4 py-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                      u.isBanned
                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    }`}
                  >
                    {banning === u._id ? "\u2026" : u.isBanned ? "Unban" : "Ban"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden sm:block rounded-2xl border border-base-300 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
              <th className="px-4 py-3 font-semibold text-base-content">Name</th>
              <th className="px-4 py-3 font-semibold text-base-content hidden md:table-cell">
                Email
              </th>
              <SortableHeader label="Role" sortKey="role" sort={sort} onSort={setSort} />
              <th className="px-4 py-3 font-semibold text-base-content">Status</th>
              <th
                onClick={() => {
                  if (sort.key !== "joined") setSort({ key: "joined", dir: "asc" });
                  else if (sort.dir === "asc") setSort({ key: "joined", dir: "desc" });
                  else setSort({ key: null, dir: "asc" });
                }}
                className="px-4 py-3 font-semibold text-base-content cursor-pointer select-none hover:text-base-content/70 transition-colors hidden md:table-cell"
              >
                <span className="inline-flex items-center gap-1">
                  Joined
                  {sort.key === "joined" ? (
                    <svg
                      className={`w-3 h-3 transition-transform ${sort.dir === "desc" ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3 text-base-content/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  )}
                </span>
              </th>
              <th className="px-4 py-3 font-semibold text-base-content text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-100">
            {pg.paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-base-content/50">
                  No users found
                </td>
              </tr>
            ) : (
              pg.paged.map((u) => (
                <tr
                  key={u._id}
                  className={`hover:bg-base-200/30 transition-colors ${u.isBanned ? "bg-red-50/50" : "bg-white"}`}
                >
                  <td className="px-4 py-3 font-medium text-base-content">
                    <span className="block">{u.name}</span>
                    <span className="block text-xs text-base-content/50 md:hidden truncate">
                      {u.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-base-content/70 hidden md:table-cell">{u.email}</td>
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
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200">
                        Banned
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-base-content/50 hidden md:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {u._id === currentUserId ? (
                      <div className="text-center">
                        <span className="text-xs text-base-content/50 italic">you</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <select
                          value={u.role}
                          disabled={updating === u._id}
                          onChange={(e) => promptRoleChange(u, e.target.value)}
                          className="glass-input glass-select text-xs px-2 py-1 disabled:opacity-50"
                        >
                          <option value="user">user</option>
                          <option value="moderator">moderator</option>
                          <option value="admin">admin</option>
                        </select>
                        <button
                          onClick={() => promptBan(u)}
                          disabled={banning === u._id}
                          className={`text-xs font-medium px-3 py-1 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                            u.isBanned
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          }`}
                        >
                          {banning === u._id ? "\u2026" : u.isBanned ? "Unban" : "Ban"}
                        </button>
                      </div>
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
