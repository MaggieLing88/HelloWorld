import { Express, Request, Response} from 'express'
import { Logger } from './Logger'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

let bodyParser = require('body-parser')
let cors = require('cors')


export class CommonMiddleware {
    app: Express
    static mockImplementation: any

    constructor(_app: Express) {
        this.app = _app
    }

    public async useBodyParser() {
        this.app.use(bodyParser.json())
    }

    public async useURLencoded() {
        this.app.use(
            bodyParser.urlencoded({
                extended: true
            })
        );
    }

    public async useCors() {
        const keycloak_host = [String(process.env.VITE_BACKEND_URL), String(process.env.KEYCLOAK_HOST)]
        this.app.use(cors({
            credentials: true,
           origin: keycloak_host
          }))
    }

    public async useMorganLogger() {
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
        this.app.use(morganMiddleware)
    }

    public async useCookieParser() {
        this.app.use(cookieParser())
    }
}