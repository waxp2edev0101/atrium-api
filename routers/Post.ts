import { Router } from 'express'
import { expressjwt } from 'express-jwt'
import { config } from '../util/jwt'

const router = Router()
import * as postController from '../controllers/post.controller'

router.route('/').get(expressjwt(config), postController.posts)
router.route('/:id').get(expressjwt(config), postController.getPost)
router.route('/').post(expressjwt(config), postController.createPost)
router.route('/:id').delete(expressjwt(config), postController.deletePost)
router.route('/').put(expressjwt(config), postController.updatePost)

router.route('/:id/comment').post(expressjwt(config), postController.createComment)
router.route('/:id/comment').get(expressjwt(config), postController.comments)
router.route('/:id/comment/:commentId').get(expressjwt(config), postController.getComment)

export default router
