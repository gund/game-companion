export function isShallowEqual(a: object, b: object): boolean {
  if (a === b) {
    return true;
  }

  const aKeys = Object.keys(a) as never[];
  const bKeys = Object.keys(b) as never[];

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every((key) => a[key] === b[key]);
}
