"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHealthServer = exports.start = exports.createRequestHandler = void 0;
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
const createRequestHandler = (health, readiness, shutdownState) => (request, response) => {
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
exports.createRequestHandler = createRequestHandler;
const start = (server, port, logger) => {
    server.listen(port);
    if (logger) {
        server.on('listening', () => logger.info(`http server is listening on port ${port}`));
        server.on('error', (error) => logger.error('HTTP server error', error));
    }
};
exports.start = start;
const createHealthServer = ({ health, readiness }, shutdownState) => http.createServer((0, exports.createRequestHandler)(health, readiness, shutdownState));
exports.createHealthServer = createHealthServer;
exports.default = exports.createHealthServer;
//# sourceMappingURL=index.js.map