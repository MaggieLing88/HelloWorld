import { CommonMiddleware } from '../src/ComonMiddleware';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

jest.mock('body-parser', () => ({
  json: jest.fn(() => jest.fn()),
  urlencoded: jest.fn(() => jest.fn())
}));

jest.mock('cors', () => jest.fn(() => jest.fn()));

jest.mock('morgan', () => jest.fn(() => jest.fn()));

jest.mock('cookie-parser', () => jest.fn(() => jest.fn()));

describe('CommonMiddleware', () => {
  let app: express.Express;
  let middleware: CommonMiddleware;

  beforeEach(() => {
    app = express();
    middleware = new CommonMiddleware(app);
  });

  it('should use bodyParser.json', async () => {
    await middleware.useBodyParser();
    expect(bodyParser.json).toHaveBeenCalled();
  });

  it('should use bodyParser.urlencoded', async () => {
    await middleware.useURLencoded();
    expect(bodyParser.urlencoded).toHaveBeenCalledWith({ extended: true });
  });

  it('should use cors', async () => {
    process.env.VITE_BACKEND_URL = 'http://localhost';
    process.env.KEYCLOAK_HOST = 'http://localhost';
    await middleware.useCors();
    expect(cors).toHaveBeenCalledWith({
      credentials: true,
      origin: ['http://localhost', 'http://localhost']
    });
  });

  it('should use morgan', async () => {
    await middleware.useMorganLogger();
    expect(morgan).toHaveBeenCalled();
  });

  it('should use cookieParser', async () => {
    await middleware.useCookieParser();
    expect(cookieParser).toHaveBeenCalled();
  });
});