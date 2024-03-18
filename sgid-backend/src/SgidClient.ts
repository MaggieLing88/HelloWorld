import { Client, Issuer } from 'openid-client'

import {
  REALM_NAME,
  DEFAULT_SCOPE,
  DEFAULT_SGID_CODE_CHALLENGE_METHOD,
  SGID_AUTH_METHOD,
  SGID_SIGNING_ALG,
  SGID_SUPPORTED_GRANT_TYPES
} from './constants'
import * as Errors from './error'
import { generateNonce } from './generators'
import {
  AuthorizationUrlParams,
  AuthorizationUrlReturn,
  CallbackParams,
  CallbackReturn,
  ParsedSgidDataValue,
  SgidClientParams,
  UserInfoParams,
  UserInfoReturn,
} from './types'

export class SgidClient {
  private sgID: Client

  /**
   * Initialises an SgidClient instance.
   * @param params Constructor arguments
   * @param params.clientId Client ID provided during client registration
   * @param params.clientSecret Client secret provided during client registration
   * @param params.privateKey Client private key provided during client registration
   * @param params.redirectUri Redirection URI for user to return to your application
   * after login. If not provided in the constructor, this must be provided to the
   * authorizationUrl and callback functions.
   * @param params.hostname Hostname of OpenID provider (sgID).
   */
  constructor({
    clientId,
    clientSecret,
    redirectUri,
    hostname = String(process.env.KEYCLOAK_URL)
  }: SgidClientParams) {

    const issuer = new URL(hostname).origin + `/realms/${REALM_NAME}`
    const { Client } = new Issuer({
      issuer,
       authorization_endpoint: `${issuer}/protocol/openid-connect/auth`,
       token_endpoint: `${issuer}/protocol/openid-connect/token`,
       userinfo_endpoint: `${issuer}/protocol/openid-connect/userinfo`,
        jwks_uri:  `${issuer}/protocol/openid-connect/certs`
    })

    this.sgID = new Client({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: redirectUri ? [redirectUri] : undefined,
      id_token_signed_response_alg: SGID_SIGNING_ALG,
      response_types: SGID_SUPPORTED_GRANT_TYPES,
      token_endpoint_auth_method: SGID_AUTH_METHOD,
    })

  }

  /**
   * Generates authorization url to redirect end-user to sgID login page.
   * @param state A string which will be passed back to your application once
   * the end-user logs in. You can also use this to track per-request state.
   * @param scope Array or space-separated scopes. 'openid' must be provided as a
   * scope. Defaults to 'myinfo.name openid'.
   * @param nonce Unique nonce for this request. If this param is undefined, a nonce
   * is generated and returned. To prevent this behaviour, specify null for this param.
   * @param redirectUri The redirect URI used in the authorization request. If this
   * param is provided, it will be used instead of the redirect URI provided in the
   * SgidClient constructor. If not provided in the constructor, the redirect URI
   * must be provided here.
   * @param codeChallenge The code challenge from the code verifier used for PKCE enhancement
   */
  authorizationUrl({
    state,
    scope = DEFAULT_SCOPE,
    nonce = generateNonce(),
    redirectUri = this.getFirstRedirectUri(),
     codeChallenge
  }: AuthorizationUrlParams): AuthorizationUrlReturn {
    const url = this.sgID.authorizationUrl({
      scope: typeof scope === 'string' ? scope : scope.join(' '),
      nonce: nonce ?? undefined,
      state,
      redirect_uri: redirectUri,
     code_challenge: codeChallenge,
      code_challenge_method: DEFAULT_SGID_CODE_CHALLENGE_METHOD,
      kc_idp_hint:`SGID`
    })

    const result: { url: string; nonce?: string } = { url }
    if (nonce) {
      result.nonce = nonce
    }
    return result
  }

  private getFirstRedirectUri(): string {
    if (
      !this.sgID.metadata.redirect_uris ||
      this.sgID.metadata.redirect_uris.length === 0
    ) {
      throw new Error(Errors.MISSING_REDIRECT_URI_ERROR)
    }
    return this.sgID.metadata.redirect_uris[0]
  }

  /**
   * Exchanges authorization code for access token.
   * @param code The authorization code received from the authorization server
   * @param nonce Nonce passed to authorizationUrl for this request. Specify null
   * if no nonce was passed to authorizationUrl.
   * @param redirectUri The redirect URI used in the authorization request. Defaults to the one
   * passed to the SgidClient constructor.
   * @param codeVerifier The code verifier that was used to generate the code challenge that was passed in `authorizationUrl`
   * @param state 
   * @returns The sub (subject identifier claim) of the user and access token. The subject
   * identifier claim is the end-user's unique ID.
   */
  async callback({
    code,
    nonce = null,
    redirectUri = this.getFirstRedirectUri(),
    codeVerifier,
    state = null
  }: CallbackParams): Promise<CallbackReturn> {
    const tokenSet = await this.sgID.callback(
      redirectUri,
      { code },
      { nonce: nonce ?? undefined , code_verifier: codeVerifier },
    )
    const { sub } = tokenSet.claims()

    const { access_token: accessToken, id_token: idToken} = tokenSet

    // Note that this falsey check for the id token will never be run
    // because the nodejs openid-client library already does it for us
    // Doing a check here just for type safety
    if (!idToken) throw new Error(Errors.NO_ID_TOKEN_ERROR)
    if (!sub) {
      throw new Error(Errors.NO_SUB_ERROR)
    }
    if (!accessToken) {
      throw new Error(Errors.NO_ACCESS_TOKEN_ERROR)
    }
    return { sub, accessToken, idToken }
  }


  /**
   * Retrieves verified user info and decrypts it with your private key.
   * @param sub The sub returned from the callback function
   * @param accessToken The access token returned from the callback function
   * @returns The sub of the end-user and the end-user's verified data. The sub
   * returned is the same as the one passed in the params.
   */
  async userinfo({
    sub,
    accessToken,
  }: UserInfoParams): Promise<UserInfoReturn> {

    
    const data:Record <string, string> = await this.sgID.userinfo(accessToken)
    if (data) {
       if (sub !== data['sub']) {
        throw new Error(Errors.SUB_MISMATCH_ERROR)
       }
  
    return { data}
    }
    /**
     * When the scope requested is just `openid`, the `key` and `data` attributes are undefined
     * because no data fields are requested. In this case, data is just an empty object.
     */
    return {data: {} }
  }
}
