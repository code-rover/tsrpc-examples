
import { Button, Color, Component, instantiate, LabelComponent, MeshRenderer, Node, Prefab, ProgressBarComponent, random, randomRangeInt, UIOpacity, Vec2, _decorator } from 'cc';
import { Arrow } from '../../prefabs/Arrow/Arrow';
import { Joystick } from '../../prefabs/Joystick/Joystick';
import { Player } from '../../prefabs/Player/Player';
import { FollowCamera } from '../../scripts/components/FollowCamera';
import { GameManager } from '../../scripts/models/GameManager';
import { gameConfig } from '../../scripts/shared/game/gameConfig';
import { ArrowState } from '../../scripts/shared/game/state/ArrowState';

import * as fgui from "fairygui-cc"
import { EnumPlayerRole } from '../../scripts/shared/game/EnumPlayerRole';
import { EnumRoomState } from '../../scripts/shared/game/EnumRoomState';

const { ccclass, property } = _decorator;

@ccclass('GameScene')
export class GameScene extends Component {

    @property(Joystick)
    joyStick!: Joystick;

    @property(Prefab)
    prefabPlayer!: Prefab;
    @property(Prefab)
    prefabArrow!: Prefab;

    @property(Node)
    players!: Node;
    @property(Node)
    arrows!: Node;

    @property(FollowCamera)
    camera: FollowCamera = null as any;

    @property(Node)
    btnReady: Node = null as any;

    @property(Node)
    btnAttack: Node = null as any;

    @property(Node)
    btnDoTask: Node = null as any;

    @property(Node)
    attackPosIndicator!: Node;
    
    @property(LabelComponent)
    lbPlayerInfo_1!: LabelComponent;
    @property(LabelComponent)
    lbPlayerInfo_2!: LabelComponent;
    @property(LabelComponent)
    lbPlayerInfo_3!: LabelComponent;
    @property(LabelComponent)
    lbPlayerInfo_4!: LabelComponent;

    @property(ProgressBarComponent)
    barTaskProcess!: ProgressBarComponent;

    @property(LabelComponent)
    lbGameStart!: LabelComponent;

    gameManager!: GameManager;

    private _playerInstances: { [playerId: number]: Player | undefined } = {};
    private _arrowInstances: { [arrowId: number]: Arrow | undefined } = {};
    private _selfSpeed?: Vec2 = new Vec2(0, 0);

    private _playerInfoNodeMap: { [playerId: number]: number } = {};

    private _playerInfoNodeArray :LabelComponent[] =  []
    private _playerInfoNodeUsedArray :boolean[] = [false, false, false, false]

    private _groupingStateFlag = false;
    private _startStateFlag = false;

    onLoad() {
        (window as any).game = this;

        //任务按钮默认关闭
        this.btnDoTask.active = false;
        this.btnAttack.active = true;
        this.lbGameStart._enabled = false;

        this.attackPosIndicator.getComponent(MeshRenderer)!.material!.setProperty('mainColor', Color.CYAN);
        this._playerInfoNodeArray = [this.lbPlayerInfo_1, this.lbPlayerInfo_2, this.lbPlayerInfo_3, this.lbPlayerInfo_4];

        // 初始化摇杆
        this.joyStick.options = {
            onOperate: v => {
                if (!this._selfSpeed) {
                    this._selfSpeed = new Vec2;
                }
                this._selfSpeed.set(v.x, v.y);
            },
            onOperateEnd: () => {
                this._selfSpeed = undefined;
            }
        }

        this.gameManager = new GameManager();

        // 监听数据状态事件
        // 新箭矢发射（仅表现）
        this.gameManager.gameSystem.onNewArrow.push(v => { this._onNewArrow(v) });

        // 断线 2 秒后自动重连
        this.gameManager.client.flows.postDisconnectFlow.push(v => {
            setTimeout(() => {
                this.gameManager.join();
            }, 2000)
            return v;
        });

        this.gameManager.join();
    }

