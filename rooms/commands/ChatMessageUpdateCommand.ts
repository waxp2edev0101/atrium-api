import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IOfficeState } from '../../types/IOfficeState'
import { ChatMessage } from '../schema/OfficeState'

type Payload = {
  client: Client
  payload: {
    avatar?: string
    channel?: string
    content: string
  }
}

export default class ChatMessageUpdateCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, payload } = data
    const player = this.room.state.players.get(client.sessionId)
    const chatMessages = this.room.state.chatMessages

    if (!chatMessages) return

    /**
     * Only allow server to store a maximum of 100 chat messages:
     * remove the first element before pushing a new one when array length is >= 100
     */
    if (chatMessages.length >= 100) chatMessages.shift()

    const newMessage = new ChatMessage()
    newMessage.username = player ? player.name : ''
    newMessage.avatar = payload.avatar ? payload.avatar : ''
    newMessage.channel = payload.channel ? payload.channel : ''
    newMessage.content = payload.content ? payload.content : ''
    chatMessages.push(newMessage)
  }
}
