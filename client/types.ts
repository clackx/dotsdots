//import { Field } from "./field/schemas/field.schemas";

type TPair = [number, number];
type TPath = Array<TPair>;
type TField = Array<Array<number>>;

type TPathNum = {
    path: TPath;
    number: number;
}

type TMove = {
    move: TPair;
    number: number;
}

export declare class Field {
    matrix: TField;
    ame: string;
    paths: TPathNum[];
    areas: TPathNum[];
    moves: TMove[];
    current: number;
    players: Array<string>;
    squares: Array<number>;
}

export type TFieldObj = Field;
export type TPair_ = TPair;
export type TPath_ = TPath;
export type TPlayerDotsObj = {
    'areas': number;
    'paths': number;
    'square': number;
    'free': number;
    'busy': number;
    'caught': number;
    'closed': number;
    'uncaught': number;
};
export type TTitleObj = {
    currentPlayer: number;
    moveIndex: number;
    shareLink: string;
    players: string[];
};
export type TStatsObj = {
    "arr1": TPlayerDotsObj;
    "arr2": TPlayerDotsObj;
    "moves": TMove[];
    'title': TTitleObj;
    'err': string;
    'subscribers': number;
};
export type TGameObj = {
    gameId: string;
    userId: string;
};
export type TMoveObj = {
    currMove: TMove;
    prevMove: TMove;
};
export type TUpdResObj = {
    is_accepted: boolean;
    is_need2redraw: boolean;
    move: TMoveObj;
};
export declare enum dotStates {
    nodot = 0,
    p1free = 1,
    p2free = 2,
    p1busy = 3,
    p2busy = 4,
    p1caught = 5,
    p2caught = 6,
    p1closed = 7,
    p2closed = 8,
    p1uncaught = 9,
    p2uncaught = 10
}
