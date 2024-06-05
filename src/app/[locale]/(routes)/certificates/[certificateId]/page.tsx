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

  const { certificateNumber, certificateType, date, importCertificate, exportCertificate, documentScans } =
    certificate || {};

  const { releaseDate, importItems } = importCertificate || {};
  const { exportItems } = exportCertificate || {};

  return (
    <div className="w-full p-5">
      <div className="flex w-full justify-between items-center">
        <h6 className="h-fit">
          {t("Certificate No")}: {certificateNumber}
        </h6>
        <div>
          <h6>
            {t("Certificate Date")}: {format(date, "dd-MM-yyyy")}
          </h6>
          {certificateType === IMPORT_CERTIFICATE && (
            <h6>
              {t("Certificate Release Date")}: {format(releaseDate, "dd-MM-yyyy")}
            </h6>
          )}
        </div>
      </div>
      <div className="text-center min-h-[300px] mt-10">
        <h6>{t("Products")}</h6>
        <div className="text-right mt-5">
          {certificateType === IMPORT_CERTIFICATE ? (
            <ProductListTable importItems={importItems} />
          ) : (
            <ProductListTable exportItems={exportItems} />
          )}
        </div>
      </div>
      <div className="flex justify-end gap-5">
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
  );
}
