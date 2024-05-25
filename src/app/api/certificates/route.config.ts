import { DOCUMENT_TYPES } from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import { Document, DocumentType, ImportProduct, Products } from "@/lib/types";
import { getCorrectDate } from "@/lib/utils";
import { writeFile } from "fs/promises";
import { CertificateType } from "@prisma/client";
import ExcelJS from "exceljs";
import { format } from "date-fns";

export function extractDataFromForm(formData: FormData) {
  const certificateNumber: number = +formData.get("certificateNumber")!;
  const date: string = getCorrectDate(formData.get("date")! as string)!;

  const products = JSON.parse(formData.get("products") as string) as Products[];

  const certificateType = formData.get("certificateType") as CertificateType;
  const companyId: number = +formData.get("companyId")!;

  const releaseDate: string = getCorrectDate(
    formData.get("releaseDate")! as string
  )!;

  const billNumber: string = formData.get("billNumber") as string;
  const totalGrossWeight: number = +formData.get("totalGrossWeight")!;
  const totalNetWeight: number = +formData.get("totalNetWeight")!;

  return {
    certificateNumber,
    date,
    products,
    certificateType,
    companyId,
    releaseDate,
    billNumber,
    totalGrossWeight,
    totalNetWeight,
  };
}

export function writeFilesToServer(formData: FormData, companyCode: string) {
  const documents: Document[] = [];

  formData.forEach((value) => {
    (async () => {
      if (DOCUMENT_TYPES.includes(value as string)) {
        const [type, file] = formData.getAll(value as string) as [
          DocumentType,
          File
        ];

        documents.push({
          type,
          file,
          path: `${process.env.FILE_DB!}/scans/${companyCode}/${type}/${
            file.name
          }`,
        });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const path = `${process.env.PDF_SAVE_PATH!}/${companyCode}/${type}/${
          file.name
        }`;
        await writeFile(path, buffer);
      }
    })().catch((e) => console.log(e));
  });

  return documents;
}

export async function writeToExcelBook(filePath: string, formData: FormData) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet(1);

  const { certificateNumber, date, products, releaseDate } =
    extractDataFromForm(formData);

  if (worksheet) {
    const cell = worksheet.getCell(worksheet.actualRowCount + 1, 2);

    if (cell && cell.value === null) {
      const { row } = cell.fullAddress!;

      worksheet.getCell(row, 2).value = certificateNumber;
      worksheet.getCell(row, 3).value = format(date, "dd/MM/yyyy");
      worksheet.getCell(row, 4).value = format(releaseDate, "dd/MM/yyyy");

      (products as ImportProduct[]).map((product, idx) => {
        worksheet.getCell(row + idx, 6).value = product.name;
        worksheet.getCell(row + idx, 7).value = product.mixingRatio;
        worksheet.getCell(row + idx, 8).value = product.width;
        worksheet.getCell(row + idx, 9).value = product.weightPerLinearMeter;
        worksheet.getCell(row + idx, 10).value = product.incomingQuantity;
        worksheet.getCell(row + idx, 11).value =
          product.incomingQuantity * product.weightPerLinearMeter;
      });

      for (let i = 1; i <= 5; i++) {
        worksheet.mergeCells(row, i, row + products.length - 1, i);
      }

      await workbook.xlsx.writeFile(filePath);
    }
  }
}
