import http from 'http'
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { Server, LobbyRoom, MongooseDriver } from 'colyseus'
import { monitor } from '@colyseus/monitor'
import fileUpload from 'express-fileupload'
import { RoomType } from './types/Rooms'
import userRouter from './routers/User'
import authRouter from './routers/Auth'
import postRouter from './routers/Post'
import communityRouter from './routers/Community'
import searchRouter from './routers/Search'
import fileRouter from './routers/File'
const { createProxyMiddleware } = require('http-proxy-middleware');
var path = require('path')
// import socialRoutes from "@colyseus/social/express"

import { SkyOffice } from './rooms/SkyOffice'

const port = Number(process.env.PORT || 2567)
const app = express()

mongoose.connect('mongodb://localhost:27017/atrium')
app.use(cors())
app.use(fileUpload())
app.use(express.json())
app.use('/files', express.static(path.join(__dirname, 'uploads')))

const server = http.createServer(app)
const gameServer = new Server({
  server,
  driver: new MongooseDriver()
})

// register room handlers
gameServer.define(RoomType.LOBBY, LobbyRoom)
gameServer.define(RoomType.PUBLIC, SkyOffice, {
  name: 'Public Lobby',
  description: 'For making friends and familiarizing yourself with the controls',
  password: null,
  autoDispose: false,
})
gameServer.define(RoomType.CUSTOM, SkyOffice).enableRealtimeListing()

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/server/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

// register colyseus monitor AFTER registering your room handlers
app.use('/colyseus', monitor())
app.use('/user', userRouter)
app.use('/auth', authRouter)
app.use('/posts', postRouter)
app.use('/communities', communityRouter)
app.use('/search', searchRouter)
app.use('/file', fileRouter)

app.use(
  '/proxy',
  createProxyMiddleware({
    target: 'https://twitter.com',
    changeOrigin: true,
    pathRewrite: {
      '/proxy': '/',
    },
  })
)
/**
 * Jwt error response
 */
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({ message: 'Unauthorized' })
  } else {
    next(err)
  }
})

gameServer.listen(port)
console.log(`Listening on ws://localhost:${port}`)

// let user = new User({username: 'adonis', accountId: 'adonis0923.testnet', avatar: '', communication: 'discord'});

// user.save();
