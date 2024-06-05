"use client";
import { useEffect, useState } from "react";
import { Bounce, toast } from "react-toastify";
import ImportCertificateForm from "./components/ImportCertificateForm";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import ExportCertificateForm from "./components/ExportCertificateForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { EXPORT_CERTIFICATE, IMPORT_CERTIFICATE } from "./AddCertificate.config";
import type { Company } from "@prisma/client";
import { FormValues } from "@/lib/types";
import { UseFormReset } from "react-hook-form";
import { z } from "zod";
import "react-toastify/dist/ReactToastify.css";

export default function AddCertificate() {
  const t = useTranslations();

  const [certificateType, useCertificateType] = useState(EXPORT_CERTIFICATE);
  const [companies, useCompanies] = useState<Company[]>([]);
  const [selectedCompany, useSelectedCompany] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);
  const [documentQuantity, setDocumentQuantity] = useState(1);

  function onSubmit(
    values: FormValues,
    //eslint-disable-next-line
    reset: UseFormReset<z.infer<any>>
  ) {
    if (!selectedCompany) {
      alert(t("Please select a company"));

      return;
    }

    const data = new FormData();

    for (const key in values) {
      if (key === "products") {
        data.append(key, JSON.stringify(values[key]));
        continue;
      }

      if (key === "documentScans") {
        for (let i = 0; i < values["documentScans"].length; i++) {
          if (values["documentScans"][i].scan) {
            data.append(`${values["documentScans"][i].type}`, values["documentScans"][i].type || "");
            data.append(`${values["documentScans"][i].type}`, values["documentScans"][i].scan[0]);
          }
        }
        continue;
      }

      data.append(key, String(values[key as keyof typeof values]));
    }

    data.append("companyId", selectedCompany);
    data.append("certificateType", certificateType);

    return axios
      .post(`/api/certificates`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          reset();
          setProductQuantity(1);
          setDocumentQuantity(1);
          toast.success(t("Certificate Created!"), {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
            rtl: true,
          });
        }
      })
      .catch((e) => {
        const {
          response: {
            data: { error: errorMessage },
          },
        } = e;

        toast.error(t(errorMessage), {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
          rtl: true,
        });
      });
  }

  useEffect(() => {
    axios
      .get<Company[]>(`/api/companies`)
      //eslint-disable-next-line
      .then((res) => useCompanies(res.data))
      .catch((e) => console.log(e));
  }, []);

  return (
    <div>
      <div className="my-5">
        <Label htmlFor="certificateType">{t("Certificate type")}</Label>
        <RadioGroup id="certificateType" defaultValue={certificateType} className="justify-end flex">
          <div>
            <Label htmlFor="r1">{t("Import Certificate")}</Label>
            <RadioGroupItem
              value={IMPORT_CERTIFICATE}
              id="r1"
              onClick={({ currentTarget: { value } }) =>
                //eslint-disable-next-line
                useCertificateType(value)
              }
            />
          </div>
          <div>
            <Label htmlFor="r2">{t("Export Certificate")}</Label>
            <RadioGroupItem
              value={EXPORT_CERTIFICATE}
              id="r2"
              onClick={({ currentTarget: { value } }) =>
                //eslint-disable-next-line
                useCertificateType(value)
              }
            />
          </div>
        </RadioGroup>
      </div>
      <div className="my-5">
        <Select
          onValueChange={(val) => {
            //eslint-disable-next-line
            useSelectedCompany(val);
          }}
        >
          <SelectTrigger className="w-[180px]" dir="rtl">
            <SelectValue placeholder={t("Company name")} />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {companies.map(({ id, name }) => (
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
        />
      ) : (
        <ExportCertificateForm
          productQuantity={productQuantity}
          documentQuantity={documentQuantity}
          setProductQuantity={setProductQuantity}
          setDocumentQuantity={setDocumentQuantity}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}
