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

type TUsers = Set<string>
type TSubscribers = { [key: string]: TUsers }


