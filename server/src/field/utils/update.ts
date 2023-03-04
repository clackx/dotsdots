import { Logger } from "@nestjs/common";
import { TFieldObj, TMoveObj, TUpdResObj } from "src/exp-types";
import { rowsCount, columnsCount } from './etc';

export function update(field: TFieldObj, userId: string, [x0, y0]: TPair): TUpdResObj {
    const logger: Logger = new Logger('_UpdateUtil_');

    const [x, y] = [Number(x0), Number(y0)];
    const startingDot: TPair = [x, y];

    const players = field.players;
    let current = field.current;
    let is_accepted = false;
    let is_need2redraw = false;

    // Если userid не текущего игрока, update не происходит
    if (players[current - 1] !== userId) {
        logger.log(`┆ user ${userId}: update is not allowed`)
        return { is_accepted, is_need2redraw, move: undefined };
    }

    // Под именем number понимается номер игрока, первый или второй.
    // Далее number и current по смыслу равнозначны.
    const number = current;
    // Если matrix[x][y] == 1 то это "свободная" точка первого икрока; если 2, то второго. 
    // Далее 3-4 — это "занятые" точки соответсвенно первого и второго игрока,
    // 5-6 — "пойманные", 7-8 — "закрытые" внутри своей области, 
    // 9-10 — "освобождённые". 0 — нет точки. Записано в enum dotStates.

    if (field.matrix[x][y] == 0) {         // если нет точки
        field.matrix[x][y] = current;      // устанавливается в number
        current = current == 1 ? 2 : 1;    // shift current
        field.current = current;
        field.moves = [...field.moves, { move: [x, y], number }]
        is_accepted = true;
    }

    // Точка установлена, можно приступить к поиску области "окружения".
    // Если такая находится, то проверяется на наличие внутри точек соперника.
    // Функции описаны более подробно в теле функции.

    // Из всех точек, имеющих отношение к нашей точки находим "богатые"
    const dotsArray = getRichDots(field.matrix, startingDot, number);
    if (dotsArray.length > 3) {
        // Находим путь (или периметр), окружающий все найденные точки
        const totalPath = findClockwisePath(field.matrix, dotsArray, number);
        // Если в найденном пути нет нашей точки, то ничего существенно не изменилось
        if (isPairInArray(totalPath, startingDot)) {
            // иначе выполняем прунинг (сокращение) пути.
            const prunedPath = prunePath(totalPath, startingDot)
            // Если внутри сокращённого пути есть точки соперника
            if (findAliens(field.matrix, prunedPath, number)) {
                // то можно искать путь окружения (штриховки),
                // вычитая найденный путь из имеющихся областей
                let index = findCrossPath(field.areas, prunedPath, number)
                let newPath = prunedPath;

                // Повторяется, пока есть общие области
                while (index > -1) {
                    // вычитаем предыдущий newPath
                    const oldAreaPath = field.areas[index].path
                    newPath = updatedPath(oldAreaPath, newPath);
                    // удаляем и ищем новый
                    field.areas.splice(index, 1);
                    index = findCrossPath(field.areas, newPath, number);
                }

                // записываем результаты в объект field
                saveResults(field, prunedPath, newPath, number);
                is_need2redraw = true;

                logger.log(`┆ user ${userId}: insert path of length ${newPath.length}`)
            }
        }
    }

    const prevMove = field.moves.length > 2 ? field.moves[field.moves.length - 3] : undefined
    const move: TMoveObj = { currMove: { move: [x, y], number }, prevMove }
    const result: TUpdResObj = { is_accepted, is_need2redraw, move };
    return result;
}


