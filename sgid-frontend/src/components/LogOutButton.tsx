import { Button } from '@opengovsg/design-system-react'
import { useCallback, useState } from 'react'
import { COLOURS } from '../theme/colours'
import { useErrorBoundary } from 'react-error-boundary'
import { useNavigate } from 'react-router-dom'

export const LogOutButton = ({
  
  buttonText = 'Log out and try again',
}: {
  buttonText?: string
}): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false)
  const { showBoundary } = useErrorBoundary()
  const navigate = useNavigate()
  const backendURL= import.meta.env.VITE_BACKEND_URL
  const handleLogout = useCallback(() => {
    setIsLoading(true)
    fetch(backendURL+'/api/logout', {
      credentials: 'include',
    })
      .then(() => {
        navigate('/')
      })
      .catch((e: unknown) => {
        setIsLoading(false)
        if (e instanceof Error) {
          showBoundary(e)
        }
        showBoundary(new Error('Something went wrong while logging out.'))
      })
  }, [])
  return (
    <Button
      onClick={handleLogout}
      bgColor={COLOURS.PRIMARY}
      color="white"
      isLoading={isLoading}
    >
      {buttonText}
    </Button>
  )
}
