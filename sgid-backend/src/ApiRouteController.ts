import { Logger } from './Logger'
import { Router, Request, Response } from 'express'
import * as Errors from './error'
import  SgidClient from './SgidClient'
import { generatePkcePair } from './generators'

const log = Logger.getLogger()
const apiRouter = Router()

const redirectUri = String(process.env.VITE_BACKEND_URL)+'/api/redirect'
const frontendHost = String(process.env.VITE_BACKEND_URL)

const sgid = new SgidClient({
  clientId: String(process.env.CLIENT_ID),
  clientSecret: String(process.env.CLIENT_SECRET),
  redirectUri
})

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
      idToken?: string //for logout purpose
    }
  | undefined
>

/**
 * In-memory store for session data.
 * In a real application, this would be a database.
 */ 
const sessionData: SessionData = {}

apiRouter.get('/health/check', async (req: Request, res: Response) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  }
  try {
    res.status(200).send(healthcheck)
  } catch (err: any) {
    healthcheck.message = err
    log.error(`${err.status || 503} - ${res.statusMessage} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(err.status || 503).send()
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
  try{
     const { url, nonce } = sgid.authorizationUrl({
    // We pass the user's idp preference as the state,
    // so after they log in, we can display it together with the
    // other user info.
    state: state.toString(),
    codeChallenge,
    // Scopes that all sgID relying parties can access by default
    scope: ['openid', 'profile', 'email']
     })
    sessionData[sessionId] = {
     state,
     nonce,
    codeVerifier
   }
    return res
     .cookie(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS)
     .json({ url })
  }catch (err: any){
      log.error("Failed in /auth-url. Error:"+err.message)
      res.redirect(`${frontendHost}/error`)
   return
  }
})

apiRouter.get('/redirect',async (req, res): Promise<void> => {
  const authCode = String(req.query.code)
  const state = String(req.query.state)
  const sessionId = String(req.cookies[SESSION_COOKIE_NAME])

  log.info("redirect back with state:"+state)

  const session = { ...sessionData[sessionId] }
  log.debug("session state:"+session.state)
  log.debug("session verifier:"+session.codeVerifier)

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
  const { accessToken, sub, idToken } = await sgid.callback({
    redirectUri: redirectUri,
    code: authCode,
    nonce : nonce,
    codeVerifier : codeVerifier
  })

  session.accessToken = accessToken
  session.sub = sub
  session.idToken = idToken
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

  try{
      const userinfo = await sgid.userinfo({
       accessToken,
       sub
     })
 
      // Add selected idp to userinfo
      userinfo.data.idp = session.state?.get('idp') ?? 'None'
    
     return res.json(userinfo)

  }catch (err: any){
      log.error("Failed in /userinfo. Error:"+err.message)
       res.redirect(`${frontendHost}/error`)
    return
  }
})

apiRouter.get('/logout', async (req, res, next) => {
  const sessionId = String(req.cookies[SESSION_COOKIE_NAME])
  delete sessionData[sessionId]
  return res
    .clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS)
    .sendStatus(200)
})


export default apiRouter