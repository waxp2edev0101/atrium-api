import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IOfficeState } from '../../types/IOfficeState'

type Payload = {
  client: Client
  x: number
  y: number
  anim: string
  accountId: string
  userId: string
}

export default class PlayerUpdateCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, x, y, anim, accountId, userId } = data

    const player = this.room.state.players.get(client.sessionId)

    if (!player) return
    player.x = x
    player.y = y
    player.anim = anim
    player.accountId = accountId
    player.userId = userId
  }
}
