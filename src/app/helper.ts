export function replaceUrlVariables(
  urlTemplate: string,
  variables: {[key: string]: string},
): string {
  return urlTemplate.replace(/{(\w+)}/g, (_, key) => {
    return variables[key] || `{${key}}`;
  });
}

/**
 * Extracts the file name from a given URL.
 * @param url - The full URL string.
 * @returns The file name extracted from the URL.
 */
export const parseImageFileName = (url: string): string => {
  const parts = url.split("/");
  return parts[parts.length - 1];
};
