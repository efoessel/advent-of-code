import { flow, pipe } from 'fp-ts/function'
import { run } from '../utils/run';
import { Arrays } from '../utils/arrays';
import { Objects } from '../utils/objects';
import { castTo } from '../utils/parse';


type RawDayResult = {
    '1'?: {
        get_star_ts: number
    },
    '2'?: {
        get_star_ts: number
    },
}
type User = {
    name: string,
    local_score: number,
    last_star_ts: number,
    completion_day_level: Record<string, RawDayResult | undefined>,
}

const parse = flow(
    (s: string) => JSON.parse(s),
    Objects.pluck('members'),
    castTo<Record<string, User>>,
    Objects.mapKeys((user) => user.name),
)

function getStartTs(day: number) {
    const res = new Date('2022-12-01T05:00:00.000Z');
    res.setDate(day)
    return res.getTime();
}

function toReadableTime(ts: number, day: number) {
    const sec_num = ts - getStartTs(day)/1000;
    const hours   = Math.floor(sec_num / 3600);
    const minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    const seconds = sec_num - (hours * 3600) - (minutes * 60);

    return hours.toFixed(0).padStart(2, '0')+':'
        + minutes.toFixed(0).padStart(2, '0')+':'
        + seconds.toFixed(0).padStart(2, '0');
}

function parseDayResult(raw: RawDayResult, day: number) {
    if(!raw[2]) return undefined;
    return toReadableTime(raw[2].get_star_ts, day)
}

const algo1 = flow(
    parse,
    Objects.map(user => pipe(user.completion_day_level,
        Objects.map((res, day) => parseDayResult(res!, parseInt(day))),
        Objects.values
    ))
)

const algo2 = (star: 1|2) => flow(
    parse,
    Objects.pivot(
        user => Object.keys(user.completion_day_level),
        (key, user) => {
            const ts = user.completion_day_level[key]?.[star]?.get_star_ts;
            return ts === undefined ? undefined : {
                name: user.name,
                get_star_ts: ts,
            };
        },
        true
    ),
    Objects.map((val, day) => pipe(val,
        Arrays.sortNumbers('ASC', (v) => v.get_star_ts!),
        Arrays.map((user, i) => `${(i+1).toFixed(0).padStart(2)} - ${user.name.padEnd(20)} ${toReadableTime(user.get_star_ts!, parseInt(day))}`)
    ))
)

run(__dirname, algo1, algo2(1), algo2(2));