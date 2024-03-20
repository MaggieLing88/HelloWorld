export class Logger {
    private static instance: Logger
    private logger = logger
  
    private static getLoggerInstance() {
      if (!Logger.instance) {
        Logger.instance = new Logger();
      }
      return Logger.instance
    }
    
    public static getLogger(){
      let _logger = Logger.getLoggerInstance()
      return _logger.logger
  
  }
  }
  
  const winston = require("winston")
  
  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  }
  
  /* This method set the current severity based on
   the current NODE_ENV: show all the log levels
   if the server was run in development mode; otherwise,/.
   if it was run in production, show only warn, error, info and http messages.*/
  const level = () => {
    const env = process.env.NODE_ENV || 'development'
    const isDevelopment = env === 'development'
    return isDevelopment ? 'debug' : 'http'
  }
  
  const logger = winston.createLogger({
    level: level(),
    levels,
    // Use timestamp and printf to create a standard log format
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(
        (info: { timestamp: string; level: string; message: string }) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
    // Log to the console
    transports: [
      new winston.transports.Console()
    ],
  })


