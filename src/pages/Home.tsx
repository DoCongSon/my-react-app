import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logEvent } from '../utils/analytics'

const HomePage = () => {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading || !user) return
    ;(async () => {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Unauthorized')
      const body = await res.json()
      setData(body)
    })().catch(console.error)
  }, [loading, user])

  const handleLogout = async () => {
    setError(null)

    try {
      await logout()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout.')
    }
  }

  const handleOpenAnalyticsLab = () => {
    logEvent('Navigation', 'Open Analytics Lab', 'home-cta')
    navigate('/analytics-test')
  }

  return (
    <main className='home-container modern-home'>
      <section className='home-card modern-home-card'>
        <div className='home-header'>
          <div>
            <p className='home-kicker'>Hybrid Auth Dashboard</p>
            <h1>Welcome back, {data?.user?.name ?? user?.displayName ?? 'there'} 👋</h1>
            <p className='home-subtitle'>Your Firebase session is active. Choose an action to keep the momentum.</p>
          </div>
          <div className='home-profile-chip'>
            <span className='chip-avatar'>{(data?.user?.name ?? user?.displayName ?? 'U')[0]}</span>
            <div>
              <p className='chip-name'>{data?.user?.name ?? user?.displayName ?? 'Unknown user'}</p>
              <p className='chip-email'>{data?.user?.email ?? user?.email ?? 'No email on file'}</p>
            </div>
          </div>
        </div>

        <div className='home-actions-grid single-action'>
          <button type='button' className='action-card' onClick={handleOpenAnalyticsLab}>
            <span className='action-icon'>📈</span>
            <div>
              <h2>Open Analytics Lab</h2>
              <p>Trigger CTA events and validate GA4 instrumentation across pricing tiers.</p>
            </div>
          </button>
        </div>

        <div className='home-footer'>
          <p className='home-session-label'>Session status</p>
          <div className='home-session-card'>
            <div>
              <p className='home-session-id'>UID: {user?.uid ?? 'Unknown'}</p>
              <p className='home-session-meta'>Firebase user ID currently attached to the backend session cookie.</p>
            </div>
            <button type='button' className='logout-button' onClick={handleLogout}>
              Logout
            </button>
          </div>
          {error ? <p className='auth-error'>{error}</p> : null}
        </div>
      </section>
    </main>
  )
}

export default HomePage
