import { Express } from 'express'
import { InitializeMiddleware } from '../src/InitializeMiddleware'
import { CommonMiddleware } from '../src/ComonMiddleware'

jest.mock('../src/ComonMiddleware')

describe('InitializeMiddleware', () => {
  it('should initialize common middleware', async () => {
    const mockUseBodyParser = jest.fn()
    const mockUseURLencoded = jest.fn()
    const mockUseCors = jest.fn()
    const mockUseMorganLogger = jest.fn()
    const mockUseCookieParser = jest.fn()

    CommonMiddleware.mockImplementation(() => {
      return {
        useBodyParser: mockUseBodyParser,
        useURLencoded: mockUseURLencoded,
        useCors: mockUseCors,
        useMorganLogger: mockUseMorganLogger,
        useCookieParser: mockUseCookieParser
      }
    })

    const app = {} as Express
    await InitializeMiddleware.InitializeCommonMiddleware(app)

    expect(CommonMiddleware).toHaveBeenCalledWith(app)
    expect(mockUseBodyParser).toHaveBeenCalled()
    expect(mockUseURLencoded).toHaveBeenCalled()
    expect(mockUseCors).toHaveBeenCalled()
    expect(mockUseMorganLogger).toHaveBeenCalled()
    expect(mockUseCookieParser).toHaveBeenCalled()
  })
})