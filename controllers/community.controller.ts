import { NextFunction, Request, Response } from 'express'
import { body, ValidationChain } from 'express-validator'
import { ObjectId } from 'mongoose'
import { Community } from '../models/Community'
import { CommunityMember } from '../models/CommunityMember'
import { User } from '../models/User'
import { customValidate } from '../util/validate'

export const communities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query = Community.find()
    const body = req.body
    if (body.owner) {
      query = query.where({ author: body.owner })
    }
    const communities = await query.populate('owner').exec()

    res.status(200).json(communities)
  } catch (err) {
    console.log(err)
    res.json([])
  }
}

export const getCommunity = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id
  try {
    const community = await Community.findById(id).populate('owner').exec()

    res.json(community)
  } catch (err) {
    console.log(err)
    res.json({})
  }
}

export const createCommunity = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).auth.payload.id
  const community = new Community({ ...req.body, owner: userId })
  await community.save()

  await User.findOneAndUpdate(
    { _id: userId },
    { $push: { ownedCommunities: community._id as unknown as ObjectId } }
  )

  res.status(200).json(community)
}

export const updateCommunity = async (req: Request, res: Response, next: NextFunction) => {
  await Community.updateOne({ _id: req.body.id }, { ...req.body })
  res.status(200).json({ success: true })
}

export const deleteCommunity = async (req: Request, res: Response, next: NextFunction) => {
  await Community.deleteOne({ _id: req.params.id })
  res.status(200).json({ success: true })
}

export const joinCommunity = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).auth.payload.id
  const body = req.body

  const community = await Community.findById(body.community)

  if (!community) {
    return res.status(400).json({ msg: "Community doesn't exist" })
  }

  if (community.owner == userId) {
    return res.status(400).json({ msg: 'User is an owner' })
  }

  let communityMember = await CommunityMember.findOne({ community: body.community, member: userId })
  if (communityMember) {
    // Leave Community
    if (body.leave) {
      await CommunityMember.deleteOne({ community: body.community, member: userId })
      await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { joinedCommunities: communityMember._id as unknown as ObjectId } }
      )
      return res.status(200).json({ msg: 'User leaved' })
    }
    return res.status(400).json({ msg: 'User already joined' })
  } else {
    if (body.leave) {
      return res.status(400).json({ msg: 'User already leaved' })
    }
  }
  communityMember = await CommunityMember.create({ community: body.community, member: userId })

  await User.findOneAndUpdate(
    { _id: userId },
    { $push: { joinedCommunities: communityMember._id as unknown as ObjectId } }
  )

  res.status(200).json(communityMember)
}

export const validate = (method: string) => {
  let validations: ValidationChain[] = []
  switch (method) {
    case 'createCommunity': {
      validations = [body('name', "Name doesn't exist").exists()]
      break
    }
    case 'joinCommunity': {
      validations = [body('community', "Community doesn't exist").exists()]
      break
    }
  }

  return customValidate(validations)
}
