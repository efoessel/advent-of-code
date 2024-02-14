import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Interval, Intervals, Objects, Stream, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n\n', identity),
    ([workflows, parts]) => ({
        workflows: parseWorkflows(workflows),
        parts: parseBlocks('\n', parsePart)(parts),
    })
);

type Comp = 'x'|'m'|'a'|'s';
type Part = Record<Comp, number>;
type Workflow = ReturnType<typeof parseWorkflow>;
type Step = {
    cond: true,
    comp: Comp, op: '<'|'>', val: number,
    to: string
} | {
    cond: false,
    to: string
}

const parsePart = (p: string) => p.substring(1, p.length-1).split(',')
        .map(s => s.split('=') as [Comp, string])
        .reduce((acc, [k, v]) => ({...acc, [k]: parseInt(v)}), {} as Part);

const parseWorkflows = flow(
    parseBlocks('\n', (w) => {
        const [name, process] = w.substring(0, w.length-1).split('{');
        return [name, parseWorkflow(process)] as const
    }),
    Objects.fromEntries
);

const parseWorkflow = (w: string) => w.split(',').map((step): Step => {
    if(/^\w+$/.test(step)) {
        return {cond: false, to: step}
    } else {
        const match = /^(\w)([<>])(\d+):(\w+)$/.exec(step)!
        const comp = match[1] as Comp;
        const condition = match[2] as '<'|'>';
        const val = parseInt(match[3]);
        return {
            cond: true,
            comp, op: condition, val,
            to: match[4]
        };
    }
})

const algo1 = flow(
    parse,
    ({parts, workflows}) => pipe(
        parts,
        Arrays.map(part => ({
            part,
            res: Stream.loopUntil(
                (bin: string) => bin === 'A' || bin === 'R',
                (bin) => workflows[bin].find(step => step.cond
                    ? step.op === '<'
                        ? part[step.comp] < step.val
                        : part[step.comp] > step.val
                    : true)!.to,
                'in' as string
            )
        })),
    ),
    Arrays.filter(({res}) => res === 'A'),
    Arrays.map(({part}) => pipe(part,
        Objects.values,
        Arrays.sum
    )),
    Arrays.sum
);

type Range = Record<Comp, Interval>;

// limit is included in the lower output
const splitRange = (range: Range, comp: Comp, limit: number) => {
    const up = Intervals.intersection(range[comp], Intervals.from(limit + 1, +Infinity));
    const down = Intervals.intersection(range[comp], Intervals.from(-Infinity, limit + 1));
    return {
        up: up ? { ...range, [comp]: up } : undefined,
        down: down ? { ...range, [comp]: down } : undefined,
    }
}

const merge = (acc: Acc, to: string, done?: Range, rest?: Range) => ({
    done: {
        ...acc.done,
        [to]: (acc.done[to] ?? []).concat(done ? [done] : [])
    },
    rest,
});

type Acc = {done: Record<string, Range[]>, rest: Range | undefined};
const applyWorkflow = (range: Range, workflow: Workflow) => {
    return workflow.reduce(
        (acc: Acc, step: Step): Acc => {
            if(acc.rest === undefined) return acc;
            if(step.cond) {
                const {up, down} = splitRange(acc.rest, step.comp, step.val - (step.op === '<' ? 1 : 0));
                const d = step.op === '<' ? down : up;
                const r = step.op === '>' ? down : up;
                return merge(acc, step.to, d, r);
            }
            return merge(acc, step.to, acc.rest, undefined);
        },
        {done: {}, rest: range} as Acc
    ).done
}

const applyAllWorkflows = (ranges: Record<string, Range[]>, workflows: Record<string, Workflow>) => {
    return Object.entries(ranges)
        .flatMap(([key, ranges]) => ranges.map(r => [key, r] as const))
        .map(([key, range]) => applyWorkflow(range, workflows[key]))
        .flatMap(Objects.entries)
        .reduce((acc, [key, ranges]) => ({...acc, [key]: (acc[key] ?? []).concat(ranges)}), {} as Record<string, Range[]>);
}

const countOptions = (ranges?: Range[]) => ranges === undefined
    ? 0
    : pipe(
        ranges,
        Arrays.map((range: Range) => pipe(
            range,
            Objects.values,
            Arrays.map(Intervals.length),
            Arrays.prod
        )),
        Arrays.sum
    )

type Acc2 = {
    accepted: number,
    rejected: number,
    rest: Record<string, Range[]>
};
const solve = (workflows: Record<string, Workflow>) => {
    return Stream.loopUntil(
        (acc: Acc2) => Object.values(acc.rest).length === 0,
        (acc: Acc2) => {
            const {A, R, ...rest} = applyAllWorkflows(acc.rest, workflows);
            return {
                accepted: acc.accepted + countOptions(A),
                rejected: acc.rejected + countOptions(R),
                rest
            }
        },
        { accepted: 0, rejected: 0, rest: {in: [{
            x: Intervals.fromIntegersIncluded(1, 4000),
            m: Intervals.fromIntegersIncluded(1, 4000),
            a: Intervals.fromIntegersIncluded(1, 4000),
            s: Intervals.fromIntegersIncluded(1, 4000),
        }]}}
    )
}

const algo2 = flow(
    parse,
    ({workflows}) => solve(workflows).accepted
)

runStep(__dirname, 'step1', 'example', algo1, 19114);
runStep(__dirname, 'step1', 'real', algo1, 446517);
runStep(__dirname, 'step2', 'example', algo2, 167409079868000);
runStep(__dirname, 'step2', 'real', algo2, 130090458884662);
