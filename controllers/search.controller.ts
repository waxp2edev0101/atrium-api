import { NextFunction, Request, Response } from 'express'
import { Community } from '../models/Community'
import { User } from '../models/User'

export const index = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let condition = {}
    const body = req.query
    if (body.user) {
      condition = {
        ...condition,
        $or: [
          { accountId: { $regex: body.user, $options: 'i' } },
          { username: { $regex: body.user, $options: 'i' } },
        ],
      }
    }
    let query = User.find(condition)
    const users = await query.exec()

    let condition1 = {}
    if (body.community) {
      condition1 = {
        ...condition1,
        name: { $regex: body.community, $options: 'i' },
      }
    }
    query = Community.find(condition1)
    const communities = await query.populate('owner').exec()
    const result = {
      users,
      communities,
    }
    res.status(200).json(result)
  } catch (err) {
    console.log(err)
    res.json([])
  }
}
