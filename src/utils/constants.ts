import ExcelJS from "exceljs";

export const COMPANY = "شركة";

export const CERTIFICATE_BOOK_NAMES_MAP: Record<string, string> = {
  IMPORT_CERTIFICATE: "كشف وارد",
  EXPORT_CERTIFICATE: "كشف صادر",
};

export interface BookDetails {
  bookName: string;
  columns: Record<string, ColumnsDetails>;
  columnsNo: number;
  mergableCells: number;
}

interface ColumnsDetails {
  columnTitle: string;
  columnWidth: number;
  columnNumber: number;
  relatedToProduct?: boolean;
}

export const BOOKS_LIST: BookDetails[] = [
  {
    bookName: "كشف وارد",
    columns: {
      rowNumber: { columnTitle: "م", columnWidth: 10, columnNumber: 1 },
      certificateNumber: { columnTitle: "رقم الاذن", columnWidth: 10, columnNumber: 2 },
      date: { columnTitle: "التاريخ", columnWidth: 20, columnNumber: 3 },
      releaseDate: { columnTitle: "تاريخ الصرف", columnWidth: 20, columnNumber: 4 },
      sentForAdjustment: { columnTitle: "تم ارسالها للتسويه", columnWidth: 20, columnNumber: 5 },
      name: { columnTitle: "الصنف", columnWidth: 75, columnNumber: 6 },
      mixingRatio: { columnTitle: "نسبة الخلط", columnWidth: 35, columnNumber: 7, relatedToProduct: true },
      width: { columnTitle: "العرض", columnWidth: 10, columnNumber: 8, relatedToProduct: true },
      weightPerLinearMeter: {
        columnTitle: "وزن المترالطولي",
        columnWidth: 20,
        columnNumber: 9,
        relatedToProduct: true,
      },
      incomingQuantity: {
        columnTitle: "الكمية الواردة (بالمتر)",
        columnWidth: 30,
        columnNumber: 10,
        relatedToProduct: true,
      },
      productWeight: { columnTitle: "وزن الاذن", columnWidth: 10, columnNumber: 11, relatedToProduct: true },
      quantityAdjusted: { columnTitle: "الكمية المسواه", columnWidth: 20, columnNumber: 12 },
      quantityLeft: { columnTitle: "الكمية المتبقيه", columnWidth: 20, columnNumber: 13 },
      adjustmentNumber: { columnTitle: "رقم التسويه", columnWidth: 20, columnNumber: 14 },
      adjustmentDate: { columnTitle: "تاريخ التسويه", columnWidth: 20, columnNumber: 15 },
    },
    columnsNo: 15,
    mergableCells: 5,
  },
  {
    bookName: "كشف صادر",
    columns: {
      rowNumber: { columnTitle: "م", columnWidth: 10, columnNumber: 1 },
      certificateNumber: { columnTitle: "رقم الشهادة", columnWidth: 15, columnNumber: 2 },
      date: { columnTitle: "التاريخ", columnWidth: 20, columnNumber: 3 },
      documentRecieved: { columnTitle: "تم استلام الصورة الضوئية", columnWidth: 30, columnNumber: 4 },
      sentForAdjustment: { columnTitle: "تم ارسالها للتسويه", columnWidth: 20, columnNumber: 5 },
      billNumber: { columnTitle: "رقم الفاتورة", columnWidth: 20, columnNumber: 6 },
      totalGrossWeight: { columnTitle: "الوزن القايم", columnWidth: 15, columnNumber: 7 },
      totalNetWeight: { columnTitle: "الوزن الصافي", columnWidth: 15, columnNumber: 8 },
      name: { columnTitle: "الصنف", columnWidth: 35, columnNumber: 9 },
      grossWeight: {
        columnTitle: "وزن الصنف في شهادة الصادر  (القايم)",
        columnWidth: 40,
        columnNumber: 10,
        relatedToProduct: true,
      },
      netWeight: {
        columnTitle: "وزن الصنف في شهادة الصادر  (الصافي)",
        columnWidth: 40,
        columnNumber: 11,
        relatedToProduct: true,
      },
      weightAfterAddingWaste: { columnTitle: "الوزن بعد اضافه الهالك  ", columnWidth: 25, columnNumber: 12 },
    },
    columnsNo: 12,
    mergableCells: 8,
  },
];

interface columnDefaultStyles {
  basicStyle: Partial<ExcelJS.Style>;
  headerStyle: Partial<ExcelJS.Style>;
  lastCellStyle: Partial<ExcelJS.Style>;
}

export const COLUMN_DEFAULT_STYLES: columnDefaultStyles = {
  basicStyle: {
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
  },
  headerStyle: {
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
  },
  lastCellStyle: {
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
  },
};
