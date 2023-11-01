import mongoose from 'mongoose'

const communityMemberSchema = new mongoose.Schema(
  {
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: Boolean,
  },
  { timestamps: true }
)

export const CommunityMember = mongoose.model('CommunityMember', communityMemberSchema)
