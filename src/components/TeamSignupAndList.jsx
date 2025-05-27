import { useState, useEffect } from "react";

export function TeamSignupForm({ eventId, managerId, onSuccess }) {
  const [name, setName] = useState("");
  const [members, setMembers] = useState([{ name: "", email: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [team, setTeam] = useState(null); // Store created team

  const handleMemberChange = (idx, field, value) => {
    setMembers((members) => {
      const updated = [...members];
      updated[idx][field] = value;
      return updated;
    });
  };

  const addMember = () =>
    setMembers((members) => [...members, { name: "", email: "" }]);
  const removeMember = (idx) =>
    setMembers((members) => members.filter((_, i) => i !== idx));

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
          body: JSON.stringify({ name, members, manager: managerId }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign up team");
      setTeam(data.team); // Save the created team
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Handler for payment
  const handlePayTeamFee = async () => {
    if (!team) return;
    setLoading(true);
    setError("");
    try {
      // Call backend to get payment URL
      const res = await fetch(
        `${import.meta.env.VITE_DEV_URI}teams/${team._id}/pay`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok || !data.link)
        throw new Error(data.error || "Payment failed");
      window.location.href = data.link; // Redirect to payment
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold">Sign Up Your Team</h2>
      {error && <div className="text-red-500">{error}</div>}
      <input
        className="input input-bordered w-full"
        placeholder="Team Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div>
        <label className="block font-semibold mb-1">Team Members</label>
        {members.map((member, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              className="input input-bordered"
              placeholder="Name"
              value={member.name}
              onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
              required
            />
            <input
              className="input input-bordered"
              placeholder="Email"
              value={member.email}
              onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
            />
            {members.length > 1 && (
              <button
                type="button"
                className="btn btn-error"
                onClick={() => removeMember(idx)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addMember}>
          Add Member
        </button>
      </div>
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Signing Up..." : "Sign Up Team"}
      </button>
      {team && !team.paid && (
        <button
          type="button"
          className="btn btn-success ml-2"
          onClick={handlePayTeamFee}
          disabled={loading}
        >
          Pay Team Fee
        </button>
      )}
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}

export function TeamList({ eventId }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_DEV_URI}teams/event/${eventId}/teams`)
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div>Loading teams...</div>;
  if (!teams.length) return <div>No teams have signed up yet.</div>;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-2">Teams Signed Up</h2>
      <ul className="list-disc pl-6">
        {teams.map((team) => (
          <li key={team._id}>
            <span className="font-semibold">{team.name}</span>
            {team.members && team.members.length > 0 && (
              <ul className="list-circle pl-4 text-sm">
                {team.members.map((m, i) => (
                  <li key={i}>
                    {m.name}
                    {m.email && ` (${m.email})`}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
