import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Strings } from '../../utils/@index';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(flow(
        Strings.split(''),
        Arrays.map(flow(
            c => parseInt(c, 16),
            n => n.toString(2).padStart(4, '0'),
        )),
        Arrays.join('')
    ))
);

type Packet = LiteralPacket | OperatorPacket

type LiteralPacket = {
    version: number,
    type: 'literal',
    value: number,
}

type OperatorPacket = {
    version: number,
    type: number,
    subPackets: Packet[];
}

type StringReader = {
    str: string,
    ptr: number,
}

const read = (s: StringReader, n: number) => {
    const res = s.str.substring(s.ptr, s.ptr+n);
    s.ptr += n;
    return res;
}

const hasNext = (s: StringReader) => s.ptr < s.str.length;

const readPacket = (str: StringReader): Packet => {
    const version = parseInt(read(str, 3), 2);
    const type = parseInt(read(str, 3), 2);
    if(type === 4) {
        let done = false, value = '';
        while(!done) {
            done = read(str, 1) !== '1';
            value += read(str, 4);
        }
        return {version, type: 'literal', value: parseInt(value, 2)}
    } else {
        const lengthType = read(str, 1);
        if(lengthType === '0') {
            const bitsCount = parseInt(read(str, 15), 2);
            const packetsStr = {str: read(str, bitsCount), ptr: 0};
            const packets: Packet[] = [];
            while(hasNext(packetsStr)) {
                packets.push(readPacket(packetsStr));
            }
            return {version, type, subPackets: packets};
        } else {
            const packetCount = parseInt(read(str, 11), 2);
            const packets = Arrays.range(0, packetCount).map(() => readPacket(str));
            return {version, type, subPackets: packets};
        }
    }
}

const readVersion = (p: Packet): number => {
    if(p.type === 'literal') {
        return p.version;
    } else {
        return p.version + pipe(p.subPackets, Arrays.map(readVersion), Arrays.sum)
    }
}

const algo1 = flow(
    parse,
    Arrays.map(flow(
        str => readPacket({str, ptr: 0}),
        readVersion
    ))
);

const computeValue = (p: Packet): number => {
    if(p.type === 'literal') {
        return p.value;
    } else {
        const vals = pipe(p.subPackets, Arrays.map(computeValue));
        switch(p.type) {
            case 0: return Arrays.sum(vals);
            case 1: return Arrays.prod(vals);
            case 2: return Arrays.min(vals);
            case 3: return Arrays.max(vals);
            case 5: return vals[0] > vals[1] ? 1 : 0;
            case 6: return vals[0] < vals[1] ? 1 : 0;
            case 7: return vals[0] === vals[1] ? 1 : 0;
        }
        throw 'Illegal packet type';
    }
}

const algo2 = flow(
    parse,
    Arrays.map(flow(
        str => readPacket({str, ptr: 0}),
        computeValue
    ))
)

runStep(__dirname, 'step1', 'example1', algo1, [16, 12, 23, 31]);
runStep(__dirname, 'step1', 'real', algo1, [875]);
runStep(__dirname, 'step2', 'example2', algo2, [3, 54, 7, 9, 1, 0, 0, 1]);
runStep(__dirname, 'step2', 'real', algo2, [1264857437203]);
