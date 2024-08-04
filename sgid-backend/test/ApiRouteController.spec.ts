import request from 'supertest'
import express from 'express'
import apiRouter from '../src/ApiRouteController'
import cookieParser from 'cookie-parser'  
import cors from 'cors'
import * as Errors from '../src/error'

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

jest.mock('../src/SgidClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      authorizationUrl: jest.fn().mockResolvedValue({
          data: {
              'nonce':'testNonce', 
              'url':'testUrl'
          },
        }),
      callback: jest.fn().mockResolvedValue({
        accessToken: 'testAccessToken',
        sub: 'testSub', 
        idToken: 'testIdToken'
      }),
      userinfo: jest.fn().mockResolvedValue({
        data:{
          'primary_email_address':'test@example.com'
        }
      })
      };
  });
});


describe('ApiRouteController', () => {
        
    const app = express()
     app.use(
       cors({
        credentials: true,
        origin: '*'
      })
     )
    app.use(cookieParser());
    app.use(apiRouter)
    const agent = request.agent(app)

 
  beforeEach(() => jest.clearAllMocks());

    const frontendHost = String(process.env.VITE_BACKEND_URL)
    const SESSION_COOKIE_NAME = 'connectorAppSession'
    

  it('should respond to /health/check', async () => {
 
    const response = await agent.get('/health/check')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('uptime')
    expect(response.body).toHaveProperty('message', 'OK')
    expect(response.body).toHaveProperty('timestamp')
  })


    it('should generate a correct URL and set a cookie with sessionId', async () => {
        const idp = 'testIdp';
        const response = await agent.get(`/auth-url?idp=${idp}`);
        expect(response.status).toBe(200);
        expect(response.headers['set-cookie']).toBeDefined();
        expect(response.headers['set-cookie'][0]).toContain(SESSION_COOKIE_NAME);
      });

     
    it('should handle redirect and exchange token correctly', async () => {
        const response = await agent.get('/redirect')
        .query({
          code: 'testCode',
          state: 'idp=testIdp',
        });
        expect(response.headers.location).toBe(`${process.env.VITE_BACKEND_URL}/logged-in`);
      });

      it('should return user info for authenticated sessions', async () => {
          const response = await agent.get('/userinfo')
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('data');
          expect(response.body.data).toHaveProperty('primary_email_address', 'test@example.com');
        });

    it('should redirect to error page if state does not match', async () => {
      const response = await agent.get('/redirect')
      .set('cookie', 'connectorAppSession=testSessionId')
      .query({
        code: 'testCode',
        state: 'invalidState',
      });
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(`${frontendHost}/error`);
    });
  
    it('should return 401 for unauthenticated sessions', async () => {
      const response = await request(app).get('/userinfo');
      expect(response.status).toBe(401);
    });
  
    it('should clear the session and cookie', async () => {
      const response = await request(app).get('/logout')
      expect(response.status).toBe(200);
      expect(response.get("Set-Cookie")).toBeDefined();
      expect(response.headers['set-cookie']).toContainEqual(expect.stringContaining('Expires=Thu, 01 Jan 1970'));
    });
  
});

  