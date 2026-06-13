export function mergeClassNames(
  ...classNames: Array<string | undefined | false>
) {
  return classNames.filter(Boolean).join(" ");
}
