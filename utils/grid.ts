import { Arrays } from './arrays';

export type Point = {
    x: number;
    y: number;
};

type Cell<T> = Point & {
    value: T;
}

export type Directions = typeof Grid.SIDES[number];
export type DirectionsWithDiags = Directions | typeof Grid.DIAGS[number];

export class Grid<T> {
    public static readonly SIDES = ['up','down','left','right'] as const
    public static readonly DIAGS = ['up-left', 'down-left', 'down-right', 'up-right'] as const

    private readonly cells: Cell<T>[][] = [];
    public readonly height: number
    public readonly width: number

    constructor(
        private input: T[][],
        private withDiags = false,
    ){
        this.height = input.length;
        this.width = 0; // for 0-height edge case

        for(let y = 0 ; y < input.length ; y++) {
            this.cells[y] = [];
            this.width = this.input[y].length;
            for(let x = 0 ; x < input[y].length ; x++) {
                this.cells[y][x] = {
                    x, y, 
                    value: input[y][x]
                }
            }
        }
    }

    public get({x, y}: Point) {
        return this.cells[y]?.[x]?.value;
    }

    public getCell(x: number, y: number) {
        return this.cells[y]?.[x];
    }

    public set({x, y}: Point, value: T) {
        this.cells[y][x].value = value;
    }

    public static getPoint(cell: Cell<unknown>) {
        return {
            x: cell.x,
            y: cell.y,
        };
    }

    public getNeighbors({x, y}: Point, ...directions: DirectionsWithDiags[]) {
        function isSelected(dir: DirectionsWithDiags) {
            return directions.includes(dir) || directions.length === 0
        }

        const result = [] as Cell<T>[];
        if(isSelected('up') && y > 0) {
            result.push(this.cells[y-1][x]);
        }
        if(isSelected('down') && y < this.height - 1) {
            result.push(this.cells[y+1][x]);
        }
        if(isSelected('left') && x > 0) {
            result.push(this.cells[y][x-1]);
        }
        if(isSelected('right') && x < this.width - 1) {
            result.push(this.cells[y][x+1]);
        }

        if(this.withDiags) {
            if(isSelected('up-left') && y > 0 && x > 0) {
                result.push(this.cells[y-1][x-1]);
            }
            if(isSelected('up-right') && y > 0 && x < this.width - 1) {
                result.push(this.cells[y-1][x+1]);
            }
            if(isSelected('down-left') && y < this.height - 1 && x > 0) {
                result.push(this.cells[y+1][x-1]);
            }
            if(isSelected('down-right') && y < this.height - 1 && x < this.width - 1) {
                result.push(this.cells[y+1][x+1]);
            }
        }
        
        return result;
    }

    public getCellsInDirection({x, y}: Point, direction: DirectionsWithDiags) {
        switch(direction) {
            case 'left':
                return Arrays.range(x-1, -1).map(z => this.cells[y][z]);
            case 'right':
                return Arrays.range(x+1, this.width).map(z => this.cells[y][z]);
            case 'up':
                return Arrays.range(y-1, -1).map(z => this.cells[z][x]);
            case 'down':
                return Arrays.range(y+1, this.height).map(z => this.cells[z][x]);
        }
        return [];
    }

    public getSubGrid(x: number[], y: number[]) {
        return new Grid(x.map(px => y.map(py => this.input[py][px])), this.withDiags)
    }

    public forEach(callback: (value: T, point: Point, grid: Grid<T>) => void) {
        this.cells.forEach((line, y) => {
            line.forEach((cell, x) => {
                callback(cell.value, {x, y}, this);
            });
        });
    }

    public map<O>(callback: (value: T, point: Point, grid: Grid<T>) => O) {
        return new Grid(this.cells.map((line, y) => {
            return line.map((cell, x) => {
                return callback(cell.value, {x, y}, this);
            });
        }), this.withDiags);
    }

    public filter(filter: (value: T, point: Point, grid: Grid<T>) => boolean) {
        const res: Cell<T>[] = [];
        this.forEach((val, point) => {
            if(filter(val, point, this)) {
                res.push({
                    ...point,
                    value: val,
                });
            };
        });
        return res;
    }

    public reduce<U>(reduce: (acc: U, value: T, point: Point, grid: Grid<T>) => U, initialValue: U) {
        let currentValue = initialValue;
        this.forEach((val, point) => {
            currentValue = reduce(currentValue, val, point, this);
        });
        return currentValue;
    }

    public some(test: (value: T, point: Point, grid: Grid<T>) => boolean) {
        return this.cells.some((line, y) => {
            return line.some((cell, x) => {
                return test(cell.value, {x, y}, this);
            });
        });
    }

    public every(test: (value: T, point: Point, grid: Grid<T>) => boolean) {
        return !this.some((v, p, g) => !test(v, p, g));
    }

    public toString(cellToString: (v: T, p: Point) => string = (x) => ''+x, joiner = '') {
        return this.cells.map((line, y) => {
            return line.map((cell, x) => {
                return cellToString(cell.value, {x, y});
            }).join(joiner);
        }).join('\n');
    }

    public values() {
        const res: T[] = [];
        this.forEach((val, point) => {
            res.push(val);
        });
        return res;
    }
}