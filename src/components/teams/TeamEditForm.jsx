import { useState } from "react";
import { fetchWithAuth } from "../../auth/auth";
import { validatePhone } from "../../util/util";
import { Button, Spinner } from "../ui";

export default function TeamEditForm({ team, onClose, onSaved }) {
  const [name, setName] = useState(team.name);
  const [managerName, setManagerName] = useState(team.manager?.name || "");
  const [managerPhone, setManagerPhone] = useState(team.manager?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePhone(managerPhone)) {
      setError("Please enter a valid UK phone number (e.g. 07123456789 or +447123456789).");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_DEV_URI}teams/${team._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          manager: { name: managerName, email: team.manager.email, phone: managerPhone.trim() },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update team");
      onSaved(data.team);
    } catch (err) {
      setError(err.message || "An error occurred while updating the team");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white/80 to-base-200/80 rounded-2xl shadow-xl border border-white/50 backdrop-blur-md p-5 sm:p-8 relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <Button
          variant="circle"
          size="sm"
          className="absolute top-3 right-3"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </Button>

        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-base-content">Edit Team</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/70 rounded-full mx-auto mt-2"></div>
        </div>

        {error && (
          <div className="bg-red-50/80 border border-red-200/80 text-red-700 p-3 rounded-xl mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-500 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium text-base-content mb-1">Team Name</label>
            <input
              className="glass-input py-2.5"
              placeholder="Team Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium text-base-content mb-1">Manager Name</label>
            <input
              className="glass-input py-2.5"
              placeholder="Manager Name"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium text-base-content mb-1">Manager Email</label>
            <input
              className="glass-input py-2.5 bg-base-200/40 cursor-not-allowed"
              value={team.manager?.email || ""}
              disabled
            />
          </div>

          <div>
            <label className="block font-medium text-base-content mb-1">Manager Phone</label>
            <input
              className="glass-input py-2.5"
              placeholder="Phone Number"
              value={managerPhone}
              onChange={(e) => setManagerPhone(e.target.value)}
              required
              type="tel"
            />
          </div>

          <Button variant="primary" className="w-full py-3" type="submit" disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Changes
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
