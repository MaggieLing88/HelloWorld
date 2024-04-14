import {
  Box,
  FormControl,
  HStack,
  Image,
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
//import { VITE_BACKEND_URL } from '../config/constants'

enum IDPOptions {
  SGID = 'SGID',
  AzureAD = 'WOG AD',
  SGID_SAML = 'SGID_SAML'
}

export const HomePage = (): JSX.Element => {
  // Radio button state
  const [idp, setIDP] = useState(IDPOptions.SGID)
  const idpFieldId = useMemo(() => 'idp', [])
  // Button loading state
  const [isLoadingOIDC, setIsLoadingOIDC] = useState(false)
  const [isLoadingSAML, setIsLoadingSAML] = useState(false)

  // Button click handler
  const { showBoundary } = useErrorBoundary()
  
  const handleLoginBtnClick = useCallback((value: IDPOptions) => {
    setIDP(value)

    if(value==IDPOptions.SGID_SAML){
      setIsLoadingSAML(true)
      fetch(process.env.VITE_BACKEND_URL+`/api/saml/login`, {
        credentials: 'include',
      })
        .then(async (r) => await r.json())
        .then(({ url }) => {
          window.location.href = url
        })
        .catch((e: unknown) => {
          setIsLoadingSAML(false)
          if (e instanceof Error) {
            showBoundary(e)
          }
          showBoundary(
            new Error(
              'Something went wrong while redirect for IDP authentication.'
            )
          )
        })
    }else{
      setIsLoadingOIDC(true)
      fetch(process.env.VITE_BACKEND_URL+`/api/auth-url?idp=${idp}`, {
        credentials: 'include',
      })
        .then(async (r) => await r.json())
        .then(({ url }) => {
          window.location.href = url
        })
        .catch((e: unknown) => {
          setIsLoadingOIDC(false)
          if (e instanceof Error) {
            showBoundary(e)
          }
          showBoundary(
            new Error(
              'Something went wrong while fetching the authorisation URL.'
            )
          )
        })
    }
  }, [idp, showBoundary])

  //const { user, isLoading: isUserLoading } = useAuth()

  // if (isUserLoading) {
  //   return <Spinner />
  // }
  // if (user !== null) {
  //   return <Navigate to="/logged-in" />
  // }
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
            rightIcon={<Image src={sgidImage} width="22" height="22"/>} isLoading={isLoadingOIDC}>
             Login with SGID using OIDC
            </Button>
            <Button  size='lg'   bg='#8B0000' color={'white'} borderWidth={'medium'}  _hover={{opacity: 0.7}} onClick={() => {handleLoginBtnClick(IDPOptions.SGID_SAML)}}
            rightIcon={<Image src={sgidImage} width="22" height="22"/>} isLoading={isLoadingSAML}>
             Login with SGID using SAML
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
