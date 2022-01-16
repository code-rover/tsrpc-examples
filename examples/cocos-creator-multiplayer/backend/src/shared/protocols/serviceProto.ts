import { ServiceProto } from 'tsrpc-proto';
import { MsgClientInput } from './client/MsgClientInput';
import { ReqJoin, ResJoin } from './PtlJoin';
import { ReqReady, ResReady } from './PtlReady';
import { MsgFrame } from './server/MsgFrame';

export interface ServiceType {
    api: {
        "Join": {
            req: ReqJoin,
            res: ResJoin
        },
        "Ready": {
            req: ReqReady,
            res: ResReady
        }
    },
    msg: {
        "client/ClientInput": MsgClientInput,
        "server/Frame": MsgFrame
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 15,
    "services": [
        {
            "id": 0,
            "name": "client/ClientInput",
            "type": "msg"
        },
        {
            "id": 1,
            "name": "Join",
            "type": "api"
        },
        {
            "id": 3,
            "name": "Ready",
            "type": "api"
        },
        {
            "id": 2,
            "name": "server/Frame",
            "type": "msg"
        }
    ],
    "types": {
        "client/MsgClientInput/MsgClientInput": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "sn",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "inputs",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "client/MsgClientInput/ClientInput"
                        }
                    }
                }
            ]
        },
        "client/MsgClientInput/ClientInput": {
            "type": "Union",
            "members": [
                {
                    "id": 0,
                    "type": {
                        "target": {
                            "type": "Reference",
                            "target": "../game/GameSystem/PlayerMove"
                        },
                        "keys": [
                            "playerId"
                        ],
                        "type": "Omit"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "target": {
                            "type": "Reference",
                            "target": "../game/GameSystem/PlayerAttack"
                        },
                        "keys": [
                            "playerId"
                        ],
                        "type": "Omit"
                    }
                },
                {
                    "id": 2,
                    "type": {
                        "target": {
                            "type": "Reference",
                            "target": "../game/GameSystem/DoTask"
                        },
                        "keys": [
                            "playerId"
                        ],
                        "type": "Omit"
                    }
                }
            ]
        },
        "../game/GameSystem/PlayerMove": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "PlayerMove"
                    }
                },
                {
                    "id": 1,
                    "name": "playerId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "speed",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                },
                {
                    "id": 3,
                    "name": "dt",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../game/GameSystem/PlayerAttack": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "PlayerAttack"
                    }
                },
                {
                    "id": 1,
                    "name": "playerId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "targetPos",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                },
                {
                    "id": 3,
                    "name": "targetTime",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../game/GameSystem/DoTask": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "DoTask"
                    }
                },
                {
                    "id": 1,
                    "name": "taskId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "playerId",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "PtlJoin/ReqJoin": {
            "type": "Interface"
        },
        "PtlJoin/ResJoin": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "gameState",
                    "type": {
                        "type": "Reference",
                        "target": "../game/GameSystem/GameSystemState"
                    }
                }
            ]
        },
        "../game/GameSystem/GameSystemState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "now",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "players",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../game/state/PlayerState/PlayerState"
                        }
                    }
                },
                {
                    "id": 2,
                    "name": "arrows",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../game/state/ArrowState/ArrowState"
                        }
                    }
                },
                {
                    "id": 3,
                    "name": "nextArrowId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 4,
                    "name": "room",
                    "type": {
                        "type": "Reference",
                        "target": "../game/state/RoomState/RoomState"
                    }
                }
            ]
        },
        "../game/state/PlayerState/PlayerState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "id",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 4,
                    "name": "playerRole",
                    "type": {
                        "type": "Reference",
                        "target": "../game/EnumPlayerRole/EnumPlayerRole"
                    }
                },
                {
                    "id": 1,
                    "name": "pos",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                },
                {
                    "id": 3,
                    "name": "isReady",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 5,
                    "name": "isDead",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 6,
                    "name": "isOffline",
                    "type": {
                        "type": "Boolean"
                    }
                }
            ]
        },
        "../game/EnumPlayerRole/EnumPlayerRole": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                },
                {
                    "id": 2,
                    "value": 2
                },
                {
                    "id": 3,
                    "value": 3
                }
            ]
        },
        "../game/state/ArrowState/ArrowState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "id",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "fromPlayerId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "targetTime",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "targetPos",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "../game/state/RoomState/RoomState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 4,
                    "name": "id",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "state",
                    "type": {
                        "type": "Reference",
                        "target": "../game/EnumRoomState/EnumRoomState"
                    }
                },
                {
                    "id": 2,
                    "name": "taskProcess",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "isImposterWin",
                    "type": {
                        "type": "Boolean"
                    }
                }
            ]
        },
        "../game/EnumRoomState/EnumRoomState": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                },
                {
                    "id": 2,
                    "value": 2
                },
                {
                    "id": 3,
                    "value": 3
                },
                {
                    "id": 4,
                    "value": 4
                }
            ]
        },
        "PtlReady/ReqReady": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "isReady",
                    "type": {
                        "type": "Boolean"
                    }
                }
            ]
        },
        "PtlReady/ResReady": {
            "type": "Interface"
        },
        "server/MsgFrame/MsgFrame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "inputs",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../game/GameSystem/GameSystemInput"
                        }
                    }
                },
                {
                    "id": 1,
                    "name": "lastSn",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "../game/GameSystem/GameSystemInput": {
            "type": "Union",
            "members": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../game/GameSystem/PlayerMove"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "../game/GameSystem/PlayerAttack"
                    }
                },
                {
                    "id": 2,
                    "type": {
                        "type": "Reference",
                        "target": "../game/GameSystem/PlayerJoin"
                    }
                },
                {
                    "id": 5,
                    "type": {
                        "type": "Reference",
                        "target": "../game/GameSystem/PlayerReady"
                    }
                },
                {
                    "id": 7,
                    "type": {
                        "type": "Reference",
                        "target": "../game/GameSystem/Grouping"
                    }
                },
                {
                    "id": 6,
                    "type": {
                        "type": "Reference",
                        "target": "../game/GameSystem/GameStart"
                    }
                },
                {
                    "id": 8,
                    "type": {
                        "type": "Reference",
                        "target": "../game/GameSystem/DoTask"
                    }
                },
                {
                    "id": 3,
                    "type": {
                        "type": "Reference",
                        "target": "../game/GameSystem/PlayerLeave"
                    }
                },
                {
                    "id": 9,
                    "type": {
                        "type": "Reference",
                        "target": "../game/GameSystem/GameEnd"
                    }
                },
                {
                    "id": 4,
                    "type": {
                        "type": "Reference",
                        "target": "../game/GameSystem/TimePast"
                    }
                }
            ]
        },
        "../game/GameSystem/PlayerJoin": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "PlayerJoin"
                    }
                },
                {
                    "id": 1,
                    "name": "playerId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "pos",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "../game/GameSystem/PlayerReady": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "PlayerReady"
                    }
                },
                {
                    "id": 1,
                    "name": "playerId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "isReady",
                    "type": {
                        "type": "Boolean"
                    }
                }
            ]
        },
        "../game/GameSystem/Grouping": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "Grouping"
                    }
                },
                {
                    "id": 1,
                    "name": "groupResult",
                    "type": {
                        "type": "Interface",
                        "indexSignature": {
                            "keyType": "Number",
                            "type": {
                                "type": "Reference",
                                "target": "../game/EnumPlayerRole/EnumPlayerRole"
                            }
                        }
                    }
                }
            ]
        },
        "../game/GameSystem/GameStart": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "GameStart"
                    }
                }
            ]
        },
        "../game/GameSystem/PlayerLeave": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "PlayerLeave"
                    }
                },
                {
                    "id": 1,
                    "name": "playerId",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../game/GameSystem/GameEnd": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "GameEnd"
                    }
                },
                {
                    "id": 1,
                    "name": "isImposterWin",
                    "type": {
                        "type": "Boolean"
                    }
                }
            ]
        },
        "../game/GameSystem/TimePast": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "TimePast"
                    }
                },
                {
                    "id": 1,
                    "name": "dt",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        }
    }
};