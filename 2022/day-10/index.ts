import { flow, identity, pipe } from 'fp-ts/function'
import { assert, run } from '../../utils/run';
import { basicParseInt, castTo, parseBlocks } from '../../utils/parse';
import { Arrays } from '../../utils/arrays';
import { objects } from '../../utils/objects';

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
    objects.pluck('all'),
    Arrays.map((x, i) => i%40 === 19 ? x*(i+1) :  0),
    Arrays.sum
);

const algo2 = flow(
    parse,
    computeXValuesAtStart,
    objects.pluck('all'),
    Arrays.map((x, i) => Math.abs(i%40 - x)<=1 ? '#' : ' '),
    (sprite) => '\n'+sprite.join('').match(/.{40}/g)?.join('\n')
);

assert(__dirname, algo1, algo2, [12540, `
#### ####  ##  #### #### #    #  # #### 
#    #    #  #    # #    #    #  # #    
###  ###  #      #  ###  #    #### ###  
#    #    #     #   #    #    #  # #    
#    #    #  # #    #    #    #  # #    
#    ####  ##  #### #### #### #  # #### `]);
