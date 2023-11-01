import mongoose from 'mongoose'

const communitySchema = new mongoose.Schema(
  {
    name: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String,
    logoUrl: String,
    webUrl: String,
    discordUrl: String,
    twitterUrl: String,
    marketPlaceUrl: String,
  },
  { timestamps: true }
)

export const Community = mongoose.model('Community', communitySchema)
