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
  const certificateId: number = +formData.get("certificateId")!;
  const certificateNumber: number = +formData.get("certificateNumber")!;
  const date: string = getCorrectDate(formData.get("date")! as string)!;
  const sentForAdjustment: string = formData.get("sentForAdjustment")! as string;

  const products = JSON.parse(formData.get("products") as string) as Products[];

  const certificateType = formData.get("certificateType") as CertificateType;
  const companyId: number = +formData.get("companyId")! as number;
  const companyCode: string = formData.get("companyCode") as string;
  const companyName: string = formData.get("companyName") as string;

  const releaseDate: string = getCorrectDate(formData.get("releaseDate")! as string)!;

  const billNumber: string = formData.get("billNumber") as string;
  const totalGrossWeight: number = +formData.get("totalGrossWeight")!;
  const totalNetWeight: number = +formData.get("totalNetWeight")!;

  const deletedProducts = JSON.parse((formData.get("deletedProducts") as string) || "[]");

  return {
    certificateId,
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
    deletedProducts,
    companyCode,
    companyName,
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
  formObject: FormObject,
  oldCertificateNumber?: number
) {
  const { products, certificateType } = formObject;

  if (book.bookName === CERTIFICATE_BOOK_NAMES_MAP[certificateType]) {
    const masterCell = getCellByCertificateNumber(worksheet, oldCertificateNumber);
    const {
      fullAddress: { row: currentRow },
    } = masterCell;

    const bookColumns = Object.keys(book.columns);
    const { value: lastCellValue } = worksheet.getCell(currentRow - 1, 1);
    const amountOfProducts = products.length - 1;

    // TODO: fix editing issues
    // if (editing) {
    // let currentRowIndex = currentRow + 1;
    // let oldProductsAmount = 0;

    //   let currentCell = worksheet.getCell(currentRowIndex, 2);

    //   while (currentCell.isMergedTo(masterCell)) {
    //     oldProductsAmount++;
    //     currentRowIndex++;

    //     currentCell = worksheet.getCell(currentRowIndex, 2);
    //   }

    //   for (let i = 1; i <= book.columnsNo; i++) {
    //     if (i <= book.mergableCells) {
    //       for (let j = 0; j <= oldProductsAmount; j++) {
    //         worksheet.getCell(currentRow + j, i).unmerge();
    //       }
    //     }

    //     worksheet.getCell(currentRow + amountOfProducts, i).style = COLUMN_DEFAULT_STYLES["basicStyle"];
    //   }

    //   const rowsToAdd = amountOfProducts - oldProductsAmount;

    //   if (rowsToAdd > 0) {
    //     worksheet.duplicateRow(currentRow, rowsToAdd, true);
    //   }
    // }

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

      if (key === "documentRecieved") {
        currentCell.value = "";

        return;
      }

      if (key === "name") {
        for (const [productIdx, product] of formObject["products"].entries()) {
          for (const prop in product) {
            if (book.columns[prop]) {
              const {
                columns: {
                  [prop]: { columnNumber },
                },
              } = book;

              const currentCell = worksheet.getCell(currentRow + productIdx, columnNumber);

              currentCell.value = String(product[prop as keyof typeof product]);
            }
          }
        }

        return;
      }

      currentCell.value = formObject[key as keyof typeof formObject] as string;
    });

    for (let i = 1; i <= book.columnsNo; i++) {
      if (i <= book.mergableCells) {
        let alreadyMerged = false;
        for (let r = currentRow; r <= currentRow + amountOfProducts; r++) {
          if (worksheet.getCell(r, i).isMerged) {
            alreadyMerged = true;
            break;
          }
        }

        if (!alreadyMerged) {
          worksheet.mergeCells(currentRow, i, currentRow + amountOfProducts, i);
        }
      }

      worksheet.getCell(currentRow + amountOfProducts, i).style = COLUMN_DEFAULT_STYLES["lastCellStyle"];
    }
  }
}

function getCellByCertificateNumber(worksheet: ExcelJS.Worksheet, oldCertificateNumber?: number): ExcelJS.Cell {
  let matchedCell = worksheet.getCell(worksheet.actualRowCount + 1, 2);

  for (let i = 0; i < worksheet.actualRowCount; i++) {
    const currentCell = worksheet.getCell(i, 2);

    if (currentCell.value === oldCertificateNumber) {
      matchedCell = currentCell;
      break;
    }
  }

  return matchedCell;
}

export async function writeToExcelBook(filePath: string, formData: FormData, oldCertificateNumber?: number) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet(1);

  if (worksheet) {
    const lastCell = worksheet.getCell(worksheet.actualRowCount + 1, 2);

    if (lastCell && lastCell.value === null) {
      const formObject = extractDataFromForm(formData);

      BOOKS_LIST.map((book) => writeCertificateDetails(book, worksheet, formObject, oldCertificateNumber));

      await workbook.xlsx.writeFile(filePath);
    }
  }
}
