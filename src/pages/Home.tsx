import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/spinner'

export default function Home() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return
    
    if (!user) {
      navigate('/login')
      return
    }

    switch (user.role) {
      case 'student':
        navigate('/student/dashboard')
        break
      case 'coordinator':
        navigate('/coordinator/dashboard')
        break
      case 'supervisor':
        navigate('/supervisor/dashboard')
        break
      case 'sipp_coordinator':
        navigate('/sipp/dashboard')
        break
      case 'admin':
        navigate('/coordinator/dashboard')
        break
      default:
        navigate('/login')
    }
  }, [user, isLoading, navigate])

  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="h-8 w-8" />
    </div>
  )
}
