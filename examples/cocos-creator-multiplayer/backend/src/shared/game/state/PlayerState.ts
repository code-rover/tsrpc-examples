import { EnumPlayerRole } from "../EnumPlayerRole";

export interface PlayerState {
    id: number,

    // 玩家角色
    playerRole: EnumPlayerRole,

    // 位置
    pos: { x: number, y: number },

    isReady: boolean,
    
    // 晕眩结束时间
    dizzyEndTime?: number,
}