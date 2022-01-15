import { WsConnection, WsServer } from "tsrpc";
import { EnumPlayerRole } from "../shared/game/EnumPlayerRole";
import { gameConfig } from "../shared/game/gameConfig";
import { DoTask, GameStart, GameSystem, GameSystemInput, Grouping, PlayerJoin, PlayerReady } from "../shared/game/GameSystem";
import { ReqJoin } from "../shared/protocols/PtlJoin";
import { ReqReady } from "../shared/protocols/PtlReady";
import { ServiceType } from "../shared/protocols/serviceProto";
import { EnumRoomState } from "../shared/game/EnumRoomState";

/**
 * 服务端 - 房间 - 逻辑系统
 */
export class Room {

    //房间最大人数
    maxPlayerNum: number = 4;

    //房间状态机
    roomState: EnumRoomState = EnumRoomState.Init;

    //房间最大任务数
    maxTaskProcess: number = 10;

    // 帧同步频率，次数/秒
    syncRate = gameConfig.syncRate;
    nextPlayerId = 1;

    gameSystem = new GameSystem();

    server: WsServer<ServiceType>;
    conns: WsConnection<ServiceType>[] = [];
    pendingInputs: GameSystemInput[] = [];
    playerLastSn: { [playerId: number]: number | undefined } = {};
    lastSyncTime?: number;

    constructor(server: WsServer<ServiceType>) {
        this.server = server;
        setInterval(() => { this.sync() }, 1000 / this.syncRate);
    }

    /**
     *  房间已满
     */
    isRoomFull() :boolean {
        return this.gameSystem.state.players.length == this.maxPlayerNum;
    }

    /**
     * 是否所有人都准备就绪
     * @returns 
     */
    isAllPlayersReady() :boolean {
        for(var i = 0; i < this.gameSystem.state.players.length; i++) {
            if(this.gameSystem.state.players[i].isReady == false) {
                return false;
            }
        }
        return true;
    }

    /**
     *  玩家准备
     * @param req 
     */
    playerReady(req:　ReqReady, conn: WsConnection<ServiceType>) {
        console.log("playerReady");

        let player = this.gameSystem.state.players.find(v => v.id === conn.playerId);
        if(!player) {
            return;
        }

        player.isReady = req.isReady;

        let input: PlayerReady = {
            type: 'PlayerReady',
            playerId: player.id,
            isReady: player.isReady
        }
        this.applyInput(input);

        //可以开始游戏了
        if(req.isReady && this.isRoomFull() && this.isAllPlayersReady()) {
            this.roomState = EnumRoomState.Start;
            
            let input: Grouping = {
                type: 'Grouping',
                groupResult: this.doGrouping(),
            }
            this.applyInput(input);

            // let input: GameStart = {
            //     type: 'GameStart',
            // }
            // this.applyInput(input);
        }

    }




    /**
     * 分组逻辑
     * @returns 
     */
    private doGrouping(): {[playerId: number]: EnumPlayerRole} {
        let groupResult: {[playerId: number]: EnumPlayerRole} = {}

        let rand = Math.round(Math.random() * this.maxPlayerNum) % this.maxPlayerNum;
        let players = this.gameSystem.state.players;
        for(var i = 0; i < players.length; i++) {
            groupResult[players[i].id] = (i == rand) ? EnumPlayerRole.Impostor : EnumPlayerRole.Crewmate;
        }

        return groupResult;
    }

    /** 加入房间 */
    join(req: ReqJoin, conn: WsConnection<ServiceType>) :number {
        if(this.isRoomFull()) {
            return 0;
        }
        let input: PlayerJoin = {
            type: 'PlayerJoin',
            playerId: this.nextPlayerId++,
            // 初始位置随机
            pos: {
                x: Math.random() * 10 - 5,
                y: Math.random() * 10 - 5
            }
        }
        this.applyInput(input);

        this.conns.push(conn);
        conn.playerId = input.playerId;
        conn.listenMsg('client/ClientInput', call => {
            this.playerLastSn[input.playerId] = call.msg.sn;
            call.msg.inputs.forEach(v => {
                this.applyInput({
                    ...v,
                    playerId: input.playerId
                });
            })
        });

        return input.playerId;
    }

    applyInput(input: GameSystemInput) {
        this.pendingInputs.push(input);
    }

    sync() {
        let inputs = this.pendingInputs;
        this.pendingInputs = [];

        // Apply inputs
        inputs.forEach(v => {
            this.gameSystem.applyInput(v)
        });

        // Apply TimePast
        let now = process.uptime() * 1000;
        this.applyInput({
            type: 'TimePast',
            dt: now - (this.lastSyncTime ?? now)
        });
        this.lastSyncTime = now;

        // 发送同步帧
        this.conns.forEach(v => {
            v.sendMsg('server/Frame', {
                inputs: inputs,
                lastSn: this.playerLastSn[v.playerId!]
            })
        });
    }

    /** 离开房间 */
    leave(playerId: number, conn: WsConnection<ServiceType>) {
        this.conns.removeOne(v => v.playerId === playerId);
        this.applyInput({
            type: 'PlayerLeave',
            playerId: playerId
        });
    }
}

declare module 'tsrpc' {
    export interface WsConnection {
        playerId?: number;
    }
}