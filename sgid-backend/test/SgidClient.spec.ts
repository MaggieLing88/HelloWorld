
import SgidClient from '../src/SgidClient'
import {
  MOCK_ACCESS_TOKEN,
  MOCK_AUTH_ENDPOINT,
  MOCK_CLIENT_ID,
  MOCK_CLIENT_SECRET,
  MOCK_USERINFO,
  MOCK_HOSTNAME,
  MOCK_REDIRECT_URI,
  MOCK_SUB
} from './mock/constant'
import * as Errors from '../src/error'

/**
 * Constants are redefined instead of being imported from "/src" so as to ensure any changes to either (but not both) would cause tests to fail.
 * This is to ensure that any changes we make to these are deliberate and not accidental.
 */
const DEFAULT_SCOPE = 'openid email profile'
const DEFAULT_SGID_CODE_CHALLENGE_METHOD = 'S256'
const DEFAULT_RESPONSE_TYPE = 'code'

describe('SgidClient', () => {
  let client: SgidClient

  beforeAll(() => {
    client = new SgidClient({
      clientId: MOCK_CLIENT_ID,
      clientSecret: MOCK_CLIENT_SECRET,
      redirectUri: MOCK_REDIRECT_URI,
      hostname: MOCK_HOSTNAME,
    })
  })

  describe('authorizationUrl', () => {
    it('should generate authorisation URL correctly when state and codeChallenge are provided', () => {
      const mockState = 'mockState'
      const mockCodeChallenge = 'mockCodeChallenge'

      const { url, nonce } = client.authorizationUrl({
        state: mockState,
        codeChallenge: mockCodeChallenge,
      })

      const actual = new URL(url)
      // Count number of search params
      let actualNumSearchParams = 0
      actual.searchParams.forEach(() => actualNumSearchParams++)
      const expected = new URL(MOCK_AUTH_ENDPOINT)
      expect(actual.host).toBe(expected.host)
      expect(actual.pathname).toBe(expected.pathname)
      expect(actual.searchParams.get('client_id')).toBe(MOCK_CLIENT_ID)
      expect(actual.searchParams.get('scope')).toBe(DEFAULT_SCOPE)
      expect(actual.searchParams.get('response_type')).toBe(
        DEFAULT_RESPONSE_TYPE,
      )
      expect(actual.searchParams.get('redirect_uri')).toBe(MOCK_REDIRECT_URI)
      expect(actual.searchParams.get('nonce')).toBe(nonce)
      expect(actual.searchParams.get('state')).toBe(mockState)
      expect(actual.searchParams.get('code_challenge')).toBe(mockCodeChallenge)
      expect(actual.searchParams.get('code_challenge_method')).toBe(
        DEFAULT_SGID_CODE_CHALLENGE_METHOD,
      )
      // Client ID, scope, response_type, redirect_uri, nonce, state, code_challenge, code_challenge_method
      expect(actualNumSearchParams).toBe(8)
    })

    it('should generate authorisation URL correctly when state, codeChallenge, and scope is provided as a string', () => {
      const mockState = 'mockState'
      const mockScope = 'mockScope'
      const mockCodeChallenge = 'mockCodeChallenge'

      const { url, nonce } = client.authorizationUrl({
        state: mockState,
        scope: mockScope,
        codeChallenge: mockCodeChallenge,
      })

      const actual = new URL(url)
      // Count number of search params
      let actualNumSearchParams = 0
      actual.searchParams.forEach(() => actualNumSearchParams++)
      const expected = new URL(MOCK_AUTH_ENDPOINT)
      expect(actual.host).toBe(expected.host)
      expect(actual.pathname).toBe(expected.pathname)
      expect(actual.searchParams.get('client_id')).toBe(MOCK_CLIENT_ID)
      // Important check is here
      expect(actual.searchParams.get('scope')).toBe(mockScope)
      expect(actual.searchParams.get('response_type')).toBe(
        DEFAULT_RESPONSE_TYPE,
      )
      expect(actual.searchParams.get('redirect_uri')).toBe(MOCK_REDIRECT_URI)
      expect(actual.searchParams.get('nonce')).toBe(nonce)
      expect(actual.searchParams.get('state')).toBe(mockState)
      expect(actual.searchParams.get('code_challenge')).toBe(mockCodeChallenge)
      expect(actual.searchParams.get('code_challenge_method')).toBe(
        DEFAULT_SGID_CODE_CHALLENGE_METHOD,
      )
      // Client ID, scope, response_type, redirect_uri, nonce, state, code_challenge, code_challenge_method
      expect(actualNumSearchParams).toBe(8)
    })

    it('should generate authorisation URL correctly when state, codeChallenge, and scope is provided as a string array', () => {
      const mockState = 'mockState'
      const mockScopes = ['mockScope1', 'mockScope2', 'mockScope3']
      const mockCodeChallenge = 'mockCodeChallenge'

      const { url, nonce } = client.authorizationUrl({
        state: mockState,
        scope: mockScopes,
        codeChallenge: mockCodeChallenge,
      })

      const actual = new URL(url)
      // Count number of search params
      let actualNumSearchParams = 0
      actual.searchParams.forEach(() => actualNumSearchParams++)
      const expected = new URL(MOCK_AUTH_ENDPOINT)
      expect(actual.host).toBe(expected.host)
      expect(actual.pathname).toBe(expected.pathname)
      expect(actual.searchParams.get('client_id')).toBe(MOCK_CLIENT_ID)
      // Important check is here
      expect(actual.searchParams.get('scope')).toBe(mockScopes.join(' '))
      expect(actual.searchParams.get('response_type')).toBe(
        DEFAULT_RESPONSE_TYPE,
      )
      expect(actual.searchParams.get('redirect_uri')).toBe(MOCK_REDIRECT_URI)
      expect(actual.searchParams.get('nonce')).toBe(nonce)
      expect(actual.searchParams.get('state')).toBe(mockState)
      expect(actual.searchParams.get('code_challenge')).toBe(mockCodeChallenge)
      expect(actual.searchParams.get('code_challenge_method')).toBe(
        DEFAULT_SGID_CODE_CHALLENGE_METHOD,
      )
      // Client ID, scope, response_type, redirect_uri, nonce, state, code_challenge, code_challenge_method
      expect(actualNumSearchParams).toBe(8)
    })

    it('should generate authorisation URL correctly when state, codeChallenge, and nonce is specified', () => {
      const mockState = 'mockState'
      const mockNonce = 'mockNonce'
      const mockCodeChallenge = 'mockCodeChallenge'

      const { url, nonce } = client.authorizationUrl({
        state: mockState,
        nonce: mockNonce,
        codeChallenge: mockCodeChallenge,
      })

      const actual = new URL(url)
      // Count number of search params
      let actualNumSearchParams = 0
      actual.searchParams.forEach(() => actualNumSearchParams++)
      const expected = new URL(MOCK_AUTH_ENDPOINT)
      expect(actual.host).toBe(expected.host)
      expect(actual.pathname).toBe(expected.pathname)
      expect(actual.searchParams.get('client_id')).toBe(MOCK_CLIENT_ID)
      expect(actual.searchParams.get('scope')).toBe(DEFAULT_SCOPE)
      expect(actual.searchParams.get('response_type')).toBe(
        DEFAULT_RESPONSE_TYPE,
      )
      expect(actual.searchParams.get('redirect_uri')).toBe(MOCK_REDIRECT_URI)
      // Important check is here
      expect(actual.searchParams.get('nonce')).toBe(mockNonce)
      expect(nonce).toBe(mockNonce)
      expect(actual.searchParams.get('state')).toBe(mockState)
      expect(actual.searchParams.get('code_challenge')).toBe(mockCodeChallenge)
      expect(actual.searchParams.get('code_challenge_method')).toBe(
        DEFAULT_SGID_CODE_CHALLENGE_METHOD,
      )
      // Client ID, scope, response_type, redirect_uri, nonce, state, code_challenge, code_challenge_method
      expect(actualNumSearchParams).toBe(8)
    })

    it('should generate authorisation URL correctly when state and codeChallenge is provided and nonce is null', () => {
      const mockState = 'mockState'
      const mockCodeChallenge = 'mockCodeChallenge'

      const { url, nonce } = client.authorizationUrl({
        state: mockState,
        nonce: null,
        codeChallenge: mockCodeChallenge,
      })

      const actual = new URL(url)
      // Count number of search params
      let actualNumSearchParams = 0
      actual.searchParams.forEach(() => actualNumSearchParams++)
      const expected = new URL(MOCK_AUTH_ENDPOINT)
      expect(actual.host).toBe(expected.host)
      expect(actual.pathname).toBe(expected.pathname)
      expect(actual.searchParams.get('client_id')).toBe(MOCK_CLIENT_ID)
      expect(actual.searchParams.get('scope')).toBe(DEFAULT_SCOPE)
      expect(actual.searchParams.get('response_type')).toBe(
        DEFAULT_RESPONSE_TYPE,
      )
      expect(actual.searchParams.get('redirect_uri')).toBe(MOCK_REDIRECT_URI)
      // Important check is here
      expect(actual.searchParams.get('nonce')).toBeNull()
      expect(nonce).toBeUndefined()
      expect(actual.searchParams.get('state')).toBe(mockState)
      expect(actual.searchParams.get('code_challenge')).toBe(mockCodeChallenge)
      expect(actual.searchParams.get('code_challenge_method')).toBe(
        DEFAULT_SGID_CODE_CHALLENGE_METHOD,
      )
      // Client ID, scope, response_type, redirect_uri, state, code_challenge, code_challenge_method
      expect(actualNumSearchParams).toBe(7)
    })

    it('should generate authorisation URL correctly when state, codeChallenge, and redirectUri is provided', () => {
      const mockState = 'mockState'
      const mockRedirectUri = 'https://mockRedirectUri.com'
      const mockCodeChallenge = 'mockCodeChallenge'

      const { url, nonce } = client.authorizationUrl({
        state: mockState,
        redirectUri: mockRedirectUri,
        codeChallenge: mockCodeChallenge,
      })

      const actual = new URL(url)
      // Count number of search params
      let actualNumSearchParams = 0
      actual.searchParams.forEach(() => actualNumSearchParams++)
      const expected = new URL(MOCK_AUTH_ENDPOINT)
      expect(actual.host).toBe(expected.host)
      expect(actual.pathname).toBe(expected.pathname)
      expect(actual.searchParams.get('client_id')).toBe(MOCK_CLIENT_ID)
      expect(actual.searchParams.get('scope')).toBe(DEFAULT_SCOPE)
      expect(actual.searchParams.get('response_type')).toBe(
        DEFAULT_RESPONSE_TYPE,
      )
      // Important check is here
      expect(actual.searchParams.get('redirect_uri')).toBe(mockRedirectUri)
      expect(actual.searchParams.get('nonce')).toBe(nonce)
      expect(actual.searchParams.get('state')).toBe(mockState)
      expect(actual.searchParams.get('code_challenge')).toBe(mockCodeChallenge)
      expect(actual.searchParams.get('code_challenge_method')).toBe(
        DEFAULT_SGID_CODE_CHALLENGE_METHOD,
      )
      // Client ID, scope, response_type, redirect_uri, nonce, state, code_challenge, code_challenge_method
      expect(actualNumSearchParams).toBe(8)
    })

    it('should throw when no redirectUri is provided', () => {
      const mockState = 'mockState'
      const mockCodeChallenge = 'mockCodeChallenge'

      const noRedirectUriClient = new SgidClient({
        clientId: MOCK_CLIENT_ID,
        clientSecret: MOCK_CLIENT_SECRET,
        hostname: MOCK_HOSTNAME,
      })

      expect(() =>
        noRedirectUriClient.authorizationUrl({
          state: mockState,
          codeChallenge: mockCodeChallenge,
        }),
      ).toThrow('No redirect URI registered with this client')
    })
  })

  describe('callback', () => {
  
    it('should successfully exchange authorization code for tokens and sub', async () => {
      const mockCode = 'mockAuthorizationCode';
      const mockNonce = 'mockNonce';
      const mockCodeVerifier = 'mockCodeVerifier';
      const mockTokenResponse = {
        access_token: 'mockAccessToken',
        id_token: 'mockIdToken',
        claims: () => ({ sub: 'mockSub' }),
      };
  
      client.sgID.callback = jest.fn().mockResolvedValue(mockTokenResponse);
  
      const result = await client.callback({
        code: mockCode,
        nonce: mockNonce,
        codeVerifier: mockCodeVerifier,
      });
  
      expect(client.sgID.callback).toHaveBeenCalledWith(
        MOCK_REDIRECT_URI,
        { code: mockCode },
        { nonce: mockNonce, code_verifier: mockCodeVerifier },
      );
      expect(result).toEqual({
        sub: 'mockSub',
        accessToken: 'mockAccessToken',
        idToken: 'mockIdToken',
      });
    });
  
    it('should throw an error if no ID token is returned', async () => {
      const mockTokenResponse = {
        access_token: 'mockAccessToken',
        claims: () => ({ sub: 'mockSub' }),
      };
  
      client.sgID.callback = jest.fn().mockResolvedValue(mockTokenResponse);
  
      await expect(client.callback({
        code: 'mockCode',
        nonce: 'mockNonce',
        codeVerifier: 'mockCodeVerifier',
      })).rejects.toThrow(Errors.NO_ID_TOKEN_ERROR);
    });
  
    it('should throw an error if no sub is returned', async () => {
      const mockTokenResponse = {
        access_token: 'mockAccessToken',
        id_token: 'mockIdToken',
        claims: () => ({}), // No sub returned
      };
  
      client.sgID.callback = jest.fn().mockResolvedValue(mockTokenResponse);
  
      await expect(client.callback({
        code: 'mockCode',
        nonce: 'mockNonce',
        codeVerifier: 'mockCodeVerifier',
      })).rejects.toThrow(Errors.NO_SUB_ERROR);
    });
  
    it('should throw an error if no access token is returned', async () => {
      const mockTokenResponse = {
        id_token: 'mockIdToken',
        claims: () => ({ sub: 'mockSub' }),
      };
  
      client.sgID.callback = jest.fn().mockResolvedValue(mockTokenResponse);
  
      await expect(client.callback({
        code: 'mockCode',
        nonce: 'mockNonce',
        codeVerifier: 'mockCodeVerifier',
      })).rejects.toThrow(Errors.NO_ACCESS_TOKEN_ERROR);
    });
  });

  describe('userinfo', () => {
  
    it('should return user info data correctly when sub matches', async () => {
      const userInfoHandler = jest.fn().mockResolvedValue(MOCK_USERINFO)
      client.sgID.userinfo = userInfoHandler
  
      const result = await client.userinfo({ sub: MOCK_SUB, accessToken: MOCK_ACCESS_TOKEN })
  
      expect(result.data).toEqual(MOCK_USERINFO)
      expect(result.data.sub).toBe(MOCK_SUB)
    })
  
    it('should throw SUB_MISMATCH_ERROR when sub does not match', async () => {
      const mismatchedSubData = { ...MOCK_USERINFO, sub: 'mismatchedSub' }
      const userInfoHandler = jest.fn().mockResolvedValue(mismatchedSubData)
      client.sgID.userinfo = userInfoHandler
  
      await expect(client.userinfo({ sub: MOCK_SUB, accessToken: MOCK_ACCESS_TOKEN }))
        .rejects.toThrow(Errors.SUB_MISMATCH_ERROR)
    })
  
    it('should return empty data object when userinfo returns undefined', async () => {
      const userInfoHandler = jest.fn().mockResolvedValue(undefined)
      client.sgID.userinfo = userInfoHandler

      const result = await client.userinfo({ sub: MOCK_SUB, accessToken: MOCK_ACCESS_TOKEN })
      expect(result.data).toEqual({})
    })
  })

})
