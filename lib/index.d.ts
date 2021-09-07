/// <reference types="node" />
import * as http from 'http'
interface Logger {
  info: (message: string, payload?: any) => void
  error: (message: string, payload?: any) => void
}
declare type PromiseFn = () => Promise<any>
interface Callbacks {
  health: PromiseFn
  readiness: PromiseFn
}
interface ShutdownState {
  isShutdown: boolean
}
export declare const createRequestHandler: (
  health: PromiseFn,
  readiness: PromiseFn,
  shutdownState: ShutdownState,
) => (request: http.IncomingMessage, response: http.ServerResponse) => void
export declare const start: (server: http.Server, port: number, logger?: Logger | undefined) => void
export declare const createHealthServer: ({ health, readiness }: Callbacks, shutdownState: ShutdownState) => http.Server
export default createHealthServer
