import { Router } from 'express'
import { expressjwt } from 'express-jwt'
import { config } from '../util/jwt'

const router = Router()
import * as fileController from '../controllers/file.controller'

router.route('/upload').post(expressjwt(config), fileController.upload)
router.route('/').get(expressjwt(config), fileController.getMedia)

export default router