    update(dt: number) {
        this.gameManager.localTimePast();

        // Send Inputs
        if (this._selfSpeed && this._selfSpeed.lengthSqr()) {
            this._selfSpeed.normalize().multiplyScalar(gameConfig.moveSpeed);
            this.gameManager.sendClientInput({
                type: 'PlayerMove',
                speed: {
                    x: this._selfSpeed.x,
                    y: this._selfSpeed.y
                },
                dt: dt
            })
        }

        this._updatePlayers();

        this._updateAttackIndicator();

        this._updateUIInfo();
    }

    private _updatePlayers() {
        // Update pos
        let playerStates = this.gameManager.state.players;
        for (let playerState of playerStates) {
            let player = this._playerInstances[playerState.id];
            // 场景上还没有这个 Player，新建之
            if (!player) {
                let node = instantiate(this.prefabPlayer);
                this.players.addChild(node);
                player = this._playerInstances[playerState.id] = node.getComponent(Player)!;
                player.init(playerState, playerState.id === this.gameManager.selfPlayerId)

                for(var i = 0; i < 4; i++) {
                    if(this._playerInfoNodeUsedArray[i] == false) {
                        this._playerInfoNodeUsedArray[i] = true;
                        this._playerInfoNodeMap[playerState.id] = i;
                        break;
                    }

                }
                 
                // 摄像机拍摄自己
                if (playerState.id === this.gameManager.selfPlayerId) {
                    this.camera.focusTarget = node;
                }
            }

            let lableIdx: number = this._playerInfoNodeMap[playerState.id];
            if(lableIdx !== undefined && lableIdx >= 0 && lableIdx < this._playerInfoNodeArray.length) {
                let lbNode: LabelComponent = this._playerInfoNodeArray[lableIdx];
                if(lbNode) {
                    let readyState: string = playerState.isReady ? "ready" : "not ready";

                    lbNode.string = "ID: " + playerState.id + "  " + readyState + " role: " + playerState.playerRole;
                    if(this.gameManager.selfPlayerId == playerState.id) {
                        lbNode.color = new Color(214, 132, 53, 255);
                    }
                }
            }

            // 根据最新状态，更新 Player 表现组件
            player.updateState(playerState, this.gameManager.state.now);
        }

        // Clear left players
        for (let i = this.players.children.length - 1; i > -1; --i) {
            let player = this.players.children[i].getComponent(Player)!;
            if (!this.gameManager.state.players.find(v => v.id === player.playerId)) {
                player.node.removeFromParent();
                delete this._playerInstances[player.playerId];

                for(var idx = 0; idx < 4; idx++) {
                    if(this._playerInfoNodeMap[player.playerId] == idx) {
                        this._playerInfoNodeUsedArray[idx] = false;
                        delete this._playerInfoNodeMap[player.playerId];
                        this._playerInfoNodeArray[idx].string = "ID: -";
                    }
                }
            }
        }
    }

    private _onNewArrow(arrowState: ArrowState) {
        let arrow = this._arrowInstances[arrowState.id];
        // 已经存在
        if (arrow) {
            return;
        }

        let playerState = this.gameManager.state.players.find(v => v.id === arrowState.fromPlayerId);
        if (!playerState) {
            return;
        }
        let playerNode = this._playerInstances[playerState.id]?.node;
        if (!playerNode) {
            return;
        }

        // 创建新的箭矢显示
        let node = instantiate(this.prefabArrow);
        this.arrows.addChild(node);
        arrow = this._arrowInstances[arrowState.id] = node.getComponent(Arrow)!;
        arrow.init(arrowState, playerNode.position, this.gameManager.state.now);
    }

    onBtnReady() {
        let playerState = this.gameManager.state.players.find(v => v.id === this.gameManager.selfPlayerId);
        if (!playerState) {
            return;
        }

        let playerNode = this._playerInstances[this.gameManager.selfPlayerId]?.node;
        if (!playerNode) {
            return;
        }
        
        this.btnReady.getComponent(UIOpacity)!.opacity = 0;

        playerNode.getComponent(Player)?.setReady(true);

        this.gameManager.ready();

        
    }

