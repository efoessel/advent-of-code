
function gcd_internal(a: number, b: number) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b > a) {
        [a, b] = [b, a]
    }
    for(;;) {
        if (b == 0) return a;
        a %= b;
        if (a == 0) return b;
        b %= a;
    }
}

export namespace Arithmetics {

    export function gcd(...a: number[]) {
        return a.reduce((curr, x) => gcd_internal(curr, x));
    }

    export function lcm(...a: number[]) {
        return a.reduce((curr, x) => Math.abs(curr*x)/gcd(curr, x));
    }
}