export const COMPANY_IN_ARABIC = "شركة";
export const IMPORT_BOOK_IN_ARABIC = "كشف وارد";
export const EXPORT_BOOK_IN_ARABIC = "كشف صادر";

export const BOOK_TYPES_IN_ARABIC = ["كشف وارد", "كشف صادر"];

export const NUMBER_OF_COLUMNS = 15;

interface ColumnsDetails {
  title: string;
  width: number;
}

export const COLUMN_NAMES: Record<number, ColumnsDetails> = {
  1: { title: "م", width: 5 },
  2: { title: "رقم الاذن", width: 10 },
  3: { title: "التاريخ", width: 20 },
  4: { title: "تاريخ الصرف", width: 20 },
  5: { title: "تم ارسالها للتسويه", width: 20 },
  6: { title: "الصنف", width: 75 },
  7: { title: "نسبة الخلط", width: 30 },
  8: { title: "العرض", width: 10 },
  9: { title: "وزن المترالطولي", width: 20 },
  10: { title: "الكمية الواردة (بالمتر)", width: 30 },
  11: { title: "وزن الاذن", width: 10 },
  12: { title: "الكمية المسواه", width: 20 },
  13: { title: "الكمية المتبقيه", width: 20 },
  14: { title: "رقم التسويه", width: 20 },
  15: { title: "تاريخ التسويه", width: 20 },
};
