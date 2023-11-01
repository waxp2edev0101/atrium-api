import mongoose from 'mongoose'
import { Friend } from './Friend'
import { Community } from './Community'
import { CommunityMember } from './CommunityMember'

const userSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      unique: true,
    },
    username: String,
    avatar: String,
    skin: String,
    bio: String,
    websiteUrl: String,
    isWebsiteUrlDOP: Boolean,
    email: String,
    isEmailNotification: Boolean,
    discord: String,
    isDiscordDOP: Boolean,
    twitter: String,
    isTwitterDOP: Boolean,
    instagram: String,
    isInstagramDOP: Boolean,
    isPrivate: Boolean,
    blurp: String,
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Friend' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    ownedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
    joinedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CommunityMember' }],
    favoriteCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
    featuredPost: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    tags: [{ tag: String, description: String }],
  },
  { timestamps: true }
)

export const User = mongoose.model('User', userSchema)

export const friendAggregate = (userId: string) => {
  return {
    $lookup: {
      from: Friend.collection.name,
      let: { friends: '$friends' },
      pipeline: [
        {
          $match: {
            $or: [
              {
                requester: new mongoose.Types.ObjectId(userId),
                $expr: { $in: ['$_id', '$$friends'] },
              },
              {
                recipient: new mongoose.Types.ObjectId(userId),
                $expr: { $in: ['$_id', '$$friends'] },
              },
            ],
          },
        },
        {
          $project: {
            _id: 0,
            status: 1,
            user: {
              $cond: [
                { $eq: ['$recipient', new mongoose.Types.ObjectId(userId)] },
                '$requester',
                '$recipient',
              ],
            },
          },
        },
        {
          $lookup: {
            from: User.collection.name,
            let: { user: '$user' },
            localField: 'user',
            foreignField: '_id',
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$user'] } } },
              {
                $project: {
                  accountId: 1,
                  username: 1,
                  avatar: 1,
                  skin: 1,
                  tags: 1,
                },
              },
            ],
            as: 'user',
          },
        },
        {
          $unwind: { path: '$user' },
        },
        {
          $project: {
            // status: 1,
            username: '$user.username',
            accountId: '$user.accountId',
            avatar: '$user.avatar',
            skin: '$user.skin',
            _id: '$user._id',
            tags: '$user.tags',
          },
        },
      ],
      as: 'friends',
    },
  }
}

export const ownedCommunitiesAggregate = () => {
  return {
    $lookup: {
      from: Community.collection.name,
      let: { ownedCommunities: '$ownedCommunities' },
      pipeline: [{ $match: { $expr: { $in: ['$_id', '$$ownedCommunities'] } } }],
      as: 'ownedCommunities',
    },
  }
}

export const joinedCommunitiesAggregate = () => {
  return {
    $lookup: {
      from: CommunityMember.collection.name,
      let: { joinedCommunities: '$joinedCommunities' },
      pipeline: [
        { $match: { $expr: { $in: ['$_id', '$$joinedCommunities'] } } },
        {
          $lookup: {
            from: Community.collection.name,
            let: { community: '$community' },
            localField: 'community',
            foreignField: '_id',
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$community'] } } }],
            as: 'community',
          },
        },
        {
          $unwind: { path: '$community' },
        },
      ],
      as: 'joinedCommunities',
    },
  }
}
