import React, { useState } from "react";

export default function TeamSignupForm({
  eventId,
  managerId,
  onSuccess,
  onClose,
}) {
  const [name, setName] = useState("");
  const [members, setMembers] = useState([{ name: "", email: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [team, setTeam] = useState(null);
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState(managerId || "");

  const handleMemberChange = (idx, field, value) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const addMember = () =>
    setMembers((prev) => [...prev, { name: "", email: "" }]);
  const removeMember = (idx) =>
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_DEV_URI}teams/event/${eventId}/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            members,
            manager: {
              name: managerName,
              email: managerEmail,
            },
          }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register team");
      }

      setTeam(data.team);

      // Immediately proceed to payment after successful registration
      if (data.team && data.team._id) {
        try {
          const paymentRes = await fetch(
            `${import.meta.env.VITE_DEV_URI}teams/${data.team._id}/pay`,
            { method: "POST" }
          );
          const paymentData = await paymentRes.json();

          if (!paymentRes.ok || !paymentData.link) {
            throw new Error(
              paymentData.error || "Payment initialization failed"
            );
          }

          // Redirect to payment page
          window.location.href = paymentData.link;
        } catch (payErr) {
          throw new Error(
            `Team registered but payment failed: ${payErr.message}`
          );
        }
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white/80 to-purple-100/80 rounded-2xl shadow-xl border border-white/50 backdrop-blur-md p-8 relative w-full max-w-lg">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 btn btn-sm btn-circle bg-white/50 hover:bg-white/70 border-none text-purple-700 hover:scale-110 transition-all duration-300"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Header */}
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-purple-700">Team Sign Up</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mx-auto mt-2"></div>
          </div>
          {/* Error message */}
          {error && (
            <div className="bg-red-50/80 border border-red-200/80 text-red-700 p-3 rounded-xl shadow-sm backdrop-blur-sm">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-red-500"
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
            </div>
          )}
          {/* Team Name */}
          <div>
            <label className="block font-medium text-purple-700 mb-1">
              Team Name
            </label>
            <input
              className="w-full bg-white/60 border border-purple-200/60 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50 focus:ring-opacity-50 rounded-xl px-4 py-2.5 text-purple-800 placeholder-purple-400/70 backdrop-blur-sm transition-all duration-300"
              placeholder="Team Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {/* Manager Name */}
          <div>
            <label className="block font-medium text-purple-700 mb-1">
              Manager Name
            </label>
            <input
              className="w-full bg-white/60 border border-purple-200/60 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50 focus:ring-opacity-50 rounded-xl px-4 py-2.5 text-purple-800 placeholder-purple-400/70 backdrop-blur-sm transition-all duration-300"
              placeholder="Manager Name"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              required
            />
          </div>
          {/* Manager Email */}
          <div>
            <label className="block font-medium text-purple-700 mb-1">
              Manager Email
            </label>
            <input
              className="w-full bg-white/60 border border-purple-200/60 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50 focus:ring-opacity-50 rounded-xl px-4 py-2.5 text-purple-800 placeholder-purple-400/70 backdrop-blur-sm transition-all duration-300"
              placeholder="Manager Email"
              value={managerEmail}
              onChange={(e) => setManagerEmail(e.target.value)}
              required
              type="email"
            />
          </div>
          {/* Team Members */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-medium text-purple-700">
                Team Members
              </label>
              <span className="text-xs text-purple-500 bg-purple-100/50 px-2 py-0.5 rounded-full">
                {members.length} member{members.length !== 1 && "s"}
              </span>
            </div>
            <div className="space-y-3 mb-3 max-h-60 overflow-y-auto pr-1">
              {members.map((member, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white/40 rounded-lg p-2 backdrop-blur-sm border border-white/70"
                >
                  <div className="flex-grow space-y-2">
                    <input
                      className="w-full bg-white/70 border border-purple-100/70 focus:border-purple-400 rounded-lg px-3 py-1.5 text-purple-800 text-sm placeholder-purple-400/70"
                      placeholder="Member Name"
                      value={member.name}
                      onChange={(e) =>
                        handleMemberChange(idx, "name", e.target.value)
                      }
                      required
                    />
                    <input
                      className="w-full bg-white/70 border border-purple-100/70 focus:border-purple-400 rounded-lg px-3 py-1.5 text-purple-800 text-sm placeholder-purple-400/70"
                      placeholder="Member Email"
                      value={member.email}
                      onChange={(e) =>
                        handleMemberChange(idx, "email", e.target.value)
                      }
                      type="email"
                    />
                  </div>
                  {members.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm bg-white/50 hover:bg-red-100/60 border border-red-200/50 text-red-500 hover:text-red-700 rounded-lg hover:scale-105 transition-all duration-300"
                      onClick={() => removeMember(idx)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-sm bg-purple-100/60 hover:bg-purple-200/60 border border-purple-200/60 text-purple-700 hover:text-purple-800 hover:scale-105 transition-all duration-300 rounded-lg"
              onClick={addMember}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Add Member
            </button>{" "}
          </div>
          {/* Submit Button */}
          <button
            className="btn bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-none hover:scale-105 transition-all duration-300 shadow-md w-full rounded-xl py-3"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-t-white/80 border-white/30 rounded-full animate-spin mr-2"></div>
                <span>Processing Payment...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
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
                Pay & Register Team
              </div>
            )}
          </button>{" "}
        </form>
      </div>
    </div>
  );
}
