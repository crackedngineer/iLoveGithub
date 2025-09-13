export function replaceUrlVariables(
  urlTemplate: string,
  variables: {[key: string]: string},
): string {
  return urlTemplate.replace(/{(\w+)}/g, (_, key) => {
    return variables[key] || `{${key}}`;
  });
}
