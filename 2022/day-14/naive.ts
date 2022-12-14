import { flow } from 'fp-ts/function'
import { assert } from '../../utils/run';
import { Parse, parseBlocks } from '../../utils/parse';
import { Arrays } from '../../utils/arrays';
import { Grid } from '../../utils/grid';
import { Vector } from '../../utils/vectors';


const parse = flow(
    parseBlocks('\n', parseBlocks(' -> ', Parse.extractIntArray)),
    
    (lines) => {

        const maxY = Arrays.max(lines.flatMap(line => line.map(pt => pt[1])));
        const minX = Arrays.min(lines.flatMap(line => line.map(pt => pt[0])));
        const maxX = Arrays.max(lines.flatMap(line => line.map(pt => pt[0])));

        const fromX = minX - maxY-5;
        const toX = maxX + maxY + 5;
        const grid = new Grid(Arrays.range(0, maxY+5).map(() => Arrays.range(fromX, toX).map(() => ' ')), true);

        lines = lines.map(Arrays.map(point => {
                return [point[0] - fromX, point[1]]
            })
        )
        const dropSandFrom = 500 - fromX;

        lines.push([[0, maxY + 2], [grid.width-1, maxY + 2]]);

        lines.forEach(line => line.reduce((prev, curr) => {
            const diff = Vector.sign(Vector.sub(curr, prev));
            let ptr = prev;
            while(!Vector.equals(ptr, curr)) {
                grid.getCell(ptr[0], ptr[1]).value = 'X';
                ptr = Vector.add(ptr, diff);
            }
            grid.getCell(curr[0], curr[1]).value = 'X';
            return curr;
        }));
        
        return {grid, maxY, dropSandFrom};
    }
);

function dropSand(grid: Grid<string>, where: number) {
    let ptr = {x: where, y: 0};
    while(true){
        let options = grid.getNeighbors(ptr, 'down', 'down-left', 'down-right'); // we are lucky getNeighbors gets them in the right order
        let chosen = options.find(opt => opt.value === ' ');
        if(chosen === undefined) return ptr;
        ptr = chosen;
    }
}

const algo1 = flow(
    parse,
    ({grid, maxY, dropSandFrom}) => {
        for(let i = 0 ;  ; i++) {
            const ptr = dropSand(grid, dropSandFrom);
            grid.getCell(ptr.x, ptr.y).value = 'o';
            if(ptr.y > maxY) {
                return i;
            }
        }
    },
);

const algo2 = flow(
    parse,
    ({grid, dropSandFrom}) => {
        for(let i = 0 ;  ; i++) {
            const ptr = dropSand(grid, dropSandFrom);
            grid.getCell(ptr.x, ptr.y).value = 'o';
            if(ptr.y === 0) {
                return i+1;
            }
        }
    },
);

assert(__dirname, algo1, algo2, [843, 27625]);
