import express from 'express'
import cors from 'cors'
import { globalErrorHandler } from './middleware/index.js';
import { PORT } from './config.js';
import {  bootstrapDB } from './DB/connection.js';
import { AuthController, UserController } from './modules/index.js';
const app = express()
bootstrapDB(app ,PORT)
app.use(cors(),express.json())
app.use("/Auth", AuthController)
app.use("/user", UserController)
app.use(globalErrorHandler)
app.get('/', (req, res) => res.send('Hello World!'))

