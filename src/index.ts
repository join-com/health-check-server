import { state } from '@join-com/shutdown';
import * as http from 'http';

interface Logger {
  info: (msg: string) => void;
  error: (error: Error) => void;
}

type PromiseFn = () => Promise<any>;

interface Callbacks {
  health: PromiseFn;
  readiness: PromiseFn;
}

const healthzHandler = (health: PromiseFn, response: http.ServerResponse) => {
  health()
    .then(() => response.end('OK!'))
    .catch(() => {
      response.writeHead(500);
      response.end('not healthy');
    });
};

const readinessHandler = (
  readiness: PromiseFn,
  response: http.ServerResponse,
) => {
  if (state.isShutdown) {
    response.writeHead(500);
    response.end('shutting down');
  } else {
    readiness()
      .then(() => response.end('ready'))
      .catch(() => {
        response.writeHead(500);
        response.end('is not ready');
      });
  }
};

const notFoundHandler = (response: http.ServerResponse) => {
  response.writeHead(404);
  response.end('not found');
};

const requestHandler = (health: PromiseFn, readiness: PromiseFn) => (
  request: http.IncomingMessage,
  response: http.ServerResponse,
) => {
  if (request.method !== 'GET') {
    notFoundHandler(response);
  }
  switch (request.url) {
    case '/healthz':
      healthzHandler(health, response);
      break;

    case '/readiness':
      readinessHandler(readiness, response);
      break;

    default:
      notFoundHandler(response);
      break;
  }
};

export const start = (server: http.Server, port: number, logger?: Logger) => {
  server.listen(port, (err: Error) => {
    if (err) {
      if (logger) {
        logger.error(err);
      }
      return;
    }
    if (logger) {
      logger.info(`http server is listening on port ${port}`);
    }
    return;
  });
};

export const createHealthServer = ({ health, readiness }: Callbacks) => {
  return http.createServer(requestHandler(health, readiness));
};

export default createHealthServer;
