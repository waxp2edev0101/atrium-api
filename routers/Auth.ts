import { Router } from 'express'
import { expressjwt } from 'express-jwt'
import { config } from '../util/jwt'

const router = Router()
import * as authController from '../controllers/auth.controller'

router.post('/login', authController.login)
router.post('/login1', authController.login1)
router.post('/signup', authController.signup)
router.route('/me').get(expressjwt(config), authController.me)

export default router
