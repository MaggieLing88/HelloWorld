import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  styles: {
    global: {
      '*': {
        margin: 0,
      },
      html: {
        height: '100%',
      },
      'th, td': {
        padding: 0,
      },
      body: {
        height: '100%',
        fontFeatureSettings: "'tnum' on, 'cv05' on",
        WebkitFontSmoothing: 'antialiased',
      },
      '#root, #__next': {
        isolation: 'isolate',
        height: 'inherit',
      },
    },
  },
  fonts: {
    heading: `'Inter var', sans-serif`,
    body: `'Inter var', sans-serif`,
  },
})
