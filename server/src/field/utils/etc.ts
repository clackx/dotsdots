import { TPlayerDotsObj, TTitleObj, TStatsObj, dotStates as ds } from "src/exp-types";
import { Field } from "../schemas/field.schemas";

export const columnsCount = 26;
export const rowsCount = 20;

export function initField(userId: string) {

    const matrix = Array(columnsCount).fill(null)
        .map(() => Array(rowsCount).fill(0));

    matrix[9][7] = 1;  // p1 starting dots
    matrix[10][8] = 1;
    matrix[11][9] = 1;

    matrix[14][9] = 2; // p2 starting dots
    matrix[15][8] = 2;
    matrix[16][7] = 2;

    const current = 2
    const players = [userId]
    const squares = [0, 0, 0]

    return { matrix, current, players, squares }
}



export function getStats(field: Field) {

    const initial: TPlayerDotsObj = {
        'areas': 0, 'paths': 0,
        'free': 0, 'busy': 0,
        'caught': 0, 'closed': 0,
        'uncaught': 0, 'square': 0,
    };

    const arr1 = { ...initial };
    const arr2 = { ...initial };

    field.areas.forEach(element => {
        element.number == 1 && (arr1.areas += 1)
        element.number == 2 && (arr2.areas += 1)
    });
    field.paths.forEach(element => {
        element.number == 1 && (arr1.paths += 1)
        element.number == 2 && (arr2.paths += 1)
    });
    field.matrix.forEach((row: number[]) => {
        row.forEach(element => {
            element == ds.p1free && (arr1.free += 1)
            element == ds.p2free && (arr2.free += 1)
            element == ds.p1busy && (arr1.busy += 1)
            element == ds.p2busy && (arr2.busy += 1)
            element == ds.p1caught && (arr1.caught += 1)
            element == ds.p2caught && (arr2.caught += 1)
            element == ds.p1closed && (arr1.closed += 1)
            element == ds.p2closed && (arr2.closed += 1)
            element == ds.p1uncaught && (arr1.uncaught += 1)
            element == ds.p2uncaught && (arr2.uncaught += 1)
        });
    });
    const moves = field.moves;
    const moveIndex = moves.length;
    const squares = field.squares;
    const currentPlayer = field.current;
    const players = field.players;

    arr1.square = squares[1];
    arr2.square = squares[2];

    const title: TTitleObj = { currentPlayer, moveIndex, shareLink: '', players }
    const result: TStatsObj = { arr1, arr2, moves, title, err: '', subscribers: 0 }

    return result
}