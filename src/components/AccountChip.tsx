import { getLocalSession } from '../lib/auth'

/** Placeholder for login / leaderboard entry points. */
export const AccountChip = () => {
  const session = getLocalSession()
  return (
    <div className="account-chip">
      {session ? (
        <span>{session.displayName}</span>
      ) : (
        <button type="button" disabled title="Coming soon">
          Log in
        </button>
      )}
    </div>
  )
}
