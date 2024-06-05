import { DOCUMENT_TYPES } from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import { BOOKS_LIST, COLUMN_DEFAULT_STYLES, COMPANY } from "@/utils/constants";
import { mkdir, symlink } from "fs/promises";
import ExcelJS from "exceljs";

const DOCUMENT_TYPES_IN_ARABIC: Record<string, string> = {
  "CLEARANCE_DOCUMENT": "سكان الوارد",
  "SALES_DOCUMENT": "سكان المبيعات",
  "TEMPORARY_PERMIT_DOCUMENT": "سكان السماح المؤقت",
};

export async function createFolders(companyCode: string, companyName: string) {
  const { PDF_SAVE_PATH, ROOT_PATH } = process.env;

  await mkdir(`${PDF_SAVE_PATH}/${companyCode}`);
  await mkdir(`${ROOT_PATH}/${COMPANY} ${companyName}`);

  DOCUMENT_TYPES.map(async (type: string) => {
    await mkdir(`${PDF_SAVE_PATH}/${companyCode}/${type}`);

    await symlink(
      `${PDF_SAVE_PATH}/${companyCode}/${type}`,
      `${ROOT_PATH}/${COMPANY} ${companyName}/${DOCUMENT_TYPES_IN_ARABIC[type]}`
    );
  });
}

export async function createFiles(companyName: string) {
  const { ROOT_PATH } = process.env;
  const filePathRoot = `${ROOT_PATH}/${COMPANY} ${companyName}/`;

  BOOKS_LIST.map(async (book) => {
    let columnIndex = 1;

    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet("Sheet1");

    const worksheet = workbook.getWorksheet(1);

    if (worksheet) {
      const { columns, bookName } = book;

      const filePath = `${filePathRoot}/${bookName} ${companyName}.xlsx`;

      const { basicStyle, headerStyle } = COLUMN_DEFAULT_STYLES;

      for (const column in columns) {
        const currentCell = worksheet.getCell(1, columns[column].columnNumber);
        const { columnTitle, columnWidth } = columns[column];

        currentCell.value = columnTitle;
        currentCell.style = headerStyle;
        worksheet.getColumn(columnIndex).width = columnWidth;

        columnIndex++;
      }

      worksheet.columns.forEach((col) => {
        col.style = basicStyle;
      });

      await workbook.xlsx.writeFile(filePath);
    }
  });
}
