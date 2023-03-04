import { Field } from "./field/schemas/field.schemas";

export type TFieldObj = Field
export type TPair_ = TPair
export type TPath_ = TPath


export type TPlayerDotsObj = {
    'areas': number, 'paths': number, 'square': number,
    'free': number, 'busy': number, 'caught': number,
    'closed': number, 'uncaught': number
};

export type TTitleObj = {
    currentPlayer: number, moveIndex: number,
    shareLink: string, players: string[]
}

export type TStatsObj = {
    "arr1": TPlayerDotsObj, "arr2": TPlayerDotsObj,
    "moves": TMove[], 'title': TTitleObj,
    'err': string, 'subscribers': number
}

export type TGameObj = {
  gameId: string;
    userId: string
}

export type TMoveObj = {
    currMove: TMove,
    prevMove: TMove
}

export type TUpdResObj = {
    is_accepted: boolean, 
    is_need2redraw: boolean,
    move: TMoveObj
}


export enum dotStates {
    nodot, // 0
    p1free, p2free, // 1-2
    p1busy, p2busy, // 3-4
    p1caught, p2caught, // 5-6
    p1closed, p2closed, // 7-8
    p1uncaught, p2uncaught, // 9-10
}
