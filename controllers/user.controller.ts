import { NextFunction, Response } from 'express'
import { Request } from 'express-jwt'
import mongoose, { ObjectId, PipelineStage } from 'mongoose'
import { Friend } from '../models/Friend'
import {
  friendAggregate,
  joinedCommunitiesAggregate,
  ownedCommunitiesAggregate,
  User,
} from '../models/User'

export const users = async (req: Request, res: Response, next: NextFunction) => {
  const users = await User.find()
    .populate({
      path: 'friends',
      populate: {
        path: 'requester',
      },
    })
    .populate({
      path: 'friends',
      populate: {
        path: 'recipient',
      },
    })
    .exec()
  res.status(200).json(users)
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id
  const _aggregate = [
    {
      $match: { _id: new mongoose.Types.ObjectId(userId) },
    },
    { ...friendAggregate(userId) },
    { ...ownedCommunitiesAggregate() },
    { ...joinedCommunitiesAggregate() },
  ] as PipelineStage[]
  const user = await User.aggregate(_aggregate).exec()

  return res.status(200).json(user.length > 0 ? user[0] : {})
}

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const user = new User(req.body)
  await user.save()
  res.status(200).json(user)
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.auth?.payload.id
  const user = await User.findOneAndUpdate({ _id: userId }, { ...req.body })
  res.status(200).json(user)
}

export const deleteUser = (req: Request, res: Response, next: NextFunction) => {
  User.deleteOne({ _id: req.params.id })
}

export const changeFriend = async (req: Request, res: Response, next: NextFunction) => {
  const requester = req.auth?.payload.id
  const recipient = req.body.recipient
  const status = req.body.status

  if (requester == recipient) {
    return res.status(400).json({ success: false, message: 'same user' })
  }

  const friend = await Friend.findOne({
    $or: [
      { requester, recipient },
      { requester: recipient, recipient: requester },
    ],
  })
  if (status == 3) {
    if (friend) {
      return res.status(400).json({ success: false, message: 'You are already a friend' })
    }

    const newfriend = await Friend.findOneAndUpdate(
      { requester, recipient },
      { $set: { status: 3 } },
      { upsert: true, new: true }
    )

    await User.findOneAndUpdate(
      { _id: requester },
      { $push: { friends: newfriend._id as unknown as ObjectId } }
    )
    await User.findOneAndUpdate(
      { _id: recipient },
      { $push: { friends: newfriend._id as unknown as ObjectId } }
    )

    return res.status(200).json(newfriend)
  } else if (status == 4) {
    // Remove friend
    const docA = await Friend.findOneAndRemove({ requester: requester, recipient: recipient })
    const docB = await Friend.findOneAndRemove({ recipient: requester, requester: recipient })
    await User.findOneAndUpdate({ _id: requester }, { $pull: { friends: docA?._id ?? docB?.id } })
    await User.findOneAndUpdate({ _id: recipient }, { $pull: { friends: docB?._id ?? docA?.id } })
    if (!docA && !docB) {
      return res.status(400).json({ success: false, message: 'You are not a friend' })
    }

    return res.status(200).json({ success: true })
  }

  return res.status(200).json({ success: false, message: 'Something is wrong' })
}

export const getFriends = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).auth.payload.id
  const _aggregate = [
    {
      $match: { _id: new mongoose.Types.ObjectId(userId) },
    },
    { ...friendAggregate(userId) },
  ] as PipelineStage[]
  try {
    const user = await User.aggregate(_aggregate).exec()

    return res.status(200).json(user.length > 0 ? user[0].friends : [])
  } catch (e) {
    return res.status(200).json({ success: false, message: 'Something is wrong' })
  }
}
