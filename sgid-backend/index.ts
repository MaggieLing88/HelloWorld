import express, { Router } from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import crypto from 'crypto'
import cookieParser from 'cookie-parser'
import open from 'open'
import { SgidClient } from './src/SgidClient'
import { generatePkcePair } from './src/generators'
import path from 'path'

dotenv.config()

const PORT = String(process.env.APP_PORT)
const redirectUri = String(
  process.env.SGID_REDIRECT_URI ?? `${String(process.env.VITE_BACKEND_URL)}/api/redirect`,
)
const frontendHost = String(
  process.env.SGID_FRONTEND_HOST ?? String(process.env.VITE_BACKEND_URL)
)

const sgid = new SgidClient({
  clientId: String(process.env.CLIENT_ID),
  clientSecret: String(process.env.CLIENT_SECRET),
  redirectUri
})

const app = express()

const apiRouter = Router()

const SESSION_COOKIE_NAME = 'connectorAppSession'
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
}

type SessionData = Record<
  string,
  | {
      nonce?: string
      // Store state as search params to easily stringify key-value pairs
      state?: URLSearchParams
      accessToken?: string
      codeVerifier?: string
      sub?: string
    }
  | undefined
>

/**
 * In-memory store for session data.
 * In a real application, this would be a database.
 */ 
const sessionData: SessionData = {}

var whitelist = [frontendHost, String(process.env.KEYCLOAK_URL)]
var corsOptions = {
  credentials: true,
  origin: whitelist
}
 app.use(
   cors(corsOptions)
 )

apiRouter.get('/auth-url',(req, res) => {
  const idpSelection = String(req.query.idp)
  const sessionId = crypto.randomUUID()
  // Use search params to store state so other key-value pairs
  // can be added easily
  const state = new URLSearchParams({
    idp: idpSelection,
  })

  // Generate a PKCE pair
  const { codeChallenge, codeVerifier } = generatePkcePair()

  const { url, nonce } = sgid.authorizationUrl({
    // We pass the user's ice cream preference as the state,
    // so after they log in, we can display it together with the
    // other user info.
    state: state.toString(),
    codeChallenge,
    // Scopes that all sgID relying parties can access by default
    scope: ['openid', 'profile', 'email', 'agency']
  })
  sessionData[sessionId] = {
    state,
    nonce,
   codeVerifier
  }
  return res
    .cookie(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS)
    .json({ url })
})

apiRouter.get('/redirect',async (req, res): Promise<void> => {
  const authCode = String(req.query.code)
  const state = String(req.query.state)
  const sessionId = String(req.cookies[SESSION_COOKIE_NAME])

  const session = { ...sessionData[sessionId] }
  // Validate that the state matches what we passed to sgID for this session
   if (session?.state?.toString() !== state) {
    res.redirect(`${frontendHost}/error`)
     return
  }

  // Validate that the code verifier exists for this session
    if (session?.codeVerifier === undefined) {
      res.redirect(`${frontendHost}/error`)
       return
     }

  // Exchange the authorization code and code verifier for the access token
  const { codeVerifier, nonce } = session
  const { accessToken, sub } = await sgid.callback({
    code: authCode,
    nonce,
    codeVerifier
  })

  session.accessToken = accessToken
  session.sub = sub
  sessionData[sessionId] = session

  // Successful login, redirect to logged in state
  res.redirect(`${frontendHost}/logged-in`)
})

apiRouter.get('/userinfo', async (req, res) => {
  const sessionId = String(req.cookies[SESSION_COOKIE_NAME])

  // Retrieve the access token and sub
  const session = sessionData[sessionId]
  const accessToken = session?.accessToken
  const sub = session?.sub

  // User is not authenticated
  if (session === undefined || accessToken === undefined || sub === undefined) {
    return res.sendStatus(401)
  }
  const userinfo = await sgid.userinfo({
    accessToken,
    sub
  })

  // Add selected idp to userinfo
  userinfo.data.idp = session.state?.get('idp') ?? 'None'
  return res.json(userinfo)
})

apiRouter.get('/logout', async (req, res) => {
  const sessionId = String(req.cookies[SESSION_COOKIE_NAME])
  delete sessionData[sessionId]
  return res
    .clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS)
    .sendStatus(200)
})


const initServer = async (): Promise<void> => {
  try {
    app.use(cookieParser())
    app.use('/api', apiRouter)
    app.use(express.static(path.join(__dirname, 'build')));

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    })
  } catch (error) {
    console.error(
      'Something went wrong while starting the server. Please restart the server.',
    )
    console.error(error)
  }
}

void initServer()
