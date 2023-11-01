import { NextFunction, Request, Response } from 'express'
import { Post } from '../models/Post'
import { Comment } from '../models/Comment'
import { ObjectId } from 'mongoose'
import { User } from '../models/User'

export const posts = async (req: any, res: Response, next: NextFunction) => {
  try {
    let query = Post.find()
    const body = req.body
    if (body.author) {
      query = query.where({ author: body.author })
    }
    const posts = await query.populate('media').populate('author').exec()

    res.status(200).json(posts)
  } catch (err) {
    console.log(err)
    res.json([])
  }
}

export const getPost = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id
  try {
    const post = await Post.findById(id).populate('media').populate('author').exec()

    res.json(post)
  } catch (err) {
    console.log(err)
    res.json({})
  }
}

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).auth.payload.id
  const post = new Post({ ...req.body, author: userId })
  await post.save()
  post.populate('media')

  await User.findByIdAndUpdate(userId, {
    $push: { posts: post as any },
  })
  res.status(200).json(post)
}

export const updatePost = (req: Request, res: Response, next: NextFunction) => {
  Post.updateOne({ _id: req.body.id }, { ...req.body })
}

export const deletePost = (req: Request, res: Response, next: NextFunction) => {
  Post.deleteOne({ _id: req.params.id })
}

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.id
  const comment = req.body
  if (!comment.author) {
    comment.author = (req as any).auth.payload.id
  }

  const docComment = await Comment.create(comment)
  await Post.findByIdAndUpdate(
    postId,
    { $push: { comments: docComment._id as unknown as ObjectId } },
    { new: true, useFindAndModify: false }
  )
  return await res.status(200).json(docComment)
}

export const comments = async (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.id
  const comments = await Post.findById(postId)
    .populate({
      path: 'comments',
      populate: { path: 'author', select: { _id: 1, accountId: 1, usename: 1, avatar: 1 } },
    })
    .select('comments')
  return res.status(200).json(comments)
}

export const getComment = (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.id
  const commentId = req.params.commentId
  Comment.findById(commentId, function (err: any, result: any) {
    if (err) res.status(400).json({ success: false, message: 'Something is wrong' })

    res.status(200).json(result)
  }).populate({ path: 'author', select: '_id accountId username avatar' })
}
