import { DOCUMENT_TYPES } from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import {
  BOOK_TYPES_IN_ARABIC,
  COLUMN_NAMES,
  COMPANY_IN_ARABIC,
  NUMBER_OF_COLUMNS,
} from "@/utils/constants";
import { mkdir, symlink } from "fs/promises";
import ExcelJS from "exceljs";

const DOCUMENT_TYPES_IN_ARABIC: Record<string, string> = {
  "CLEARANCE_DOCUMENT": "سكان الوارد",
  "SALES_DOCUMENT": "سكان المبيعات",
  "TEMPORARY_PERMIT_DOCUMENT": "سكان السماح المؤقت",
};

export async function createFolders(companyCode: string, companyName: string) {
  await mkdir(`${process.env.PDF_SAVE_PATH!}/${companyCode}`);
  await mkdir(`${process.env.ROOT_PATH!}/${COMPANY_IN_ARABIC} ${companyName}`);

  DOCUMENT_TYPES.map(async (type: string) => {
    await mkdir(`${process.env.PDF_SAVE_PATH!}/${companyCode}/${type}`);

    await symlink(
      `${process.env.PDF_SAVE_PATH!}/${companyCode}/${type}`,
      `${process.env.ROOT_PATH!}/${COMPANY_IN_ARABIC} ${companyName}/${
        DOCUMENT_TYPES_IN_ARABIC[type]
      }`
    );
  });
}

export async function createFiles(companyName: string) {
  BOOK_TYPES_IN_ARABIC.map(async (type) => {
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet("Sheet1");

    const worksheet = workbook.getWorksheet(1);

    if (worksheet) {
      for (let i = 1; i <= NUMBER_OF_COLUMNS; i++) {
        const currentCell = worksheet.getCell(1, i);
        currentCell.value = COLUMN_NAMES[i].title;
        currentCell.style = {
          border: {
            bottom: {
              style: "thick",
            },
            left: {
              style: "thin",
            },
            right: {
              style: "thin",
            },
          },
          font: {
            size: 16,
          },
          alignment: {
            vertical: "middle",
            horizontal: "center",
          },
          fill: {
            type: "pattern",
            pattern: "solid",
            bgColor: {
              argb: "FFF8CBAD",
            },
            fgColor: {
              argb: "FFF8CBAD",
            },
          },
        };

        worksheet.getColumn(i).width = COLUMN_NAMES[i].width;
      }

      worksheet.columns.forEach((col) => {
        col.style = {
          border: {
            bottom: {
              style: "thin",
            },
            top: {
              style: "thin",
            },
            left: {
              style: "thin",
            },
            right: {
              style: "thin",
            },
          },
          font: {
            size: 16,
          },
          alignment: {
            vertical: "middle",
            horizontal: "center",
          },
        };
      });

      await workbook.xlsx.writeFile(
        `${process.env
          .ROOT_PATH!}/${COMPANY_IN_ARABIC} ${companyName}/${type} ${companyName}.xlsx`
      );
    }
  });
}
