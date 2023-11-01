import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import mongoose, { PipelineStage } from 'mongoose'
import { connect, keyStores, KeyPair, ConnectConfig } from 'near-api-js'
import path from 'path'
import {
  friendAggregate,
  joinedCommunitiesAggregate,
  ownedCommunitiesAggregate,
  User,
} from '../models/User'

// configure key storage
const homedir = require('os').homedir()
const CREDENTIALS_DIR = '.near-credentials'
const credentialsPath = path.join(homedir, CREDENTIALS_DIR)
const SECRET = process.env.SECRET as string

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { accountId, publicKey, privateKey } = req.body
  if (!accountId)
    return res.status(400).send({ error: 'Request should have signature and publicAddress' })

  User.findOne({ accountId })
    .then((user) => {
      if (!user) {
        res.status(401)
        throw new Error(`User with publicAddress ${accountId} is not found in database`)
      }
      return user
    })
    .then((user) => {
      // TODO: Verify signature
      if (!user) {
        throw new Error('User is not defined in "Verify digital signature".')
      }
      return new Promise<string>((resolve, reject) =>
        jwt.sign(
          {
            payload: {
              id: user.id,
              accountId,
            },
          },
          SECRET,
          {
            algorithm: 'HS256',
            expiresIn: process.env.EXPIREIN,
          },
          (err, token) => {
            if (err) {
              return reject(err)
            }
            if (!token) {
              return new Error('Empty token')
            }
            return resolve(token)
          }
        )
      )
    })
    .then((accessToken: string) => res.json({ accessToken }))
    .catch((err) => {
      console.log('err:', err)
      res.send({ error: err.message })
    })
}

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { accountId, publicKey, privateKey } = req.body
  // TODO: Verify signature
  if (!accountId)
    return res.status(400).send({ error: 'Request should have signature and publicAddress' })

  try {
    const user = new User(req.body)
    await user.save()
    const promise = new Promise<string>((resolve, reject) =>
      jwt.sign(
        {
          payload: {
            id: user.id,
            accountId,
          },
        },
        SECRET,
        {
          algorithm: 'HS256',
          expiresIn: process.env.EXPIREIN,
        },
        (err, token) => {
          if (err) {
            return reject(err)
          }
          if (!token) {
            return new Error('Empty token')
          }
          return resolve(token)
        }
      )
    )
    promise.then((accessToken: string) => res.status(200).json({ accessToken })).catch(next)
  } catch (err) {
    let message = err.message
    if (message.indexOf('duplicate key error') !== -1) {
      message = 'Account Id is duplicated'
    }
    res.status(400).send({ error: message })
  }
}

export const login1 = async function (req: Request, res: Response, next: NextFunction) {
  const { accountId, publicKey, privateKey }: any = req.body
  // configure network settings
  const config: ConnectConfig = {
    nodeUrl: 'https://rpc.testnet.near.org',
    deps: {
      keyStore: new keyStores.UnencryptedFileSystemKeyStore(credentialsPath),
    },
    networkId: 'testnet',
    headers: {},
  }
  const near = await connect(config)
  const account = await near.account(accountId)
  const detail = await account.getAccountDetails()
  console.log(account)
  console.log(detail)
  const keyStore = new keyStores.InMemoryKeyStore()
  try {
    const keyPair = KeyPair.fromString(privateKey)
    await keyStore.setKey('testnet', accountId, keyPair)
    const msg = Buffer.from('hi')
    const { signature } = keyPair.sign(msg)
    const isValid = keyPair.verify(msg, signature)
    console.log('Signature Valid?:', isValid)
    const _publicKey = keyPair.getPublicKey()
    console.log('public key:', _publicKey)
    console.log('public key:', _publicKey.toString())
    res.status(200).json({ isValid: isValid })
  } catch (e) {
    console.log(e)
    res.status(200).json({ isValid: false, message: e.message })
  }
}

export const me = async (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).auth.payload.id) {
    return res.status(401).send({ error: 'You can only access yourself' })
  }

  const userId = (req as any).auth.payload.id
  const _aggregate = [
    {
      $match: { _id: new mongoose.Types.ObjectId(userId) },
    },
    { ...friendAggregate(userId) },
    { ...ownedCommunitiesAggregate() },
    { ...joinedCommunitiesAggregate() },
  ] as PipelineStage[]

  const user = await User.aggregate(_aggregate).exec()

  return res.json(user.length > 0 ? user[0] : {})
}
