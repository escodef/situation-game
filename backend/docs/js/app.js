
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
          "summary": "Игрок запрашивает вход в комнату",
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
        "startGame": {
          "name": "START_GAME",
          "summary": "Запуск начала игры",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "START_GAME",
                "x-parser-schema-id": "<anonymous-schema-6>"
              },
              "data": {
                "type": "object",
                "x-parser-schema-id": "<anonymous-schema-7>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-5>"
          },
          "x-parser-unique-object-id": "startGame"
        },
        "playerJoined": {
          "name": "PLAYER_JOINED",
          "summary": "Уведомление о том, что игрок подключился",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "PLAYER_JOINED",
                "x-parser-schema-id": "<anonymous-schema-9>"
              },
              "data": {
                "type": "object",
                "properties": {
                  "userId": {
                    "type": "string",
                    "x-parser-schema-id": "<anonymous-schema-10>"
                  },
                  "nickname": {
                    "type": "string",
                    "x-parser-schema-id": "<anonymous-schema-11>"
                  },
                  "score": {
                    "type": "number",
                    "x-parser-schema-id": "<anonymous-schema-12>"
                  }
                },
                "x-parser-schema-id": "PlayerInfo"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-8>"
          },
          "x-parser-unique-object-id": "playerJoined"
        },
        "errorEvent": {
          "name": "ERROR",
          "summary": "Сообщение об ошибке",
          "payload": {
            "type": "object",
            "properties": {
              "event": {
                "const": "ERROR",
                "x-parser-schema-id": "<anonymous-schema-14>"
              },
              "data": {
                "type": "string",
                "x-parser-schema-id": "<anonymous-schema-15>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-13>"
          },
          "x-parser-unique-object-id": "errorEvent"
        }
      },
      "bindings": {
        "ws": {
          "query": {
            "type": "object",
            "properties": {
              "userId": {
                "type": "string"
              },
              "token": {
                "type": "string"
              }
            },
            "required": [
              "userId",
              "token"
            ]
          }
        }
      },
      "x-parser-unique-object-id": "gameRoot"
    }
  },
  "operations": {
    "receiveMessages": {
      "action": "receive",
      "channel": "$ref:$.channels.gameRoot",
      "messages": [
        "$ref:$.channels.gameRoot.messages.joinGame",
        "$ref:$.channels.gameRoot.messages.startGame"
      ],
      "x-parser-unique-object-id": "receiveMessages"
    },
    "sendEvents": {
      "action": "send",
      "channel": "$ref:$.channels.gameRoot",
      "messages": [
        "$ref:$.channels.gameRoot.messages.playerJoined",
        "$ref:$.channels.gameRoot.messages.errorEvent"
      ],
      "x-parser-unique-object-id": "sendEvents"
    }
  },
  "components": {
    "messages": {
      "joinGame": "$ref:$.channels.gameRoot.messages.joinGame",
      "startGame": "$ref:$.channels.gameRoot.messages.startGame",
      "playerJoined": "$ref:$.channels.gameRoot.messages.playerJoined",
      "errorEvent": "$ref:$.channels.gameRoot.messages.errorEvent"
    },
    "schemas": {
      "PlayerInfo": "$ref:$.channels.gameRoot.messages.playerJoined.payload.properties.data"
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
  