export interface FormValues {
  certificateNumber: number;
  date: Date;
  products: ImportProductFormValue[] | ExportProductFormValue[];
  documentScans: {
    type?: DocumentType;
    //eslint-disable-next-line
    scan?: any;
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
  [key: string]: string | number | Products[] | CertificateType;
  certificateNumber: number;
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
  certificateNumber: number;
  date: Date;
  certificateType: "IMPORT_CERTIFICATE" | "EXPORT_CERTIFICATE";
  companyId: number;
  importCertificate: importCertificateSchema;
  exportCertificate: exportCertificateSchema;
  documentScans: Document[];
}

export interface importCertificateSchema extends CertificateSchema {
  releaseDate: Date;
  importItems: ImportProduct[];
}

export interface exportCertificateSchema extends CertificateSchema {
  billNumber: string;
  totalGrossWeight: number;
  totalNetWeight: number;
  exportItems: ExportProduct[];
}

interface Product {
  name: string;
}

export interface ImportProduct extends Product {
  id: number | null | undefined;
  width: string;
  weightPerLinearMeter: number;
  incomingQuantity: number;
  mixingRatio: string;
}

export interface ExportProduct extends Product {
  id: number | null | undefined;
  grossWeight: number;
  netWeight: number;
}

export interface Certificate {
  certificateId: number;
  certificateNumber: number;
  certificateType: string;
  date: string;
  companyName: string;
}

export interface Document {
  type: DocumentType;
  path: string;
  file: File;
}

export type DocumentType = "CLEARANCE_DOCUMENT" | "SALES_DOCUMENT" | "TEMPORARY_PERMIT_DOCUMENT";

export type CertificateType = "IMPORT_CERTIFICATE" | "EXPORT_CERTIFICATE";

export type Products = ExportProduct | ImportProduct;

export type TranslationFunction = (key: string, options?: { ns?: string }) => string;
