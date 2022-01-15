import { ApiCallWs } from "tsrpc";
import { roomInstance } from "..";
import { ReqJoin, ResJoin } from "../shared/protocols/PtlJoin";

export async function ApiJoin(call: ApiCallWs<ReqJoin, ResJoin>) {
    if(roomInstance.isRoomFull()) {
        call.error("room is full");
        return;
    }

    let playerId = roomInstance.join(call.req, call.conn);

    if(playerId <= 0) {
        call.error("join room failed");
        return;
    }

    call.succ({
        playerId: playerId,
        gameState: roomInstance.gameSystem.state
    })
}