import { z } from "zod";

export const IMPORT_CERTIFICATE = "IMPORT_CERTIFICATE";
export const EXPORT_CERTIFICATE = "EXPORT_CERTIFICATE";

export const CLEARANCE_DOCUMENT = "CLEARANCE_DOCUMENT";
export const SALES_DOCUMENT = "SALES_DOCUMENT";
export const TEMPORARY_PERMIT_DOCUMENT = "TEMPORARY_PERMIT_DOCUMENT";

export const DOCUMENT_TYPES = [
  CLEARANCE_DOCUMENT,
  SALES_DOCUMENT,
  TEMPORARY_PERMIT_DOCUMENT,
];

export const certificateFormSchema = z.object({
  certificateNumber: z.coerce.number().min(1, {
    message: "",
  }),
  date: z.date({
    required_error: "",
  }),
  documentScans: z
    .object({
      scan: z.any(),
      type: z
        .enum([CLEARANCE_DOCUMENT, SALES_DOCUMENT, TEMPORARY_PERMIT_DOCUMENT])
        .optional(),
    })
    .array(),
});
