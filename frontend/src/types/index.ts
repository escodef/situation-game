export enum EGameStatus {
  WAITING = 'WAITING',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
}

export enum ERoundStatus {
  PICKING = 'PICKING',
  VOTING = 'VOTING',
  SHOWING = 'SHOWING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
}

export enum ESocketIncomeEvent {
  JOIN_GAME = 'JOIN_GAME',
  START_GAME = 'START_GAME',
  PICK_CARD = 'PICK_CARD',
  VOTE = 'VOTE',
  LEAVE_GAME = 'LEAVE_GAME',
}

export enum ESocketOutcomeEvent {
  CARD_PICKED = 'CARD_PICKED',
  GAME_STATE = 'GAME_STATE',
  PLAYER_JOINED = 'PLAYER_JOINED',
  PLAYER_LEFT = 'PLAYER_LEFT',
  PLAYER_VOTED = 'PLAYER_VOTED',
  PLAYER_DISCONNECTED = 'PLAYER_DISCONNECTED',
  PLAYER_RECONNECTED = 'PLAYER_RECONNECTED',
  GAME_STARTED = 'GAME_STARTED',
  GAME_PAUSED = 'GAME_PAUSED',
  GAME_RESUMED = 'GAME_RESUMED',
  ROUND_STAGE_CHANGED = 'ROUND_STAGE_CHANGED',
  ERROR = 'ERROR',
}

export interface IUser {
  id: string;
  nickname: string;
  email: string;
  score: number;
  gameId?: string | null;
  roles?: string[];
}

export interface ICard {
  id: string;
  url: string;
}

export interface IPlayerMove {
  roundId: string;
  userId: string;
  cardId: string;
  card?: {
    url: string;
  };
}

export interface IGameRound {
  id: string;
  gameId: string;
  roundNumber: number;
  situationId: string;
  status: ERoundStatus;
  endsAt: string | Date;
  situation?: {
    text: string;
  };
}

export interface IGame {
  id: string;
  code: string;
  ownerId: string;
  status: EGameStatus;
  maxPlayers: number;
  maxRounds: number;
  isOpen: boolean;
  createdAt: string;
  players?: { id: string; nickname: string; score: number }[];
  rounds?: IGameRound[];
}

export interface ISituationPack {
  id: string;
  name: string;
}

export interface ICardPack {
  id: string;
  name: string;
}