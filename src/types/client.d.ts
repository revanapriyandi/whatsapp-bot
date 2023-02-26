import type { AuthenticationState, SocketConfig, WACallEvent, WAMessage, WASocket } from "@adiwajshing/baileys"

declare type ClientAuth = {
  state: AuthenticationState
  saveState: () => Promise<void>
  clearState: () => Promise<void>
}

declare type Client = Partial<WASocket>

declare type ClientConfig = {
  authType: "single" | "multi"
} & Partial<Omit<SocketConfig, "auth" | "browser" | "patchMessageBeforeSending" | "printQRInTerminal" | "version">>

declare type ClientEvents = {
  call: (call: WACallEvent) => void
  group: (message: WAMessage) => void
  "group.participant": (message: WAMessage) => void
  message: (message: WAMessage) => void
  qr: (qr: string) => void
}

declare type ClientEventEmitter = {
  on<E extends keyof ClientEvents>(event: E, listener: ClientEvents[E]): this
  off<E extends keyof ClientEvents>(event: E, listener: ClientEvents[E]): this
  emit<E extends keyof ClientEvents>(event: E, ...args: Parameters<ClientEvents[E]>): boolean
  removeAllListeners<E extends keyof ClientEvents>(event?: E): this
}
