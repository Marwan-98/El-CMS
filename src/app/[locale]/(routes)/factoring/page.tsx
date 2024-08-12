"use client";

import React, { useEffect, useState } from "react";
import { AlignmentType, Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
import axios from "axios";
import { Company } from "@prisma/client";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/Datepicker";
import { CUSTOMS_CENTERS } from "./factoring.config";
import { format } from "date-fns";

function generateDocument(
  company: string,
  customsCenter: string,
  exportCertificate: { date: Date; certificateNumber: number },
  importCertificates: number[],
  torood: number,
  netWeight: number,
  itemsCount: number
) {
  const { certificateNumber, date } = exportCertificate;

  const formattedDate = format(date, "dd/MM/yyyy");

  importCertificates.forEach((certificate: number) => {
    const document = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: "وزاره المالية" }),
            new Paragraph({ text: "مصلحة الجمارك" }),
            new Paragraph({ text: "ملحق إذن إفراج وارد البضائع السماح المؤقت والدروباك", alignment: "center" }),
            new Paragraph({ text: `رقم ${certificate} بتاريخ 23/5/2024 سماح مؤقت`, alignment: "center" }),
            new Paragraph({ text: `جمرك / ${customsCenter}` }),
            new Paragraph({ text: `اسم المستورد / ${company} ` }),
            new Paragraph({ text: "الصنف /                            اقمشه" }),
            new Paragraph({ text: "خصم الكميات المصدره", alignment: "center" }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: `تم تصدير عدد (${torood}) طرد  بكميه (${itemsCount}) قطعه ملابس جاهزه بوزن صافي (${netWeight}) كجم بالشهاده رقم (${certificateNumber}) بتاريخ ${formattedDate}`,
            }),
          ],
          properties: {
            page: {
              size: {
                orientation: "landscape",
              },
            },
          },
        },
      ],
      styles: {
        default: {
          document: {
            run: {
              size: "14pt",
              font: "Arial (Body CS)",
              rightToLeft: true,
            },
            paragraph: {
              alignment: AlignmentType.RIGHT,
              spacing: {
                after: 1.5,
              },
            },
          },
        },
      },
    });

    Packer.toBlob(document).then((blob) => {
      saveAs(blob, `تخصيم بادي شو رقم الاذن ${certificate} شهادة ${certificateNumber}.docx`);
    });
  });
}

function CertificateFactoring() {
  const [companies, useCompanies] = useState<Company[]>([]);
  const [importCertificatesNumber, setImportCertificatesNumber] = useState(1);
  const t = useTranslations();

  const formSchema = z.object({
    company: z.string(),
    exportCertificate: z.object({
      certificateNumber: z.coerce.number(),
      date: z.date(),
    }),
    customsCenter: z.string(),
    importCertificates: z.coerce.number().array(),
    torood: z.coerce.number(),
    netWeight: z.coerce.number(),
    itemsCount: z.coerce.number(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      exportCertificate: {
        certificateNumber: 0,
      },
      importCertificates: [],
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

  const onSubmit = (data: {
    company: string;
    exportCertificate: { date: Date; certificateNumber: number };
    customsCenter: string;
    importCertificates: number[];
    torood: number;
    netWeight: number;
    itemsCount: number;
  }) => {
    const { company, customsCenter, exportCertificate, importCertificates, torood, itemsCount, netWeight } = data;

    generateDocument(company, customsCenter, exportCertificate, importCertificates, torood, netWeight, itemsCount);
  };

  const { handleSubmit } = form;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-8 h-fit">
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("The Company")}</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-[200px]" dir="rtl">
                    <SelectValue placeholder={t("Select a company")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent dir="rtl">
                  {companies.map((company) => (
                    <SelectItem value={company.name} key={company.id}>
                      {company.name}
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
        </div>
        <div>
          <FormLabel className="mb-3">{t("Export Ceritificate Number")}</FormLabel>
          {Array.from({ length: importCertificatesNumber }).map((_, idx: number) => (
            <div key={idx} className="mb-3">
              <FormField
                control={form.control}
                name={`importCertificates.${idx}`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
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
            name="netWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Net Weight")}</FormLabel>
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
          <Button
            variant="outline"
            className="block"
            onClick={() => setImportCertificatesNumber((importCertificatesNumber) => importCertificatesNumber + 1)}
            type="button"
          >
            {t("Add Number")}
          </Button>
        </div>
        <Button type="submit">{t("Save Certificate")}</Button>
      </form>
    </Form>
  );
}

export default CertificateFactoring;
