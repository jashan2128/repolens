// Tests, benchmarks, examples: real code, but not the "core" of a repo.
const NOISE = /(^|\/)(test|tests|__tests__|spec|bench|benchmark|examples?|fixtures?)(\/|\.|$)|\.(test|spec)[.-]/i;

export function isNoise(filePath: string): boolean {
  return NOISE.test(filePath);
}
