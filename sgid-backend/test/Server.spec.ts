import { initServer } from '../src/Server';
import app from '../src/Server';
import apiRouter from '../src/ApiRouteController';
import { InitializeMiddleware } from '../src/InitializeMiddleware';
import path from 'path';
import express from 'express';

jest.mock('express', () => {
  const mockExpress = jest.fn().mockImplementation(() => {
    return {
      disable: jest.fn(),
      use: jest.fn(),
      listen: jest.fn((port, callback) => callback()),
      set: jest.fn(),
      static: jest.fn(),
    };
  });
  return mockExpress;
});

jest.mock('../src/ApiRouteController', () => jest.fn());
jest.mock('../src/InitializeMiddleware', () => ({
  InitializeMiddleware: {
    InitializeCommonMiddleware: jest.fn(),
  },
}));
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('Server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the server', async () => {
    await initServer();
    expect(app.disable).toHaveBeenCalledWith('x-powered-by');
    expect(app.use).toHaveBeenCalledWith('/api', apiRouter);
    expect(app.listen).toHaveBeenCalled();
  });

  it('should set trust proxy to true', async () => {
    await initServer();
    expect(app.set).toHaveBeenCalledWith('trust proxy', true);
  });

  it('should initialize common middleware', async () => {
    await initServer();
    expect(InitializeMiddleware.InitializeCommonMiddleware).toHaveBeenCalledWith(app);
  });

//   it('should use static middleware for serving build folder', async () => {
//     await initServer();
//     expect(app.use).toHaveBeenCalledWith(express.static(path.join(__dirname, 'build')));
//   });

//   it('should handle non-static file requests by serving index.html', async () => {
//     const mockSendFile = jest.fn();
//     const mockHeader = jest.fn();
//     const mockRequest = { path: '/somepath' } as any;
//     const mockResponse = {
//       header: mockHeader,
//       sendFile: mockSendFile,
//     } as any;
//     const mockNext = jest.fn();

//     await initServer();
//    // const middleware = app.use.mock.calls[app.use.mock.calls.length - 1][0];
//    // middleware(mockRequest, mockResponse, mockNext);

//     expect(mockHeader).toHaveBeenCalledWith('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//     expect(mockHeader).toHaveBeenCalledWith('Expires', '-1');
//     expect(mockHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
//     expect(mockSendFile).toHaveBeenCalledWith(path.join(__dirname, 'build', 'index.html'));
//   });

//   it('should call next() for static file requests', async () => {
//     const mockRequest = { path: '/somefile.js' } as any;
//     const mockResponse = {} as any;
//     const mockNext = jest.fn();

//     await initServer();
//    // const middleware = app.use.mock.calls[app.use.mock.calls.length - 1][0];
//    // middleware(mockRequest, mockResponse, mockNext);

//     expect(mockNext).toHaveBeenCalled();
//   });
});