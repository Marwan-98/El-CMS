"use client";
import { useEffect, useState } from "react";
import ImportCertificateForm from "../../../addCertificate/components/ImportCertificateForm";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import ExportCertificateForm from "../../../addCertificate/components/ExportCertificateForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { IMPORT_CERTIFICATE } from "../../../addCertificate/AddCertificate.config";
import type { Company } from "@prisma/client";
import { ExportCertificate, FormValues, ImportCertificate } from "@/lib/types";
import { UseFormReset } from "react-hook-form";
import { z } from "zod";
import "react-toastify/dist/ReactToastify.css";

export default function AddCertificate({ params: { certificateId } }: { params: { certificateId: string } }) {
  const t = useTranslations();

  const [certificate, setCertifcate] = useState<ImportCertificate | ExportCertificate | null>(null);

  const [certificateType, setCertificateType] = useState("");
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [documentQuantity, setDocumentQuantity] = useState(1);

  useEffect(() => {
    if (!companies) {
      axios
        .get<Company[]>(`/api/companies`)
        .then((res) => setCompanies(res.data))
        .catch((e) => console.log(e));
    }

    if (!certificate) {
      axios
        .get("/api/certificate?", {
          params: {
            certificateId,
          },
        })
        .then((res) => {
          const certificate = res.data;
          setCertifcate(certificate);
          setCertificateType(certificate.certificateType);
          setSelectedCompany(certificate.company);
          setProductQuantity((certificate as ImportCertificate)?.importCertificate?.importItems.length);
        });
    }
  }, [certificateId, certificate, companies]);

  function onSubmit(
    values: FormValues,
    //eslint-disable-next-line
    reset: UseFormReset<z.infer<any>>
  ) {
    const data = new FormData();

    for (const key in values) {
      if (key === "products") {
        data.append(key, JSON.stringify(values[key]));
        continue;
      }

      if (key === "deletedProducts") {
        data.append(key, JSON.stringify(values[key]));
        continue;
      }

      if (key === "documentScans") {
        for (let i = 0; i < values["documentScans"].length; i++) {
          if (values["documentScans"][i].scan) {
            data.append(`${values["documentScans"][i].type}_TYPE`, values["documentScans"][i].type || "");
            data.append(`${values["documentScans"][i].type}_FILE`, values["documentScans"][i].scan[0]);
          }
        }
        continue;
      }

      data.append(key, String(values[key as keyof typeof values]));
    }

    data.append("certificateType", certificateType);
    data.append("certificateId", certificateId);
    data.append("companyId", String(selectedCompany!.id!));
    data.append("companyCode", selectedCompany!.codeName!);
    data.append("companyName", selectedCompany!.name!);

    axios.put("/api/certificate", data).catch((e) => console.log(e));
  }

  if (!certificate) {
    return null;
  }

  return (
    <div>
      <div className="my-5">
        <Select
          onValueChange={(val) => {
            //eslint-disable-next-line
            setSelectedCompany(() => companies?.find((company) => String(company.id) === val)!);
          }}
          defaultValue={String(selectedCompany?.id)}
        >
          <Label>{t("Company name")}</Label>
          <SelectTrigger className="w-[180px]" dir="rtl">
            <SelectValue placeholder={t("Company name")} />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {companies?.map(({ id, name }) => (
              <SelectItem key={id} value={String(id)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {certificateType === IMPORT_CERTIFICATE ? (
        <ImportCertificateForm
          productQuantity={productQuantity}
          documentQuantity={documentQuantity}
          setProductQuantity={setProductQuantity}
          setDocumentQuantity={setDocumentQuantity}
          onSubmit={onSubmit}
          certificate={certificate as ImportCertificate}
        />
      ) : (
        <ExportCertificateForm
          productQuantity={(certificate as ExportCertificate).exportCertificate.exportItems.length}
          documentQuantity={certificate.documentScans.length || 1}
          setProductQuantity={setProductQuantity}
          setDocumentQuantity={setDocumentQuantity}
          onSubmit={onSubmit}
          certificate={certificate as ExportCertificate}
        />
      )}
    </div>
  );
}
