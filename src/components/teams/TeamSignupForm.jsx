import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "../../auth/auth";
import { validatePhone } from "../../util/util";
import { Button, Spinner } from "../ui";
import { API } from "../../api/apiClient";
import { queryKeys } from "../../api/queryKeys";

export default function TeamSignupForm({ eventId, managerId, onClose }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState(managerId || "");
  const [managerPhone, setManagerPhone] = useState("");

  const { data: unpaidData, isLoading: loadingUnpaid } = useQuery({
    queryKey: queryKeys.teams.unpaid(eventId),
    queryFn: async () => {
      const r = await fetchWithAuth(`${API}teams/event/${eventId}/unpaid`);
      return r.json();
    },
    enabled: !!managerEmail && !!eventId,
  });

  const unpaidTeams = unpaidData?.teams || [];

  const handleResumeTeam = async (team) => {
    setLoading(true);
    setError("");
    try {
      // Re-register triggers Stripe checkout for existing unpaid team
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_DEV_URI}teams/event/${eventId}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: team.name,
            manager: team.manager,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment initialization failed");
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Free tournament — already registered
        onClose();
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || "Failed to resume payment");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePhone(managerPhone)) {
      setError("Please enter a valid UK phone number (e.g. 07123456789 or +447123456789).");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_DEV_URI}teams/event/${eventId}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            manager: { name: managerName, email: managerEmail, phone: managerPhone.trim() },
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register team");

      if (data.url) {
        window.location.href = data.url;
      } else {
        // Free tournament — registered immediately
        onClose();
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || "An error occurred during registration");
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
          <h2 className="text-2xl font-bold text-base-content">Team Sign Up</h2>
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

        {/* Unpaid teams — resume payment */}
        {!loadingUnpaid && unpaidTeams.length > 0 && (
          <div className="mb-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-700 mb-3">
                You have {unpaidTeams.length} incomplete registration
                {unpaidTeams.length > 1 ? "s" : ""} for this tournament:
              </p>
              <div className="space-y-2">
                {unpaidTeams.map((team) => (
                  <div
                    key={team._id}
                    className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2 border border-amber-100"
                  >
                    <p className="font-medium text-base-content text-sm">{team.name}</p>
                    <button
                      onClick={() => handleResumeTeam(team)}
                      disabled={loading}
                      className="btn btn-sm bg-gradient-to-r from-amber-400 to-orange-500 border-none text-white transition-all duration-300 rounded-lg text-xs"
                    >
                      Resume & Pay
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-3">
                Or fill in the form below to register a new team.
              </p>
            </div>
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
              className="glass-input py-2.5"
              placeholder="Manager Email"
              value={managerEmail}
              onChange={(e) => setManagerEmail(e.target.value)}
              required
              type="email"
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
                <span>Processing...</span>
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
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
                Register Team
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
