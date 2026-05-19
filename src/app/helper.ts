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

export const toBase64 = (str: string) =>
  typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str);
