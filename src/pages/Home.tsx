import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const HomePage = () => {
  const { user, logout, loading } = useAuth()
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
      console.log('User data from backend:', body)
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

  return (
    <main className='home-container'>
      <section className='home-card'>
        <h1>Welcome {data?.user?.name}!</h1>
        {data?.user?.email ? <p>{data?.user.email}</p> : null}
        <button type='button' onClick={handleLogout}>
          Logout
        </button>
        {error ? <p className='auth-error'>{error}</p> : null}
      </section>
    </main>
  )
}

export default HomePage
