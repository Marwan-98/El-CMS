import { DOCUMENT_TYPES } from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import { Document, DocumentType, FormObject, Products } from "@/lib/types";
import { getCorrectDate, setMetaData } from "@/lib/utils";
import { writeFile } from "fs/promises";
import { CertificateType } from "@prisma/client";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import { BOOKS_LIST, BookDetails, CERTIFICATE_BOOK_NAMES_MAP, COLUMN_DEFAULT_STYLES } from "@/utils/constants";
import { execSync } from "child_process";

export function extractDataFromForm(formData: FormData) {
  const certificateNumber: number = +formData.get("certificateNumber")!;
  const date: string = getCorrectDate(formData.get("date")! as string)!;
  const sentForAdjustment: string = formData.get("sentForAdjustment")! as string;

  const products = JSON.parse(formData.get("products") as string) as Products[];

  const certificateType = formData.get("certificateType") as CertificateType;
  const companyId: number = +formData.get("companyId")!;

  const releaseDate: string = getCorrectDate(formData.get("releaseDate")! as string)!;

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
    sentForAdjustment,
  };
}

export function saveFilesToServer(formData: FormData, companyCode: string) {
  const documents: Document[] = [];
  const { PDF_SCANS_URL, PDF_SAVE_PATH } = process.env;

  formData.forEach((value) => {
    (async () => {
      if (DOCUMENT_TYPES.includes(value as string)) {
        const type = formData.get(`${value}_TYPE`) as DocumentType;
        const file = formData.get(`${value}_FILE`) as File | string;

        if (typeof file === "string") {
          return;
        }

        documents.push({
          type,
          file,
          path: `${PDF_SCANS_URL}/${companyCode}/${type}/${file.name}`,
        });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const path = `${PDF_SAVE_PATH}\\${companyCode}\\${type}\\${file.name}`;

        await writeFile(path, buffer);
        setMetaData(path, "added_by", "el-manar", execSync);
      }
    })().catch((e) => console.log(e));
  });

  return documents;
}

function writeCertificateDetails(
  book: BookDetails,
  worksheet: ExcelJS.Worksheet,
  currentRow: number,
  formObject: FormObject
) {
  const { products, certificateType } = formObject;

  if (book.bookName === CERTIFICATE_BOOK_NAMES_MAP[certificateType]) {
    const bookColumns = Object.keys(book.columns);
    const { value: lastCellValue } = worksheet.getCell(currentRow - 1, 1);
    const amountOfProducts = products.length - 1;

    bookColumns.forEach((key) => {
      const { columnNumber, relatedToProduct = false } = book.columns[key];

      if (relatedToProduct) {
        return;
      }

      const currentCell = worksheet.getCell(currentRow, columnNumber);

      if (key === "rowNumber") {
        currentCell.value = typeof lastCellValue === "number" ? lastCellValue + 1 : 1;

        return;
      }

      if (key === "date" || key === "releaseDate") {
        currentCell.value = format(formObject[key], "dd/MM/yyyy");

        return;
      }

      if (key === "sentForAdjustment") {
        currentCell.value = formObject[key] === "NO" ? "" : "تم ارسالها للتسوية";

        return;
      }

      if (key === "name") {
        for (const [productIdx, product] of formObject["products"].entries()) {
          for (const prop in product) {
            const {
              columns: {
                [prop]: { columnNumber },
              },
            } = book;

            const currentCell = worksheet.getCell(currentRow + productIdx, columnNumber);

            currentCell.value = product[prop as keyof typeof product] as unknown as string;
          }
        }

        return;
      }

      currentCell.value = formObject[key as keyof typeof formObject] as string;
    });

    for (let i = 1; i <= book.columnsNo; i++) {
      if (i <= book.mergableCells) {
        worksheet.mergeCells(currentRow, i, currentRow + amountOfProducts, i);
      }

      worksheet.getCell(currentRow + amountOfProducts, i).style = COLUMN_DEFAULT_STYLES["lastCellStyle"];
    }
  }
}

export async function writeToExcelBook(filePath: string, formData: FormData) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet(1);

  if (worksheet) {
    const lastCell = worksheet.getCell(worksheet.actualRowCount + 1, 2);

    if (lastCell && lastCell.value === null) {
      const { row: currentRow } = lastCell.fullAddress;
      const formObject = extractDataFromForm(formData);

      BOOKS_LIST.map((book) => writeCertificateDetails(book, worksheet, currentRow, formObject));

      await workbook.xlsx.writeFile(filePath);
    }
  }
}
