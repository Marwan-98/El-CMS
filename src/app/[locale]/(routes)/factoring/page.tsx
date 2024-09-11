"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Company } from "@prisma/client";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/Datepicker";
import { CUSTOMS_CENTERS } from "./factoring.config";

function CertificateFactoring() {
  const [companies, useCompanies] = useState<Company[]>([]);
  const t = useTranslations();

  const formSchema = z.object({
    company: z.object({
      id: z.coerce.number(),
      name: z.string(),
      fullName: z.string(),
      codeName: z.string(),
    }),
    exportCertificate: z.object({
      certificateNumber: z.coerce.number(),
      billNumber: z.string(),
      date: z.date(),
    }),
    customsCenter: z.string(),
    importCertificates: z
      .object({
        certificateNumber: z.coerce.number(),
        date: z.date(),
      })
      .array(),
    torood: z.coerce.number(),
    netWeight: z.coerce.number(),
    itemsCount: z.coerce.number(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: {
        id: 0,
        name: "",
        fullName: "",
        codeName: "",
      },
      exportCertificate: {
        certificateNumber: 0,
        billNumber: "",
      },
      importCertificates: [
        {
          certificateNumber: 0,
        },
      ],
      torood: 0,
      netWeight: 0,
      itemsCount: 0,
    },
  });

  useEffect(() => {
    axios
      .get<Company[]>(`/api/companies`)
      //eslint-disable-next-line
      .then((res) => useCompanies(res.data))
      .catch((e) => console.log(e));
  }, []);

  const onSubmit = async (data: {
    company: Company;
    exportCertificate: { date: Date; certificateNumber: number };
    customsCenter: string;
    importCertificates: { date: Date; certificateNumber: number }[];
    torood: number;
    netWeight: number;
    itemsCount: number;
  }) => {
    const { company, customsCenter, exportCertificate, importCertificates, torood, itemsCount, netWeight } = data;

    await axios.post(`/api/factoring`, {
      company,
      customsCenter,
      exportCertificate,
      importCertificates,
      torood,
      itemsCount,
      netWeight,
    });
  };

  const { handleSubmit, control, setValue } = form;

  const { append: appendNewImportCertificate, fields: importCertificateFields } = useFieldArray({
    control,
    name: "importCertificates",
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-8 h-fit">
        <FormField
          control={form.control}
          name="company"
          render={() => (
            <FormItem>
              <FormLabel>{t("The Company")}</FormLabel>
              <Select
                onValueChange={(e) => {
                  const company = companies.find(({ id }) => id === +e);

                  setValue("company", company!);
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-[200px]" dir="rtl">
                    <SelectValue placeholder={t("Select a company")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent dir="rtl">
                  {companies.map((company) => (
                    <SelectItem value={String(company.id)} key={company.id}>
                      {company.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customsCenter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Customs Center")}</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-[200px]" dir="rtl">
                    <SelectValue placeholder={t("Customs Center")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent dir="rtl">
                  {CUSTOMS_CENTERS.map((custom, idx) => (
                    <SelectItem value={custom} key={idx}>
                      {custom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <div className="flex gap-5">
          <FormField
            control={form.control}
            name="exportCertificate.certificateNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Export Ceritificate Number")}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"exportCertificate.date"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Certificate Date")}</FormLabel>
                <FormControl>
                  <DatePicker field={field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="exportCertificate.billNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Bill number")}</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormLabel className="mb-5">{t("Ceritificates")}</FormLabel>
          {importCertificateFields.map((_, idx: number) => (
            <div key={idx} className="mb-3 flex gap-5 align-middle items-end">
              <FormField
                control={form.control}
                name={`importCertificates.${idx}.certificateNumber`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Import Ceritificate Number")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`importCertificates.${idx}.date`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Import Ceritificate Date")}</FormLabel>
                    <FormControl>
                      <DatePicker field={field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button
            variant="outline"
            className="block"
            onClick={() =>
              appendNewImportCertificate({
                certificateNumber: 0,
                date: new Date(),
              })
            }
            type="button"
          >
            {t("Add Number")}
          </Button>
        </div>

        <FormField
          control={form.control}
          name="torood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("torood numbers")}</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="itemsCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Items Count")}</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="netWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Net weight")}</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{t("Save Certificate")}</Button>
      </form>
    </Form>
  );
}

export default CertificateFactoring;
