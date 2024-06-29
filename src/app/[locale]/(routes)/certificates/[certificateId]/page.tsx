"use client";
import ProductListTable from "@/components/ProductListTable";
import axios from "axios";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { IMPORT_CERTIFICATE } from "../../addCertificate/AddCertificate.config";
import { Link } from "lucide-react";
import { CertificateSchema } from "@/lib/types";
import type { Certificate } from "@prisma/client";

export default function Certificate({
  params: { certificateId },
}: {
  params: {
    certificateId: string;
  };
}) {
  const t = useTranslations();

  const [certificate, useCertifcate] = useState<CertificateSchema | null>(null);

  useEffect(() => {
    axios
      .get<CertificateSchema>(`/api/certificate`, {
        params: {
          certificateId,
        },
      })
      .then((res) => {
        //eslint-disable-next-line
        useCertifcate(res.data);
      })
      .catch((e) => console.log(e));
  }, [certificateId]);

  if (!certificate) {
    return null;
  }

  const {
    certificateType,
    importCertificate,
    exportCertificate,
    documentScans,
    sentForAdjustment,
    company: { name },
  } = certificate || {};

  const {
    releaseDate,
    certificateNumber: importCertificateNumber,
    date: importCertificateDate,
  } = importCertificate || {};
  const {
    billNumber,
    certificateNumber: exportCertificateNumber,
    date: exportCertificateDate,
  } = exportCertificate || {};

  return (
    <div className="w-[80vw] p-5">
      <div className="w-full items-center">
        <h2 className="h-fit text-3xl text-center">
          {t("Certificate Number")}{" "}
          {(importCertificateNumber && importCertificateNumber) || exportCertificateNumber || "XXX"}
        </h2>
      </div>
      <div className="text-center min-h-[300px] mt-10">
        <div className="text-right mt-5">
          {certificateType === IMPORT_CERTIFICATE ? (
            <ProductListTable importCertificate={importCertificate} />
          ) : (
            <ProductListTable exportCertificate={exportCertificate} />
          )}
        </div>
      </div>
      <div className="w-full flex justify-between">
        <div>
          <h3 className="text-lg font-medium mb-5">{t("Additional Info")}</h3>
          <div className="flex flex-col items-start gap-2">
            <span>
              {t("Company")}: {name}
            </span>
            <span>
              {t("Certificate Date")}:{" "}
              {format((importCertificateDate && importCertificateDate) || exportCertificateDate, "dd-MM-yyyy")}
            </span>
            {releaseDate && (
              <span>
                {t("Certificate Release Date")}: {format(releaseDate, "dd-MM-yyyy")}
              </span>
            )}
            {billNumber && (
              <span>
                {t("Bill number")}: {billNumber}
              </span>
            )}

            <span>{sentForAdjustment ? `${t("Sent For Adjustment")} ✅` : `${t("Not Sent For Adjustment")} ❌`}</span>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-5">{t("PDF Scans")}</h3>
          <div className="flex flex-col items-start gap-10">
            {documentScans.map(({ type, path }, idx) => (
              <a href={path} target="_blank" className="flex items-center gap-1" key={idx}>
                <Link size={20} />
                {t(type)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
