
    const schema = {
  "asyncapi": "3.1.0",
  "info": {
    "title": "Situation Game WebSocket API",
    "version": "1.0.0",
    "description": "API для управления игровым процессом в реальном времени."
  },
  "servers": {
    "local": {
      "host": "localhost:3000",
      "protocol": "ws",
      "pathname": "/ws"
    }
  },
  "channels": {
    "gameRoot": {
      "address": "/ws",
      "messages": {
        "joinGame": {
          "name": "JOIN_GAME",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "JOIN_GAME",
                "x-parser-schema-id": "<anonymous-schema-2>"
              },
              "data": {
                "type": "object",
                "properties": {
                  "gameId": {
                    "type": "string",
                    "format": "uuid",
                    "x-parser-schema-id": "<anonymous-schema-4>"
                  }
                },
                "required": [
                  "gameId"
                ],
                "x-parser-schema-id": "<anonymous-schema-3>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-1>"
          },
          "x-parser-unique-object-id": "joinGame"
        },
        "leaveGame": {
          "name": "LEAVE_GAME",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "LEAVE_GAME",
                "x-parser-schema-id": "<anonymous-schema-6>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-5>"
          },
          "x-parser-unique-object-id": "leaveGame"
        },
        "startGame": {
          "name": "START_GAME",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "START_GAME",
                "x-parser-schema-id": "<anonymous-schema-8>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-7>"
          },
          "x-parser-unique-object-id": "startGame"
        },
        "pickCard": {
          "name": "PICK_CARD",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "PICK_CARD",
                "x-parser-schema-id": "<anonymous-schema-10>"
              },
              "data": {
                "type": "object",
                "properties": {
                  "cardId": {
                    "type": "string",
                    "format": "uuid",
                    "x-parser-schema-id": "<anonymous-schema-12>"
                  },
                  "roundId": {
                    "type": "string",
                    "format": "uuid",
                    "x-parser-schema-id": "<anonymous-schema-13>"
                  }
                },
                "required": [
                  "cardId",
                  "roundId"
                ],
                "x-parser-schema-id": "<anonymous-schema-11>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-9>"
          },
          "x-parser-unique-object-id": "pickCard"
        },
        "vote": {
          "name": "VOTE",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "VOTE",
                "x-parser-schema-id": "<anonymous-schema-15>"
              },
              "data": {
                "type": "object",
                "properties": {
                  "targetUserId": {
                    "type": "string",
                    "format": "uuid",
                    "x-parser-schema-id": "<anonymous-schema-17>"
                  }
                },
                "required": [
                  "targetUserId"
                ],
                "x-parser-schema-id": "<anonymous-schema-16>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-14>"
          },
          "x-parser-unique-object-id": "vote"
        },
        "playerJoined": {
          "name": "PLAYER_JOINED",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "PLAYER_JOINED",
                "x-parser-schema-id": "<anonymous-schema-19>"
              },
              "data": {
                "type": "object",
                "properties": {
                  "userId": {
                    "type": "string",
                    "x-parser-schema-id": "<anonymous-schema-20>"
                  },
                  "nickname": {
                    "type": "string",
                    "x-parser-schema-id": "<anonymous-schema-21>"
                  },
                  "score": {
                    "type": "number",
                    "x-parser-schema-id": "<anonymous-schema-22>"
                  }
                },
                "x-parser-schema-id": "PlayerInfo"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-18>"
          },
          "x-parser-unique-object-id": "playerJoined"
        },
        "playerLeft": {
          "name": "PLAYER_LEFT",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "PLAYER_LEFT",
                "x-parser-schema-id": "<anonymous-schema-24>"
              },
              "data": {
                "type": "object",
                "properties": {
                  "userId": {
                    "type": "string",
                    "format": "uuid",
                    "x-parser-schema-id": "<anonymous-schema-26>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-25>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-23>"
          },
          "x-parser-unique-object-id": "playerLeft"
        },
        "playerVoted": {
          "name": "PLAYER_VOTED",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "PLAYER_VOTED",
                "x-parser-schema-id": "<anonymous-schema-28>"
              },
              "data": {
                "type": "object",
                "properties": {
                  "voterId": {
                    "type": "string",
                    "x-parser-schema-id": "<anonymous-schema-30>"
                  },
                  "targetUserId": {
                    "type": "string",
                    "x-parser-schema-id": "<anonymous-schema-31>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-29>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-27>"
          },
          "x-parser-unique-object-id": "playerVoted"
        },
        "gameStarted": {
          "name": "GAME_STARTED",
          "summary": "Начало раунда (первого или последующих)",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "GAME_STARTED",
                "x-parser-schema-id": "<anonymous-schema-33>"
              },
              "data": {
                "type": "object",
                "properties": {
                  "roundId": {
                    "type": "string",
                    "format": "uuid",
                    "x-parser-schema-id": "<anonymous-schema-35>"
                  },
                  "roundNumber": {
                    "type": "number",
                    "x-parser-schema-id": "<anonymous-schema-36>"
                  },
                  "situationText": {
                    "type": "string",
                    "x-parser-schema-id": "<anonymous-schema-37>"
                  },
                  "endsAt": {
                    "type": "string",
                    "format": "date-time",
                    "x-parser-schema-id": "<anonymous-schema-38>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-34>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-32>"
          },
          "x-parser-unique-object-id": "gameStarted"
        },
        "cardPicked": {
          "name": "CARD_PICKED",
          "summary": "Уведомление всем, что кто-то выбрал карту (без показа самой карты)",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "CARD_PICKED",
                "x-parser-schema-id": "<anonymous-schema-40>"
              },
              "data": {
                "type": "object",
                "properties": {
                  "userId": {
                    "type": "string",
                    "x-parser-schema-id": "<anonymous-schema-42>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-41>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-39>"
          },
          "x-parser-unique-object-id": "cardPicked"
        },
        "roundStageChanged": {
          "name": "ROUND_STAGE_CHANGED",
          "summary": "Смена стадии раунда или добор карт",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "ROUND_STAGE_CHANGED",
                "x-parser-schema-id": "<anonymous-schema-44>"
              },
              "data": {
                "type": "object",
                "properties": {
                  "status": {
                    "type": "string",
                    "enum": [
                      "PICKING",
                      "VOTING",
                      "SHOWING",
                      "FINISHED"
                    ],
                    "x-parser-schema-id": "<anonymous-schema-46>"
                  },
                  "hand": {
                    "type": "array",
                    "description": "Присылается персонально игроку в начале стадии PICKING",
                    "items": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "x-parser-schema-id": "<anonymous-schema-48>"
                        },
                        "url": {
                          "type": "string",
                          "x-parser-schema-id": "<anonymous-schema-49>"
                        }
                      },
                      "x-parser-schema-id": "Card"
                    },
                    "x-parser-schema-id": "<anonymous-schema-47>"
                  },
                  "moves": {
                    "type": "array",
                    "description": "Присылается в стадии VOTING (все выбранные карты)",
                    "items": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "x-parser-schema-id": "<anonymous-schema-51>"
                        },
                        "userId": {
                          "type": "string",
                          "x-parser-schema-id": "<anonymous-schema-52>"
                        },
                        "card": "$ref:$.channels.gameRoot.messages.roundStageChanged.payload.properties.data.properties.hand.items"
                      },
                      "x-parser-schema-id": "PlayerMove"
                    },
                    "x-parser-schema-id": "<anonymous-schema-50>"
                  },
                  "winnerId": {
                    "type": "string",
                    "description": "Присылается в конце раунда (FINISHED)",
                    "x-parser-schema-id": "<anonymous-schema-53>"
                  },
                  "players": {
                    "type": "array",
                    "description": "Обновленный список игроков со счетом",
                    "items": "$ref:$.channels.gameRoot.messages.playerJoined.payload.properties.data",
                    "x-parser-schema-id": "<anonymous-schema-54>"
                  },
                  "finalScores": {
                    "type": "array",
                    "description": "Присылается только при окончании всей игры",
                    "items": "$ref:$.channels.gameRoot.messages.playerJoined.payload.properties.data",
                    "x-parser-schema-id": "<anonymous-schema-55>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-45>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-43>"
          },
          "x-parser-unique-object-id": "roundStageChanged"
        },
        "playerReconnected": {
          "name": "PLAYER_RECONNECTED",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "PLAYER_RECONNECTED",
                "x-parser-schema-id": "<anonymous-schema-57>"
              },
              "data": {
                "type": "object",
                "properties": {
                  "gameId": {
                    "type": "string",
                    "x-parser-schema-id": "<anonymous-schema-59>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-58>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-56>"
          },
          "x-parser-unique-object-id": "playerReconnected"
        },
        "errorEvent": {
          "name": "ERROR",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "ERROR",
                "x-parser-schema-id": "<anonymous-schema-61>"
              },
              "data": {
                "type": "string",
                "x-parser-schema-id": "<anonymous-schema-62>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-60>"
          },
          "x-parser-unique-object-id": "errorEvent"
        }
      },
      "bindings": {
        "ws": {
          "query": {
            "type": "object",
            "properties": {
              "token": {
                "type": "string",
                "description": "JWT Access Token"
              }
            },
            "required": [
              "token"
            ]
          }
        }
      },
      "x-parser-unique-object-id": "gameRoot"
    }
  },
  "operations": {
    "serverReceive": {
      "action": "receive",
      "channel": "$ref:$.channels.gameRoot",
      "messages": [
        "$ref:$.channels.gameRoot.messages.joinGame",
        "$ref:$.channels.gameRoot.messages.leaveGame",
        "$ref:$.channels.gameRoot.messages.startGame",
        "$ref:$.channels.gameRoot.messages.pickCard",
        "$ref:$.channels.gameRoot.messages.vote"
      ],
      "x-parser-unique-object-id": "serverReceive"
    },
    "serverSend": {
      "action": "send",
      "channel": "$ref:$.channels.gameRoot",
      "messages": [
        "$ref:$.channels.gameRoot.messages.playerJoined",
        "$ref:$.channels.gameRoot.messages.playerLeft",
        "$ref:$.channels.gameRoot.messages.playerVoted",
        "$ref:$.channels.gameRoot.messages.gameStarted",
        "$ref:$.channels.gameRoot.messages.cardPicked",
        "$ref:$.channels.gameRoot.messages.roundStageChanged",
        "$ref:$.channels.gameRoot.messages.playerReconnected",
        "$ref:$.channels.gameRoot.messages.errorEvent"
      ],
      "x-parser-unique-object-id": "serverSend"
    }
  },
  "components": {
    "messages": {
      "joinGame": "$ref:$.channels.gameRoot.messages.joinGame",
      "leaveGame": "$ref:$.channels.gameRoot.messages.leaveGame",
      "startGame": "$ref:$.channels.gameRoot.messages.startGame",
      "pickCard": "$ref:$.channels.gameRoot.messages.pickCard",
      "vote": "$ref:$.channels.gameRoot.messages.vote",
      "playerJoined": "$ref:$.channels.gameRoot.messages.playerJoined",
      "playerLeft": "$ref:$.channels.gameRoot.messages.playerLeft",
      "playerVoted": "$ref:$.channels.gameRoot.messages.playerVoted",
      "gameStarted": "$ref:$.channels.gameRoot.messages.gameStarted",
      "cardPicked": "$ref:$.channels.gameRoot.messages.cardPicked",
      "roundStageChanged": "$ref:$.channels.gameRoot.messages.roundStageChanged",
      "playerReconnected": "$ref:$.channels.gameRoot.messages.playerReconnected",
      "errorEvent": "$ref:$.channels.gameRoot.messages.errorEvent"
    },
    "schemas": {
      "PlayerInfo": "$ref:$.channels.gameRoot.messages.playerJoined.payload.properties.data",
      "Card": "$ref:$.channels.gameRoot.messages.roundStageChanged.payload.properties.data.properties.hand.items",
      "PlayerMove": "$ref:$.channels.gameRoot.messages.roundStageChanged.payload.properties.data.properties.moves.items"
    }
  },
  "x-parser-spec-parsed": true,
  "x-parser-api-version": 3,
  "x-parser-spec-stringified": true
};
    const config = {"show":{"sidebar":true},"sidebar":{"showOperations":"byDefault"}};
    const appRoot = document.getElementById('root');
    AsyncApiStandalone.render(
        { schema, config, }, appRoot
    );
  