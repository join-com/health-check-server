"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const healthzHandler = (health, response) => {
    health()
        .then(() => response.end('OK!'))
        .catch(() => {
        response.writeHead(500);
        response.end('not healthy');
    });
};
const readinessHandler = (readiness, response, state) => {
    if (state.isShutdown) {
        response.writeHead(500);
        response.end('shutting down');
    }
    else {
        readiness()
            .then(() => response.end('ready'))
            .catch(() => {
            response.writeHead(500);
            response.end('is not ready');
        });
    }
};
const notFoundHandler = (response) => {
    response.writeHead(404);
    response.end('not found');
};
const requestHandler = (health, readiness, shutdownState) => (request, response) => {
    if (request.method !== 'GET') {
        notFoundHandler(response);
    }
    switch (request.url) {
        case '/healthz':
            healthzHandler(health, response);
            break;
        case '/readiness':
            readinessHandler(readiness, response, shutdownState);
            break;
        default:
            notFoundHandler(response);
            break;
    }
};
exports.start = (server, port, logger) => {
    server.listen(port, (err) => {
        if (err) {
            if (logger) {
                logger.error('Can not start server', err);
            }
            return;
        }
        if (logger) {
            logger.info(`http server is listening on port ${port}`);
        }
        return;
    });
};
exports.createHealthServer = ({ health, readiness }, shutdownState) => {
    return http.createServer(requestHandler(health, readiness, shutdownState));
};
exports.default = exports.createHealthServer;
//# sourceMappingURL=index.js.map