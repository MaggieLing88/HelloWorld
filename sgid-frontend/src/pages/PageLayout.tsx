import { Flex } from '@chakra-ui/react'
import { COLOURS } from '../theme/colours'
import { Outlet } from 'react-router-dom'
import { useIsMobile } from '@opengovsg/design-system-react'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorPage } from './Error'
import backgroundImage from '../assets/skyline.png'

export const PageLayout = (): JSX.Element => {
  const isMobile = useIsMobile()
  return (
    <Flex
      minH={'100%'}
      justifyContent={'center'}
      alignItems={'center'}
      px="8px"
      py="16px"
      bgColor={COLOURS.SECONDARY}
      bgImage={backgroundImage}
      bgPosition={'center bottom'}
      bgSize={'contain'}
      bgRepeat={'no-repeat'}
    >
      <Flex
        justifyContent={'center'}
        alignItems={'center'}
        bgColor={'white'}
        flex={1}
        maxW="500px"
        minH="250px"
        borderRadius={'8px'}
        px={isMobile ? '8px' : '32px'}
        py={isMobile ? '32px' : '48px'}
      >
        <ErrorBoundary FallbackComponent={ErrorPage}>
          <Outlet />
        </ErrorBoundary>
      </Flex>
    </Flex>
  )
}
