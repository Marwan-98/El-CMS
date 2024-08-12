import { useTranslations } from "next-intl";
import ProductListItem from "./ProductListItem";
import { EXPORT_CERTIFICATE, IMPORT_CERTIFICATE } from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import { exportCertificateSchema, importCertificateSchema } from "@/lib/types";

export default function ProductListTable({
  importCertificate,
  exportCertificate,
}: {
  importCertificate?: importCertificateSchema;
  exportCertificate?: exportCertificateSchema;
}) {
  const t = useTranslations();

  if (exportCertificate) {
    const { exportItems, totalGrossWeight, totalNetWeight } = exportCertificate || {};

    return (
      <table className="table-fixed w-full text-center">
        <thead>
          <tr className="bg-[#14213D] text-white">
            <th className="w-80">{t("Product")}</th>
            <th className="w-36">{t("Gross weight")}</th>
            <th className="w-36">{t("Net weight")}</th>
          </tr>
        </thead>
        <tbody>
          {exportItems.map((item) => (
            <ProductListItem key={item.id} item={item} certificateType={EXPORT_CERTIFICATE} />
          ))}
          <tr className="h-8  bg-[#1a9f58] text-white">
            <th className="w-80">{t("Total")}</th>
            <td>{totalGrossWeight}</td>
            <td>{totalNetWeight}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  const { importItems } = importCertificate!;

  return (
    <table className="table-fixed w-full text-center">
      <thead>
        <tr className="bg-[#14213D] text-white">
          <th className="w-72 py-1">{t("Product")}</th>
          <th className="w-32 py-1">{t("Mixing Ratio")}</th>
          <th className="w-28 py-1">{t("Width")}</th>
          <th className="w-32 py-1">{t("Weight Per Linear Meter")}</th>
          <th className="w-32 py-1">{t("Incoming Quantity")}</th>
          <th className="w-24 py-1">{t("Net weight")}</th>
        </tr>
      </thead>
      <tbody>
        {importItems.map((item) => (
          <ProductListItem key={item.id} item={item} certificateType={IMPORT_CERTIFICATE} />
        ))}
        <tr className="h-8  bg-[#1a9f58] text-white">
          <th className="w-80">{t("Total")}</th>
          <td colSpan={3}>&nbsp;</td>
          <td>
            {importItems.reduce((agg, item) => {
              const total = item.incomingQuantity + agg;

              return total;
            }, 0)}
          </td>
          <td>
            {importItems.reduce((agg, item) => {
              const total = item.productWeight + agg;

              return total;
            }, 0)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
