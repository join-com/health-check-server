import * as http from 'http'

interface Logger {
  info: (message: string, payload?: any) => void
  error: (message: string, payload?: any) => void
}

type PromiseFn = () => Promise<any>

interface Callbacks {
  health: PromiseFn
  readiness: PromiseFn
}

interface ShutdownState {
  isShutdown: boolean
}

const healthzHandler = (health: PromiseFn, response: http.ServerResponse) => {
  health()
    .then(() => response.end('OK!'))
    .catch(() => {
      response.writeHead(500)
      response.end('not healthy')
    })
}

const readinessHandler = (readiness: PromiseFn, response: http.ServerResponse, state: ShutdownState) => {
  if (state.isShutdown) {
    response.writeHead(500)
    response.end('shutting down')
  } else {
    readiness()
      .then(() => response.end('ready'))
      .catch(() => {
        response.writeHead(500)
        response.end('is not ready')
      })
  }
}

const notFoundHandler = (response: http.ServerResponse) => {
  response.writeHead(404)
  response.end('not found')
}

export const createRequestHandler =
  (health: PromiseFn, readiness: PromiseFn, shutdownState: ShutdownState) =>
  (request: http.IncomingMessage, response: http.ServerResponse) => {
    if (request.method !== 'GET') {
      notFoundHandler(response)
    }
    switch (request.url) {
      case '/healthz':
        healthzHandler(health, response)
        break

      case '/readiness':
        readinessHandler(readiness, response, shutdownState)
        break

      default:
        notFoundHandler(response)
        break
    }
  }

export const start = (server: http.Server, port: number, logger?: Logger) => {
  server.listen(port)
  if (logger) {
    server.on('listening', () => logger.info(`http server is listening on port ${port}`))
    server.on('error', (error: Error) => logger.error('HTTP server error', error))
  }
}

export const createHealthServer = ({ health, readiness }: Callbacks, shutdownState: ShutdownState) =>
  http.createServer(createRequestHandler(health, readiness, shutdownState))
export default createHealthServer
