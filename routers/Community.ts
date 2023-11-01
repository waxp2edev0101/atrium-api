import { Router } from 'express'
import { expressjwt } from 'express-jwt'
import { config } from '../util/jwt'

const router = Router()
import * as communityController from '../controllers/community.controller'

router
  .route('/')
  .get(
    expressjwt(config),
    communityController.validate('communities'),
    communityController.communities
  )
router
  .route('/:id')
  .get(
    expressjwt(config),
    communityController.validate('getCommunity'),
    communityController.getCommunity
  )
router
  .route('/')
  .post(
    expressjwt(config),
    communityController.validate('createCommunity'),
    communityController.createCommunity
  )
router
  .route('/:id')
  .delete(
    expressjwt(config),
    communityController.validate('deleteCommunity'),
    communityController.deleteCommunity
  )
router
  .route('/')
  .put(
    expressjwt(config),
    communityController.validate('updateCommunity'),
    communityController.updateCommunity
  )
router
  .route('/join')
  .post(
    expressjwt(config),
    communityController.validate('joinCommunity'),
    communityController.joinCommunity
  )

export default router