    onBtnAttack() {
        let playerState = this.gameManager.state.players.find(v => v.id === this.gameManager.selfPlayerId);
        if (!playerState) {
            return;
        }

        let playerNode = this._playerInstances[this.gameManager.selfPlayerId]?.node;
        if (!playerNode) {
            return;
        }

        // 攻击落点偏移（表现层坐标）
        let sceneOffset = playerNode.forward.clone().normalize().multiplyScalar(gameConfig.arrowDistance);
        // 攻击落点（逻辑层坐标）
        let targetPos = new Vec2(playerState.pos.x, playerState.pos.y).add2f(sceneOffset.x, -sceneOffset.z);

        // 发送输入
        this.gameManager.sendClientInput({
            type: 'PlayerAttack',
            // 显示坐标 —> 逻辑坐标
            targetPos: { x: targetPos.x, y: targetPos.y },
            targetTime: this.gameManager.state.now + gameConfig.arrowFlyTime
        })

        // 冷却时间 1 秒
        this.btnAttack.getComponent(Button)!.interactable = false;
        this.btnAttack.getComponent(UIOpacity)!.opacity = 120;
        this.scheduleOnce(() => {
            this.btnAttack.getComponent(Button)!.interactable = true;
            this.btnAttack.getComponent(UIOpacity)!.opacity = 255;
        }, 1)

    }

    onBtnDoTask() {
        let playerState = this.gameManager.state.players.find(v => v.id === this.gameManager.selfPlayerId);
        if (!playerState) {
            return;
        }

        let playerNode = this._playerInstances[this.gameManager.selfPlayerId]?.node;
        if (!playerNode) {
            return;
        }

        // 发送输入
        this.gameManager.sendClientInput({
            type: 'DoTask',
            taskId: randomRangeInt(1, 11)
        })
    }    

    private _updateAttackIndicator() {
        let playerState = this.gameManager.state.players.find(v => v.id === this.gameManager.selfPlayerId);
        if (!playerState) {
            return;
        }

        let playerNode = this._playerInstances[this.gameManager.selfPlayerId]?.node;
        if (!playerNode) {
            return;
        }

        // 攻击落点位置（表现层坐标）
        let sceneTargetPos = playerNode.position.clone().add(playerNode.forward.clone().normalize().multiplyScalar(gameConfig.arrowDistance));
        this.attackPosIndicator.setPosition(sceneTargetPos.x, 0.1, sceneTargetPos.z);
    }

    private _updateUIInfo() {
        let playerState = this.gameManager.state.players.find(v => v.id === this.gameManager.selfPlayerId);
        if (!playerState) {
            return;
        }

        //update button state
        if(playerState.playerRole == EnumPlayerRole.Impostor) {
            this.btnDoTask.active = false;
            this.btnAttack.active = true;

        } else if(playerState.playerRole != EnumPlayerRole.Init) {
            this.btnDoTask.active = true;
            this.btnAttack.active = false;
        }


        let taskFinishNum: number = 0;
        
        this.gameManager.state.room.taskProcess.forEach((v) => {
            taskFinishNum += (v == true) ? 1 : 0;
        })

        this.barTaskProcess.progress = taskFinishNum / 10;

        if(!this._groupingStateFlag && !this._groupingStateFlag && this.gameManager.state.room.state == EnumRoomState.Grouping) {
            this._groupingStateFlag = true;
            this.lbGameStart.string = "Grouping ...";
            this.lbGameStart.enabled = true;

            // let counter = 5;
            // this.schedule(() => {
            //     this.lbGameStart.string = counter.toString()
            //     counter--
            // }, 1, 5)    
        }

        if(!this._startStateFlag && this._groupingStateFlag && this.gameManager.state.room.state == EnumRoomState.Start) {
            this._startStateFlag = true;

            this.lbGameStart.enabled = true;
            this.lbGameStart.string = "Game Start";

            this.scheduleOnce(()=>{
                this.lbGameStart.enabled = false;
            }, 4)
        }

    }
}