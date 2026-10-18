import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { globalErrorHandler } from './middleware/index.js';
import { ORIGINS, PORT } from './config.js';
import { bootstrapDB } from './DB/connection.js';
import { AuthController, messageController, UserController } from './modules/index.js';
import { generatelimiter } from './common/utils/index.js';
import morgan from "morgan"
var corsOptions = {
    origin: function (origin, callback) {
        if (!ORIGINS.includes(origin)) {
            callback(new Error("unauthorized origin", { cause: { status: 401 } }), ORIGINS)
        } else {
            callback(null, ORIGINS)
        }
    }
}

const app = express()
await bootstrapDB(app, PORT)
app.set("trust proxy", 1)
const limiter = generatelimiter({})
app.use(helmet(),morgan("common"), cors(), 
limiter, 
express.json())
app.use("/assets", express.static("./assets"))
app.use("/Auth", AuthController)
app.use("/user", UserController)
app.use("/message", messageController)
app.use(globalErrorHandler)
app.get('/', (req, res) => res.send('Hello World '))

