import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
  {
    title: String,
    body: String,
    media: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
)

export const Post = mongoose.model('Post', postSchema)
