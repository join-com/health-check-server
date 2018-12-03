/// <reference types="node" />
import * as http from 'http';
declare type PromiseFn = () => Promise<any>;
interface Callbacks {
  health: PromiseFn;
  readiness: PromiseFn;
}
export declare const start: (server: http.Server, port: number) => void;
export declare const createHealthServer: (
  { health, readiness }: Callbacks,
) => http.Server;
export default createHealthServer;
