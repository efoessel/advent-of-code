import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', identity),
    Arrays.filter(line => line.trim() !== ''),
    Arrays.flatMap((instruction)=> {
        if(instruction.startsWith('addx')) {
            return ['noop', instruction]
        }
        return [instruction]
    }),
);

const computeXValuesAtStart = Arrays.reduceAndRemember((x, instruction: string) => 
    instruction.startsWith('addx')
        ? x + parseInt(instruction.substring(5))
        : x
,1)

const algo1 = flow(
    parse,
    computeXValuesAtStart,
    Arrays.map((x, i) => i%40 === 19 ? x*(i+1) : 0),
    Arrays.sum
);

const algo2 = flow(
    parse,
    computeXValuesAtStart,
    Arrays.map((x, i) => Math.abs(i%40 - x)<=1 ? '█' : ' '),
    (sprite) => '\n'+sprite.join('').match(/.{40}/g)?.join('\n')
);

runStep(__dirname, 'step1', 'example', algo1, 13140);
runStep(__dirname, 'step1', 'real', algo1, 12540);
runStep(__dirname, 'step2', 'example', algo2, `
██  ██  ██  ██  ██  ██  ██  ██  ██  ██  
███   ███   ███   ███   ███   ███   ███ 
████    ████    ████    ████    ████    
█████     █████     █████     █████     
██████      ██████      ██████      ████
███████       ███████       ███████     `);
runStep(__dirname, 'step2', 'real', algo2, `
████ ████  ██  ████ ████ █    █  █ ████ 
█    █    █  █    █ █    █    █  █ █    
███  ███  █      █  ███  █    ████ ███  
█    █    █     █   █    █    █  █ █    
█    █    █  █ █    █    █    █  █ █    
█    ████  ██  ████ ████ ████ █  █ ████ `);
