import { EnumPlayerRole } from "../EnumPlayerRole";
import { EnumRoomState } from "../EnumRoomState";

export interface RoomState {
    id: number,

    state: EnumRoomState

    taskProcess: number,

    isImposterWin: boolean

}