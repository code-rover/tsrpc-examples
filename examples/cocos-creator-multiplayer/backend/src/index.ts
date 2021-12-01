import 'k8w-extend-native';
import * as path from "path";
import { WsServer } from "tsrpc";
import { Room } from './models/Room';
import { serviceProto } from './shared/protocols/serviceProto';

// Create the Server
export const server = new WsServer(serviceProto, {
    port: 3000,
    // Remove this to use binary mode (remove from the client too)
    json: true
});

// 测试，只有一个房间
export const roomInstance = new Room(server);

// Initialize before server start
async function init() {
    await server.autoImplementApi(path.resolve(__dirname, 'api'));

    // TODO
    // Prepare something... (e.g. connect the db)
};

// Entry function
async function main() {
    await init();
    await server.start();
}
main();