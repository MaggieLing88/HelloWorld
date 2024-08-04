import express from 'express'
import { Logger } from './Logger'
import * as dotenv from 'dotenv'
import apiRouter from './ApiRouteController'
import { InitializeMiddleware } from './InitializeMiddleware'
import path from 'path'
import { Request, Response, NextFunction } from 'express'

const app = express()

export const initServer = async (): Promise<void> => {
    
    const log = Logger.getLogger()

    dotenv.config()
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    try {   
       
    
        //Express app behind a reverse proxy
        app.set('trust proxy', true);
        app.disable("x-powered-by") // not disclose technologies used on website 
        await InitializeMiddleware.InitializeCommonMiddleware(app)
        const PORT = parseInt(String(process.env.APP_PORT))
        app.use('/api', apiRouter)
        app.listen(PORT, () => {
            log.info(`Server listening on port ${PORT}`)
        })

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
        
    } catch (error) {
        log.error('Something went wrong while starting the server. Please restart the server.',)
        log.error(error)
    }
    
}
export default app
