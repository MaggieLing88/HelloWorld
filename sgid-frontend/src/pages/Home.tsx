import {
  Box,
  FormControl,
  HStack,
  Image,
  Spinner,
  Stack,
  VStack,
  ButtonGroup,
  Text, 
  Button
} from '@chakra-ui/react'
import { useCallback, useMemo, useState } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import sgidImage from '../assets/sgid.png'
import aadImage from '../assets/aad.png'
import govTech from '../assets/logo_govtech.gif'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'
//import { VITE_BACKEND_URL } from '../config/constants'

enum IDPOptions {
  SGID = 'SGID',
  AzureAD = 'WOG AD',
}

export const HomePage = (): JSX.Element => {
  // Radio button state
  const [idp, setIDP] = useState(IDPOptions.SGID)
  const idpFieldId = useMemo(() => 'idp', [])
  // Button loading state
  const [isLoading, setIsLoading] = useState(false)

  // Button click handler
  const { showBoundary } = useErrorBoundary()
  
  const handleLoginBtnClick = useCallback((value: IDPOptions) => {
    setIDP(value)
    setIsLoading(true)
    fetch(process.env.VITE_BACKEND_URL+`/api/auth-url?idp=${idp}`, {
      credentials: 'include',
    })
      .then(async (r) => await r.json())
      .then(({ url }) => {
        window.location.href = url
      })
      .catch((e: unknown) => {
        setIsLoading(false)
        if (e instanceof Error) {
          showBoundary(e)
        }
        showBoundary(
          new Error(
            'Something went wrong while fetching the authorisation URL.'
          )
        )
      })
  }, [idp, showBoundary])

  const { user, isLoading: isUserLoading } = useAuth()

  if (isUserLoading) {
    return <Spinner />
  }
  if (user !== null) {
    return <Navigate to="/logged-in" />
  }
  return (
    <VStack spacing="48px"> 
      <HStack spacing="48px" justifyContent={'center'}>
        <Box w="100%" marginLeft={'10'}>
          <p><Image src={govTech} width="100" height="100"></Image></p>
        </Box>
      </HStack>
      <HStack justifyContent={'center'}>
      <FormControl id={idpFieldId} >
         <ButtonGroup>
          
          <Stack spacing="0.5rem" direction='column'>  
            <Button  size='lg'   bg='#8B0000' color={'white'} borderWidth={'medium'}  _hover={{opacity: 0.7}} onClick={() => {handleLoginBtnClick(IDPOptions.SGID)}}
            rightIcon={<Image src={sgidImage} width="22" height="22"/>} isLoading={isLoading}>
             Login with SGID
            </Button>
            <Button  size='lg' bg='#23395d' color={'white'}  borderWidth={'medium'}  _hover={{opacity: 0.7}}
            rightIcon={<Image src={aadImage} width="30" height="30"/>}>
             Login with WOG AD
            </Button>   
          </Stack>
        </ButtonGroup>
      </FormControl>
      </HStack>
      <HStack justifyContent={'center'} borderWidth='2px' backgroundColor='#f5f5f5' >
      <Box w="85%" >
      <Text fontSize='sm'>This application is for demo purposes ONLY. It is meant to illustrate how the agency's application makes use of Giber for federated authentication.</Text> 
        </Box>
      
        </HStack>
    </VStack>
  )
}
