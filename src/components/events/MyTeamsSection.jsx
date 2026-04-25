import MyTeamRow from "../teams/MyTeamRow";
import { Button, GlassCard } from "../ui";

export default function MyTeamsSection({ teams }) {
  if (!teams?.length) return null;

  return (
    <GlassCard className="rounded-[1.75rem] shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-xl text-base-content">Teams ({teams.length})</h2>

        <div className="space-y-3 mt-2">
          {teams.map((team) => (
            <MyTeamRow key={team._id} team={team} readOnly />
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center flex-shrink-0 shadow-md">
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-base-content text-sm">Need to make changes?</p>
              <p className="text-xs text-base-content/60">
                Edit team details or complete pending payments from your profile.
              </p>
            </div>
          </div>
          <Button to="/profile" variant="primary" className="flex-shrink-0">
            Manage Teams
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
