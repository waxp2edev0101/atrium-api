import { Router } from 'express'
import { expressjwt } from 'express-jwt'
import { config } from '../util/jwt'

const router = Router()
import * as userController from '../controllers/user.controller'

router.route('').get(expressjwt(config), userController.users)
router.route('/:id').get(expressjwt(config), userController.getUser)
router.route('/').post(expressjwt(config), userController.createUser)
router.route('/:id').delete(expressjwt(config), userController.deleteUser)
router.route('/').put(expressjwt(config), userController.updateUser)

router.route('/friend/all').get(expressjwt(config), userController.getFriends)
router.route('/friend').post(expressjwt(config), userController.changeFriend)

export default router
