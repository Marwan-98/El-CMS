import {
  Certificate,
  DocumentScan,
  ExportItem,
  ImportItem,
  ImportCertificate as PrismaImportCertificate,
  ExportCertificate as PrismaExportCertificate,
} from "@prisma/client";

export interface FormValues {
  certificateNumber?: number;
  date: Date;
  products: ImportProductFormValue[] | ExportProductFormValue[];
  documentScans: {
    type?: DocumentType;
    //eslint-disable-next-line
    scan?: any;
  }[];
  deletedProducts: {
    productId: number;
  }[];
}

export interface ImportProductFormValue {
  name: string;
  width: string;
  mixingRatio: string;
  weightPerLinearMeter: number;
  incomingQuantity: number;
}

export interface ExportProductFormValue {
  name: string;
  grossWeight: number;
  netWeight: number;
}

export interface FormObject {
  [key: string]: string | number | Products[] | CertificateType | null;
  certificateNumber: number | null;
  date: string;
  products: Products[];
  certificateType: CertificateType;
  companyId: number;
  releaseDate: string;
  billNumber: string;
  totalGrossWeight: number;
  totalNetWeight: number;
}

export interface CertificateSchema {
  certificateNumber?: number;
  date: Date;
  certificateType: "IMPORT_CERTIFICATE" | "EXPORT_CERTIFICATE";
  companyId: number;
  importCertificate: importCertificateSchema;
  exportCertificate: exportCertificateSchema;
  documentScans: Document[];
  sentForAdjustment: boolean;
  company: {
    name: string;
  };
}

export type ImportCertificate = Certificate & {
  importCertificate: PrismaImportCertificate & { importItems: ImportItem[] };
  documentScans: DocumentScan[];
};

export type ExportCertificate = Certificate & {
  exportCertificate: PrismaExportCertificate & { exportItems: ExportItem[] };
  documentScans: DocumentScan[];
};

export interface importCertificateSchema extends CertificateSchema {
  releaseDate: Date;
  importItems: ImportItem[];
}

export interface exportCertificateSchema extends CertificateSchema {
  billNumber: string;
  totalGrossWeight: number;
  totalNetWeight: number;
  exportItems: ExportItem[];
}

export interface Document {
  type: DocumentType;
  path: string;
}

export type DocumentType = "CLEARANCE_DOCUMENT" | "SALES_DOCUMENT" | "TEMPORARY_PERMIT_DOCUMENT";

export type CertificateType = "IMPORT_CERTIFICATE" | "EXPORT_CERTIFICATE";

export type Products = ExportItem | ImportItem;

export type TranslationFunction = (key: string, options?: { ns?: string }) => string;
