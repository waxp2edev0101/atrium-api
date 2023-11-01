import { NextFunction, Response } from 'express'
// var slugify = require('slug-generator')
import { File } from '../models/File'

export const upload = async (req: any, res: Response, next: NextFunction) => {
  const userId = (req as any).auth.payload.id
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded',
      })
    } else {
      let image = req.files.image
      const name = generateRandom() + '-' + image.name
      await image.mv('./uploads/' + name)

      const file = new File({
        name: image.name,
        path: name,
        mimeType: image.mimeType,
        fileSize: image.size,
        owner: userId,
      })
      await file.save()

      //send response
      res.send({
        status: true,
        message: 'File is uploaded',
        file,
      })
    }
  } catch (err) {
    res.status(500).send(err)
  }
}

export const getMedia = async (req: any, res: Response) => {
  const userId = (req as any).auth.payload.id
  const reqQuery = req.query

  let query = File.find({ owner: userId })
  if (reqQuery.skip) {
    if (eval(reqQuery.skip)) {
      query.skip(reqQuery.skip)
    }
  }
  if (eval(reqQuery.limit)) {
    if (typeof reqQuery.limit == 'number') {
      query.limit(reqQuery.limit)
    }
  } else {
    query.limit(10)
  }

  query.sort({ createdAt: -1 })
  query.exec(function (err, result) {
    if (err) return res.status(400).send({ success: false, message: 'something is wrong' })
    return res.status(200).json(result)
  })
}

export const generateRandom = () =>
  Math.random().toString(36).substring(2, 15) + Math.random().toString(23).substring(2, 5)
