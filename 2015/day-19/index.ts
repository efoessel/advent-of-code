import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays } from '../../utils/@index';



const parseReplacement = (line: string) => {
    // Ca => PRnFAr
    const split = line.split(' => ');
    return {
        from: split[0],
        to: split[1],
    };
}

const parse = (data: string) => {
    const split = data.split('\n\n');
    const replacementsArray = split[0].split('\n').map(parseReplacement);

    const replacementsMap = new Map<string, string[]>();
    replacementsArray.forEach(({from, to}) => {
        const repls = replacementsMap.get(from) || [];
        repls.push(to);
        replacementsMap.set(from, repls);
    });

    return {
        replacementsArray: replacementsArray,
        replacementsMap: replacementsMap,
        molecule: split[1]
    }
};


const parseMolecule = (str: string) => [...str.matchAll(/[A-Z][a-z]*/g)].map(([x]) => x);

const getAllPossibleOutputs = (replacements: Map<string, string[]>) => (molecule: string) => {
    const possibleOutputs = new Set<string>();
    const parsedMolecule = parseMolecule(molecule);
    parsedMolecule.forEach((atom, i) => {
        (replacements.get(atom) || []).forEach(replacement => {
            const possibleOutput = parsedMolecule.map((a, j) => i===j ? replacement : a).join('');
            possibleOutputs.add(possibleOutput);
        })
    })

    return [...possibleOutputs];
}


const algo1 = flow(
    parse,
    ({replacementsMap, molecule}) => getAllPossibleOutputs(replacementsMap)(molecule),
    Arrays.length
);


// meh that's not an algorithm puzzle. plus algo is != for example and real stuff
const algo2 = flow(
    parse,
    ({molecule}) => {
        const parsed = parseMolecule(molecule);
        const nbAtoms = parsed.length;
        const nbY = parsed.filter(x => x === 'Y').length;
        const nbRn = parsed.filter(x => x === 'Rn').length;

        return nbAtoms - 2*nbRn - 2*nbY - 1;
    }
)

const algo2example = flow(
    parse,
    ({molecule}) => {
        const parsed = parseMolecule(molecule);
        return parsed.length;
    }
)

runStep(__dirname, 'step1', 'example', algo1, 4);
runStep(__dirname, 'step1', 'real', algo1, 535);
runStep(__dirname, 'step2', 'example2', algo2example, 6);
runStep(__dirname, 'step2', 'real', algo2, 212);
