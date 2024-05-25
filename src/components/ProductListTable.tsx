import { useTranslations } from "next-intl";
import ProductListItem from "./ProductListItem";
import {
  EXPORT_CERTIFICATE,
  IMPORT_CERTIFICATE,
} from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import { ExportProduct, ImportProduct } from "@/lib/types";

export default function ProductListTable({
  importItems,
  exportItems,
}: {
  importItems?: ImportProduct[];
  exportItems?: ExportProduct[];
}) {
  const t = useTranslations();

  if (exportItems) {
    return (
      <table className="table-fixed m-auto text-center">
        <thead>
          <tr>
            <th className="w-80">{t("Product")}</th>
            <th className="w-36">{t("Gross weight")}</th>
            <th className="w-36">{t("Net weight")}</th>
          </tr>
        </thead>
        <tbody>
          {exportItems.map((item) => (
            <ProductListItem
              key={item.id}
              item={item}
              certificateType={EXPORT_CERTIFICATE}
            />
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <table className="table-fixed m-auto text-center">
      <thead>
        <tr>
          <th className="w-72">{t("Product")}</th>
          <th className="w-64 ">{t("Mixing Ratio")}</th>
          <th className="w-28">{t("Width")}</th>
          <th className="w-36">{t("Weight Per Linear Meter")}</th>
          <th className="w-44">{t("Incoming Quantity")}</th>
          <th className="w-8">{t("Weight")}</th>
        </tr>
      </thead>
      <tbody>
        {importItems!.map((item) => (
          <ProductListItem
            key={item.id}
            item={item}
            certificateType={IMPORT_CERTIFICATE}
          />
        ))}
      </tbody>
    </table>
  );
}
