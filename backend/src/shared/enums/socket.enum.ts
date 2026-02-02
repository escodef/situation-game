export enum ESocketIncomeEvent {
    JOIN_ROOM = 'JOIN_ROOM',
    START_GAME = 'START_GAME',
    PICK_CARD = 'PICK_CARD',
    VOTE = 'VOTE',
}

export enum ESocketOutcomeEvent {
    PLAYER_JOINED = 'PLAYER_JOINED',
    GAME_STARTED = 'GAME_STARTED',
    ROUND_STAGE_CHANGED = 'ROUND_STAGE_CHANGED',
    ERROR = 'ERROR',
}
