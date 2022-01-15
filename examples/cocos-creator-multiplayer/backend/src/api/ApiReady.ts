import { ApiCallWs } from "tsrpc";
import { roomInstance } from "..";
import { ReqReady, ResReady } from "../shared/protocols/PtlReady";

export async function ApiReady(call: ApiCallWs<ReqReady, ResReady>) {
    let playerId = roomInstance.playerReady(call.req, call.conn);

    call.succ({
        // playerId: playerId,
        // gameState: roomInstance.gameSystem.state
    })
}