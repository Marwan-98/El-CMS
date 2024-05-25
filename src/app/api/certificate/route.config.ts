export function extractDataFromFileName(str: string) {
  // Regular expressions to extract the parts
  const idRegex = /^(\d+)/;
  const dateRegex = /\(([^)]+)\)/;

  // Extract the first part using match
  const idMatch = str.match(idRegex);
  const id = idMatch ? idMatch[1] : null;

  // Extract the date part using match
  const dateMatch = str.match(dateRegex);
  const date = dateMatch ? dateMatch[1] : null;

  return { id, date };
}
