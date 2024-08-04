import { Express } from 'express'
import { CommonMiddleware } from './ComonMiddleware'

export class InitializeMiddleware {

    public static async InitializeCommonMiddleware(app: Express) {
        let middleware = new CommonMiddleware(app)

        await middleware.useBodyParser()
        await middleware.useURLencoded()
        await middleware.useCors()
        await middleware.useMorganLogger()
        await middleware.useCookieParser()
    }
}