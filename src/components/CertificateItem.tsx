import { IMPORT_CERTIFICATE } from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import { Certificate } from "@/lib/types";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function CertificateItem(props: Certificate) {
  const {
    certificateId,
    certificateNumber,
    certificateType,
    date,
    companyName,
  } = props;
  const t = useTranslations();

  return (
    <Link
      href={`certificates/${certificateId}`}
      className="rounded-sm shadow-slate-600 shadow p-1 mt-3 flex gap-20"
    >
      <span>{`${t("Certificate No")}: ${certificateNumber}`}</span>
      <span>{`${t("Certificate Type")}: ${
        certificateType === IMPORT_CERTIFICATE ? t("import") : t("export")
      }`}</span>
      <span>{`${t("Certificate Date")}: ${format(date, "dd/MM/yyyy")}`}</span>
      <span>{`${t("The Company")}: ${companyName}`}</span>
    </Link>
  );
}
