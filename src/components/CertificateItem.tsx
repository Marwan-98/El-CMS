import { EXPORT_CERTIFICATE } from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import { Certificate } from "@/lib/types";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function CertificateItem({ certificate }: { certificate: Certificate }) {
  const {
    id,
    certificateType,
    company: { name },

    sentForAdjustment,
  } = certificate;

  const t = useTranslations();

  if (certificateType === EXPORT_CERTIFICATE) {
    const { exportCertificate: { certificateNumber, date } = {} } = certificate;

    return (
      <Link
        href={`certificates/${id}`}
        className={`rounded-lg w-72 h-fit border-2 p-2 flex flex-col gap-7 ${
          sentForAdjustment ? "sent-for-adjustment" : "not-sent-for-adjustment"
        }`}
      >
        <div className="flex justify-around text-xl">
          <span>{`${t("Export Certificate")}`}</span>
          <span>{name}</span>
        </div>
        <div className="text-center text-5xl">
          <span>{certificateNumber ? `${certificateNumber}` : "XXX"}</span>
        </div>
        <div className="text-center text-xl">
          <span>{`${format(date!, "yyyy-MM-dd")}`}</span>
        </div>
      </Link>
    );
  }

  const { importCertificate: { certificateNumber, date } = {} } = certificate;

  return (
    <Link
      href={`certificates/${id}`}
      className={`rounded-lg w-72 h-fit border-2 p-2 flex flex-col gap-7 ${
        sentForAdjustment ? "sent-for-adjustment" : "not-sent-for-adjustment"
      }`}
    >
      <div className="flex justify-around text-xl">
        <span>{`${t("Import Certificate")}`}</span>
        <span>{name}</span>
      </div>
      <div className="text-center text-5xl">
        <span>{`${certificateNumber}`}</span>
      </div>
      <div className="text-center text-xl">
        <span>{`${format(date!, "yyyy-MM-dd")}`}</span>
      </div>
    </Link>
  );
}
