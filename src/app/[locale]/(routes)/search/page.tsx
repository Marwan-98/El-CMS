"use client";
import { DatePickerWithRange } from "../../../../components/DatepickerWithRange";
import CertificateItem from "../../../../components/CertificateItem";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { EXPORT_CERTIFICATE, IMPORT_CERTIFICATE } from "../addCertificate/AddCertificate.config";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Certificate } from "@/lib/types";

export default function Search() {
  const t = useTranslations();
  const [certificates, useCertificates] = useState([]);

  const formSchema = z
    .object({
      certificateNumber: z.coerce.number(),
      date: z
        .object({
          from: z.date(),
          to: z.date(),
        })
        .partial(),
      certificateType: z.string(),
      form: z.null(),
    })
    .partial()
    .superRefine(({ certificateNumber, date }, ctx) => {
      if (!certificateNumber && !date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("Fill at least one field"),
          path: ["form"],
        });
      }
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificateNumber: 0,
      certificateType: EXPORT_CERTIFICATE,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    axios
      .get(`/api/certificates`, {
        params: {
          ...values,
        },
      })
      .then((res) => {
        //eslint-disable-next-line
        useCertificates(res.data);
      })
      .catch((e) => console.log(e));
  }

  console.log(certificates);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-10">
          <FormField
            control={form.control}
            name="certificateNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Certificate No")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("Certificate No")} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Certificate Date")}</FormLabel>
                <FormControl>
                  <DatePickerWithRange field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="certificateType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Certificate type")}</FormLabel>
                <FormControl>
                  <RadioGroup
                    className="justify-end flex"
                    {...field}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <div>
                      <Label>{t("Import Certificate")}</Label>
                      <RadioGroupItem value={IMPORT_CERTIFICATE} />
                    </div>
                    <div>
                      <Label>{t("Export Certificate")}</Label>
                      <RadioGroupItem value={EXPORT_CERTIFICATE} />
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" size={"wide"}>
            {t("Search")}
          </Button>
          <FormField name="form" render={() => <FormMessage />} />
        </form>
      </Form>
      <hr className="my-5" />
      <div className="flex gap-5 flex-wrap">
        {certificates.map((certificate: Certificate) => (
          <CertificateItem key={certificate.id} certificate={certificate} />
        ))}
      </div>
    </>
  );
}
