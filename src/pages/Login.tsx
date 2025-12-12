import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const { user, loading, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [loading, navigate, user])

  const handleLogin = async () => {
    setError(null)
    setSubmitting(true)

    try {
      await loginWithGoogle()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className='auth-container'>
      <section className='auth-card'>
        <h1>Sign in</h1>
        <p>Use your Google account to continue.</p>
        <button type='button' onClick={handleLogin} disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in with Google'}
        </button>
        {error ? <p className='auth-error'>{error}</p> : null}
      </section>
    </main>
  )
}

export default LoginPage
