import express, { Router } from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import crypto from 'crypto'
import cookieParser from 'cookie-parser'
import open from 'open'
import { SgidClient } from './src/SgidClient'
import { generatePkcePair } from './src/generators'
import path from 'path'
import {Logger } from './src/Logger'
import morgan from 'morgan'
import { Request, Response, NextFunction } from 'express'

dotenv.config()

const log = Logger.getLogger()
const PORT = String(process.env.APP_PORT)
const redirectUri = String(process.env.VITE_BACKEND_URL)+'/api/redirect'
const frontendHost = String(process.env.VITE_BACKEND_URL)

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
  origin: '*'
}
 app.use(
   cors(corsOptions)
 )

 const stream = {
  // Use the http severity
  write: (message: string) => Logger.getLogger().http(message)
}
const morganMiddleware = morgan(
  // Define message format string
  ":remote-addr :method :url HTTP/:http-version :status :res[content-length] - :response-time ms",
  { stream,
    //remove http log for health check
    skip: (req: Request, res: Response) => {return req.originalUrl.startsWith('/api/health/check')} } 
)
app.use(morganMiddleware)

apiRouter.get('/health/check', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  }
  try {
    res.status(200).send(healthcheck)
  } catch (err: any) {
    healthcheck.message = err
    log.error("health check failed. "+ healthcheck.message)
    res.status(err.status || 503).send(`${res.statusMessage} - ${err.message}`)
  }
})

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

  log.info("red code:"+authCode)
  log.info("red state:"+state)
  const session = { ...sessionData[sessionId] }
  log.info("session nonce"+session.nonce)
  log.info("session code verifier:"+session.codeVerifier)
  log.info("session accesstoken:"+session.accessToken)
  log.info("session sub:"+session.sub)
  log.info("session state"+session.state)
  // Validate that the state matches what we passed to sgID for this session
   if (session?.state?.toString() !== state) {
    log.error("Failed to get session state in memory store.")
    res.redirect(`${frontendHost}/error`)
     return
  }

  // Validate that the code verifier exists for this session
    if (session?.codeVerifier === undefined) {
      log.error("Failed to get code verifier in memory store.")
      res.redirect(`${frontendHost}/error`)
       return
     }
try{
  // Exchange the authorization code and code verifier for the access token
  const { codeVerifier, nonce } = session
  const { accessToken, sub } = await sgid.callback({
    code: authCode,
    nonce: nonce,
    codeVerifier: codeVerifier
  })

  session.accessToken = accessToken
  session.sub = sub
  sessionData[sessionId] = session
  }catch (err: any){
    log.error("Failed in /redirect. Error:"+err.message)
    res.redirect(`${frontendHost}/error`)
    return
  }

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

    // This code makes sure that any request that does not matches a static file
    // in the build folder, will just serve index.html. Client side routing is
    // going to make sure that the correct content will be loaded.
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
          next();
      } else {
          res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
          res.header('Expires', '-1');
          res.header('Pragma', 'no-cache');
          res.sendFile(path.join(__dirname, 'build', 'index.html'));
      }
    });
    
    app.listen(PORT, () => {
      log.info(`Server listening on port ${PORT}`)
    })
  } catch (error) {
    log.error(
      'Something went wrong while starting the server. Please restart the server.',
    )
    console.error(error)
  }
}

void initServer()
