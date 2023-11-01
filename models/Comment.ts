import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    body: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const Comment = mongoose.model('Comment', commentSchema)
