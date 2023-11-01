import { Router } from 'express'
import { expressjwt } from 'express-jwt'
import { config } from '../util/jwt'

const router = Router()
import * as searchController from '../controllers/search.controller'

router.route('').get(expressjwt(config), searchController.index)

export default router
