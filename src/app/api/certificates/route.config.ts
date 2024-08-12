import { DOCUMENT_TYPES } from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import { Document, DocumentType, Products } from "@/lib/types";
import { getCorrectDate, setMetaData } from "@/lib/utils";
import { writeFile } from "fs/promises";
import { CertificateType } from "@prisma/client";
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
