import { format } from "date-fns";

export function extractDataFromFileName(str: string) {
  // Regular expressions to extract the parts
  const idRegex = /^(\d+)/;
  const dateRegex = /\(([^)]+)\)/;
  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

  // Extract the first part using match
  const idMatch = str.match(idRegex);
  const id = idMatch ? idMatch[1] : null;

  // Extract the date part using match
  const dateMatch = str.match(dateRegex);
  const date = dateMatch ? dateMatch[1] : null;

  if (date && dateFormatRegex.test(date)) {
    return { id, date };
  } else if (date && !dateFormatRegex.test(date)) {
    const dateComponents = date.split("-");
    const day = dateComponents[0];
    const month = dateComponents[1];
    const year = dateComponents[2];

    // Reformatting the date
    const reformattedDate = format(`${year}-${month}-${day}`, "yyyy-MM-dd");

    return { id, date: reformattedDate };
  }

  return { id, date };
}