function getNeighbours(pair: TPair): TPair[] {
    // return all of 8 neighbours (x,y coordinates of dots (x,y pairs)
    // that surround a given dot) from left upper and clockwise
    return [[-1, -1], [0, -1], [1, -1],
    [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]
        .map(([x, y]) => [pair[0] + x, pair[1] + y])

}


function getAllNeighbours(matrix: TField, pair: TPair, number: number): TPath {
    // return all of 8 neighbours that match with number
    return getNeighbours(pair)
        .filter(([x, y]) => x >= 0 && y >= 0 &&
            x < columnsCount && y < rowsCount)
        .filter(([x, y]) =>
            matrix[x][y] === number ||
            matrix[x][y] === number + 2) as TPath;
}


function isPairInArray(array: TPath, pair: TPair): boolean {
    return array.some(([x, y]) => x === pair[0] && y === pair[1])
}

function searchForPairInPath(path: TPath, pair: TPair): number {
    return path.findIndex(([x, y]) => x === pair[0] && y === pair[1]);
}

function isPairsMatch(pair1: TPair, pair2: TPair): boolean {
    return pair1[0] === pair2[0] && pair1[1] === pair2[1];
}


function getRichestPair(matrix: TField, stPair: TPair, number: number): TPair {
    /* Нахождение самой "богатой" (на соседей) точки (пары [x, y])
    Находятся все соседи стартовой точки, затем рекурсивно обходятся все соседи соседей.
    В массив dots записываются обработанные точки, чтобы исключать их при обходе следующих */

    const dots: TPair[] = [];
    let richestPair = stPair;
    let maxNeighbours = 0;

    function pushDots(matrix: TField, pair: TPair, number: number) {
        const neighbours = getAllNeighbours(matrix, pair, number)
        if (neighbours.length > maxNeighbours) {
            maxNeighbours = neighbours.length;
            richestPair = pair;
        }

        neighbours.forEach(newPair => {
            if (!isPairInArray(dots, newPair)) {
                dots.push(newPair);
                pushDots(matrix, newPair, number);
            }
        });
    }

    pushDots(matrix, stPair, number)
    return richestPair;
}


function getRichDots(matrix: TField, startingDot: TPair, number: number): TPair[] {
    /*  Нахождение всех "богатых" (на соседей) точек (пар [x, y])
    Ключевым моментов является отбрасывание точек-"сирот", к которым можно прийти
    только от одного соседа. После того как такая точка отброшена может оказаться,
    что и точка, которая привела к ней, тоже становится "сиротой" или "бедной". И так далее.
    Прорабатывается также ситуация, когда у точки несколько соседей, но два из них сразу или 
    в итоге просчитываются в сироты, тогда такая "развилка" тоже может быть "сиротой" */

    /* The function first gets the "richest" pair on the matrix, which is defined 
       as the pair with the most number of neighbouring dots of the same number. 
    The goPushDots function recursively finds all the neighboring dots of the input pair and
       pushes them into the dots array. It also keeps track of the number of "orphaned" dots,
       which are defined as dots that have only one neighboring dot of the same number. 
       If a dot is found to be an orphaned dot, it is removed from the dots array.  */

    // находим точку, богатую на соседей. Это нужно, чтобы не начать рекурсию с бедной.
    const reachPair = getRichestPair(matrix, startingDot, number);
    const dots: TPair[] = [];
    dots.push(reachPair);

    goPushDots(matrix, reachPair, number);

    function goPushDots(matrix: TField, pair: TPair, number: number) {
        const neighbours = getAllNeighbours(matrix, pair, number)
        let orphanedNeighboursCount = 0;

        neighbours.forEach(newPair => {
            if (!isPairInArray(dots, newPair)) {
                dots.push(newPair);
                orphanedNeighboursCount +=
                    goPushDots(matrix, newPair, number);
            }
        });

        if (neighbours.length - orphanedNeighboursCount == 1) {
            // Если количество соседей (за вычетом соседей-сирот) равно одному,
            // то это тоже точка-сирота, удаляем её из массива, возвращаем +1
            dots.pop();
            orphanedNeighboursCount = 1;
        } else {
            orphanedNeighboursCount = 0;
        }

        return orphanedNeighboursCount;
    }

    return dots;

}


function findLeftUpper(dotsArray: TPath): TPair {
    /* It finds the minimum x value among all pairs in the array, 
    and then among all pairs with that minimum x value,
    it finds the pair with the minimum y value.  */

    let result = dotsArray[0];
    dotsArray.forEach(([x, y]) => {
        if (x < result[0] || (x === result[0] && y < result[1])) {
            result = [x, y];
        }
    });

    return result;
}


function findClockwisePath(matrix: TField, dotsArray: TPair[], number: number): TPath {
    /* Обход по часовой стрелке соседей до попадания на начальную точку.
    (thanx to https://habr.com/ru/post/147762/)
    Начиная с [-1, -1] (getPair с индексом 0) от левой верхней точки, 
    ищется точка-сосед с таким же number (свободная) или number +2 (обведённая).
    Следующий круг поиска начинается с индекса (для getPair) с противоположного 
    предыдущему + 1. Т.к. просто противоположный предыдущему это и есть предыдущая точка.
    Т.о. если индекс был 2, то будет 2+4+1=7, а если был 5, то будет 5+4+1=10,
    но так индексы от 0 до 7, то 8 потребуется вычесть.  */

    const path: TPath = [];
    const firstPair: TPair = findLeftUpper(dotsArray);
    path.push(firstPair);

    let currentPair = firstPair;
    let is_complete = false;
    let x: number, y: number;
    let index: number;
    // number 8 is number of maximum surrounds neighbours
    // number 6 is contraverse index plus 2 or index - 2
    // number 2 uses to set first index to 0
    let prev_i = 2;

    while (!is_complete) {

        for (let i = 0; i < 8; i++) {
            index = (6 + prev_i + i) % 8;
            [x, y] = getNeighbours(currentPair)[index]

            if (x >= 0 && y >= 0 && x < columnsCount && y < rowsCount) {
                if (matrix[x][y] == number ||
                    matrix[x][y] == number + 2) {
                    if (isPairInArray(dotsArray, [x, y])) {
                        path.push([x, y]);
                        currentPair = [x, y];
                        prev_i = index;
                        isPairsMatch(firstPair, currentPair) && (is_complete = true);
                        break;
                    }
                }
            }
        }
    }

    return path;
}


function rearangeArray(path: TPath, shift: number): TPath {
    return [...path.slice(shift), ...path.slice(1, shift + 1)];
}


function prunePath(totalPath: TPath, firstDot: TPair): TPath {
    /* На предыдущем этапе (findClockwisePath) получился путь,
    который окружает все соседние точки по максимальной протяжённости.
    В результирующий путь могут попасть и дальние области, которые
    соединяются с действительной областью только по цепочке точек.
    Здесь откидываются такие дальние области по принципу нахождения
    в длинном пути (totalPath) точек, которые встречаются дважды.
    Последовательность пути между этими точками отбрасывается и 
    снова повторяется поиск на случай если таких областей несколько. */

    // move first dot to the front
    const i0 = searchForPairInPath(totalPath, firstDot);
    if (i0) { totalPath = rearangeArray(totalPath, i0); }

    // function to find the cross dot and to/from indices 
    function getIndices(path: TPath): [number, number] | null {
        for (let i = 1; i < Math.round(path.length / 2) - 1; i++) {
            const contra_i = path.length - i - 1;
            const [x1, y1] = path[i];
            const [x2, y2] = path[contra_i];

            if (x1 === x2 && y1 === y2) {
                return [i, contra_i];
            }

            const subpath = path.slice(i + 1, contra_i);
            const index2 = searchForPairInPath(subpath, [x1, y1])
            if (index2 !== -1) {
                return [i, index2 + i + 1];
            }

            const index1 = searchForPairInPath(subpath, [x2, y2])
            if (index1 !== -1) {
                return [index1 + i + 1, contra_i];
            }
        }
        return null;
    }

    let prunedPath = totalPath;
    let indices: [number, number] | null;

    while (indices = getIndices(prunedPath)) {
        const [index1, index2] = indices;
        prunedPath = [...prunedPath.slice(0, index1), ...prunedPath.slice(index2)];
    }

    /* Здесь можно было бы и закончить, но бывает так, 
    что сама начальная точка могла бы являться crossdot, 
    тогда в результате прунинга появляется маленький 
    хвостик из двух точек либо в начале, либо в конце.
    Тут мы его и отрезаем.
    На начальном этапе прунинга сделать этого нельзя, так как 
    во избежание путаницы он исключает начальную точку. */

    const i1 = searchForPairInPath(prunedPath.slice(1, -1), firstDot) + 1;
    if (i1) {
        if (i1 === prunedPath.length - 3) {
            return prunedPath.slice(0, i1 + 1);
        }
        if (i1 === 2) {
            return prunedPath.slice(2);
        }
    }

    return prunedPath;
}


function findCrossPath(areas: TPathNum[], totalPath: TPath, number: number): number {
    /* Возвращется индекс первой найденной области (area), 
    в которую входят как минимум две точки заданного пути */
    return areas.findIndex(area => area.number === number &&
        area.path.filter(pathPair =>
            totalPath.some(([x, y]) => x === pathPair[0] && y === pathPair[1])
        ).length >= 2
    );
}


function updatedPath(crossPath: TPath, totalPath: TPath): TPath {
    /* Здесь происходит исключение найденного пути (totalPath) 
    из найденной области, с которой найдено пересечение (crossPath).
    В результате образуется небольшой путь, который и есть 
    результат "окружения" (выигрышного хода) */

    // Возвращает массив из порядковых номеров элементов первого массива,
    // либо undefined, если данный элемент также встречается во втором массиве
    const xorIndices = (arr1: TPath, arr2: TPath): number[] =>
        arr1.map(([x, y], i) => {
            const match = arr2.find(([x2, y2]) => x === x2 && y === y2);
            return match ? undefined : i;
        });

    const totIdxs = xorIndices(totalPath, crossPath);
    const crsIdxs = xorIndices(crossPath, totalPath)

    // Здесь приходится прибегнуть к печальной процедуре.
    // Если у занятой области были поставлены новые точки,
    // но сразу не сыграли, они захватываются в следующий раз,
    // когда данная область разрастается где-то ещё.
    // В таком случае при исключении из нового пути захвата
    // точек из записанной области, получается несколько "островков"
    // Объединять их в один путь или создавать несколько не хочется.
    // В итоге я решил возвращать просто пустой путь,
    // всё равно он нужен главным образом для красоты.

    function countGoups(arr: number[]): number {
        let count = 0;
        let previousValue = 0;
        arr.forEach(function (value) {
            if (value !== undefined && previousValue === undefined) {
                count++;
            }
            previousValue = value;
        });
        return count
    }

    //  если больше одного острова, то просто выходим
    if (countGoups(totIdxs) > 1) {
        return []
    }

    // иначе собираем из индексов пути

    function getPathFromIndices(path: TPath, indices: number[]): TPath {
        // индексы пути повторяются дважды, чтобы учесть
        // случаи, когда результат разорван начальной точкой
        const x2indices = [...indices, ...indices.slice(1)]

        // находится индекс первого элемента после undefined
        const index = x2indices.findIndex((_, i) => {
            if (i > 0) {    // пропускается 0й
                return x2indices[i] !== undefined &&
                    x2indices[i - 1] === undefined
            }
        });


        if (index > 0) {
            const size = indices.slice(1).filter(element =>
                element !== undefined).length
            // здесь добавляются также предыдущая и завершающая точки
            // т.е. начало сдвигается к index-1 и отрезается size+2
            return rearangeArray(path, index - 1).slice(0, size + 2)
        } else {
            return []
        }
    }

    const result = getPathFromIndices(totalPath, totIdxs);
    const result2 = getPathFromIndices(crossPath, crsIdxs);

    // Либо к первому пути присоединяется второй путь в обратном порядке,
    // либо, если второй путь пуст, то первый путь просто замыкается.
    if (result2.length) {
        return [...result, ...result2.slice(0, -1).reverse()]
    } else {
        return [...result, result[0]]
    }
}


function isDotInside(dots: TPath, dot: TPair): boolean {
    // iterate over the dots array and check if the dot is inside the polygon
    // https://ru.stackoverflow.com/a/464796
    let result = false;
    let prev = dots[dots.length - 1];

    for (const curr of dots) {
        // if dot matches with vertex return false
        if (isPairsMatch(dot, curr)) {
            return false
        }
        if ((curr[1] < dot[1] && prev[1] >= dot[1] || prev[1] < dot[1] && curr[1] >= dot[1]) &&
            (curr[0] + (dot[1] - curr[1]) / (prev[1] - curr[1]) * (prev[0] - curr[0]) < dot[0])) {
            result = !result;
        }
        prev = curr;
    }
    return result;
}


function findBox(path: TPath): [TPair, TPair] {
    /* Нахождение "коробки", прямоугольной области,
       в которую вписан многоугольник пути; проще говоря,
       минимальных x и y и максимальных x и y */

    return path.reduce(([minPair, maxPair], element) => {
        return [
            [Math.min(minPair[0], element[0]), Math.min(minPair[1], element[1])],
            [Math.max(maxPair[0], element[0]), Math.max(maxPair[1], element[1])]
        ];
    }, [path[0], path[0]]);

}


function findAliens(matrix: TField, path: TPath, number: number) {
    const [[minX, minY], [maxX, maxY]] = findBox(path);

    return Array.from({ length: maxX - minX + 1 }, (_, _x) => minX + _x).some(x =>
        Array.from({ length: maxY - minY + 1 }, (_, _y) => minY + _y).some(y => {
            const element = matrix[x][y];
            return element !== 0 &&
                element !== number &&
                element !== number + 2 &&
                element < 5 &&
                isDotInside(path, [x, y]);
        })
    );
}


function getAreaOfAreas(areas: TPathNum[], number: number) {
    let result = 0
    areas.filter(area => area.number == number)
        .forEach(area => {
            result += squareGauss(area.path)
        });
    return result
}


function squareGauss(peaks: TPath) {
    let res1 = 0;
    let res2 = 0;
    let xn1, yn1;
    for (let i = 0; i < peaks.length - 1; i++) {
        const xn = peaks[i][0];
        xn1 = peaks[i + 1][0];
        const yn = peaks[i][1];
        yn1 = peaks[i + 1][1];
        res1 += xn * yn1
        res2 += yn * xn1
    }
    const y0 = peaks[0][1];
    const x0 = peaks[0][0];
    res1 += xn1 * y0;
    res2 += yn1 * x0;
    const result = Math.abs(res1 - res2) / 2;
    return result;
}


function saveResults(field: TFieldObj, totalPath: TPath, newPath: TPath, number: number) {
    // сохраняются результаты в объект поля
    // totalPath записывается в areas, newPath в paths
    field.areas = [...field.areas, { path: totalPath, number }]
    field.paths = [...field.paths, { path: newPath, number }]

    field.squares[number] = getAreaOfAreas(field.areas, number);

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    enum ds {  // dot states для наглядности
        nodot, // 0
        p1free, p2free, // 1-2
        p1busy, p2busy, // 3-4
        p1caught, p2caught, // 5-6
        p1closed, p2closed, // 7-8
        p1uncaught, p2uncaught, // 9-10
    }

    // все точки пути меняют number на +2 (busy state)
    totalPath.forEach(element => {
        const [x, y] = element;
        field.matrix[x][y] = number + 2;
    });

    // все "пойманные точки" меняют number на +4 (caught state)
    const [[minX, minY], [maxX, maxY]] = findBox(totalPath);

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            const element = field.matrix[x][y];

            const contranumber = (number % 2) ? number + 1 : number - 1;
            if (element > 0) {
                if (isDotInside(totalPath, [x, y])) {

                    if (element == contranumber ||
                        element == contranumber + 2 ||
                        element == contranumber + 6 ||
                        element == contranumber + 8) {
                        // all contra states became caught
                        field.matrix[x][y] = contranumber + 4;
                    }

                    if (element == number + 2 ||
                        element == number + 4) {
                        // busy and caught became closed and uncaught
                        field.matrix[x][y] = element + 4;
                    }

                    if (element == number) {
                        // free became closed
                        field.matrix[x][y] = element + 6;
                    }
                }
            }
        }
    }
}