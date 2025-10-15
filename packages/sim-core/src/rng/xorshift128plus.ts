const MASK_64 = (1n << 64n) - 1n;
const OUTPUT_PRECISION = Number(1n << 53n);

const GOLDEN_GAMMA = 0x9E3779B97F4A7C15n;
const MIX_CONST_1 = 0xBF58476D1CE4E5B9n;
const MIX_CONST_2 = 0x94D049BB133111EBn;

const splitMix64 = (state: bigint): bigint => {
  let z = (state + GOLDEN_GAMMA) & MASK_64;
  z = (z ^ (z >> 30n)) * MIX_CONST_1 & MASK_64;
  z = (z ^ (z >> 27n)) * MIX_CONST_2 & MASK_64;
  return z ^ (z >> 31n);
};

const normalizeSeed = (seed: string) => (seed.trim().length === 0 ? "weedbreed-flow" : seed);

const hashSeed = (seed: string): [bigint, bigint] => {
  let state = 0n;
  for (let index = 0; index < seed.length; index += 1) {
    state = (state + (BigInt(seed.charCodeAt(index)) << 32n) + GOLDEN_GAMMA) & MASK_64;
    state ^= state << 13n;
    state ^= state >> 7n;
    state ^= state << 17n;
  }

  const first = splitMix64(state) & MASK_64;
  const second = splitMix64(first + GOLDEN_GAMMA) & MASK_64;

  if (first === 0n && second === 0n) {
    return [1n, 0xFFFFFFFFFFFFFFFFn];
  }

  return [first === 0n ? 1n : first, second === 0n ? 0xFFFFFFFFFFFFFFFFn : second];
};

const formatRangeError = (message: string) => new RangeError(message);

export interface Xorshift128Plus {
  next(): number;
  nextInt(maxExclusive: number): number;
  nextRange(minInclusive: number, maxExclusive: number): number;
  getState(): readonly [bigint, bigint];
}

export const createXorshift128Plus = (rawSeed: string): Xorshift128Plus => {
  const seed = normalizeSeed(rawSeed);
  let [state0, state1] = hashSeed(seed);

  const nextBigInt = () => {
    let x = state0;
    const y = state1;
    state0 = y;
    x ^= x << 23n;
    x ^= x >> 17n;
    x ^= y ^ (y >> 26n);
    state1 = x;
    return (state0 + state1) & MASK_64;
  };

  return {
    next: () => {
      const value = nextBigInt();
      return Number(value >> (64n - 53n)) / OUTPUT_PRECISION;
    },
    nextInt: (maxExclusive: number) => {
      if (!Number.isFinite(maxExclusive) || maxExclusive <= 0) {
        throw formatRangeError("maxExclusive must be a positive finite number");
      }
      const floored = Math.floor(maxExclusive);
      if (floored < 1) {
        throw formatRangeError("maxExclusive must be at least 1");
      }
      const limit = BigInt(floored);
      return Number(nextBigInt() % limit);
    },
    nextRange: (minInclusive: number, maxExclusive: number) => {
      if (!Number.isFinite(minInclusive) || !Number.isFinite(maxExclusive)) {
        throw formatRangeError("Range bounds must be finite numbers");
      }
      if (maxExclusive <= minInclusive) {
        throw formatRangeError("maxExclusive must be greater than minInclusive");
      }
      const random = Number(nextBigInt() >> 11n) / OUTPUT_PRECISION;
      return minInclusive + (maxExclusive - minInclusive) * random;
    },
    getState: () => [state0, state1]
  };
};

export const deriveSeed = (...parts: Array<string | number>): string => {
  const normalized = parts
    .flatMap((part) => `${part}`.split(":"))
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  return normalized.length > 0 ? normalized.join(":") : "weedbreed-flow";
};
