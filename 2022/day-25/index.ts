import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, basicParseInt, castTo, parseBlocks } from '../../utils/@index';

const DIGITS = ['=', '-', '0', '1', '2'] as const;
type Digit = typeof DIGITS[number];

const parse = flow(
    parseBlocks('\n', parseBlocks('', castTo<Digit>)),
);

const toDigit = (d: number) => (DIGITS[d+2]);
const fromDigit = (d: Digit) => DIGITS.indexOf(d) - 2;
const parseSNAFU = (str: Digit[]) => str.map(fromDigit).reduce((val, curr) => val * 5 + curr);

const toSNAFU = (num: number) => {
    const [finalCarry, snafu] = num.toString(5).split('').map(basicParseInt)
        .reduceRight(([carry, out], b5d): [boolean, string] => {
            const withCarry = b5d + (carry ? 1 : 0);
            if(withCarry > 2) return [true, toDigit(withCarry-5) + out];
            else return [false, toDigit(withCarry)+out];
        }, [false, '']);
    return (finalCarry ? '1' : '') + snafu;
}

const algo1 = flow(
    parse,
    Arrays.map(parseSNAFU),
    Arrays.sum,
    toSNAFU
);

runStep(__dirname, 'step1', 'example', algo1, '2=-1=0');
runStep(__dirname, 'step1', 'real', algo1, '20===-20-020=0001-02');
