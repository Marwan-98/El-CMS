"use client";

import { DatePicker } from "@/components/Datepicker";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Company } from "@prisma/client";
import { Select } from "@radix-ui/react-select";
import axios from "axios";
import { formatISO } from "date-fns";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

function SendToSettle() {
  const t = useTranslations();
  const [companies, useCompanies] = useState<Company[]>([]);

  useEffect(() => {
    axios
      .get<Company[]>(`/api/companies`)
      //eslint-disable-next-line
      .then((res) => useCompanies(res.data))
      .catch((e) => console.error(e));
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { certificates, companyName, certificateType } = values;

    try {
      await axios.put("/api/settle", {
        certificates,
        companyName,
        certificateType,
      });
    } catch (error) {
      // const { response } = error as AxiosError;
      // const { data: errorData, status } = response as AxiosResponse;
    }
  };

  const formSchema = z.object({
    certificates: z
      .object({
        certificateNumber: z.coerce.number(),
        certificateDate: z.date().optional(),
        certificateBillNumber: z.string().optional(),
      })
      .array(),
    companyName: z.string(),
    certificateType: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificates: [],
      companyName: "",
      certificateType: "",
    },
  });

  const {
    formState: { isSubmitting },
    handleSubmit,
    // reset,
    control,
    getValues,
    setValue,
  } = form;

  const { fields, append } = useFieldArray({ control, name: "certificates" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const data = e.target.value;
    const certificateType = getValues("certificateType");

    const yearRegex = /^\d{4}$/;

    if (data.includes("\t")) {
      const certficates = data.split(" ");

      if (certificateType === "IMPORT_CERTIFICATE") {
        certficates.map((certificate: string) => {
          const [certificateDate, certificateNumber] = certificate.split("\t");
          const [firstDatePart, secondDatePart, thirdDatePart] = certificateDate.split("/");

          if (yearRegex.test(firstDatePart)) {
            append({
              certificateNumber: +certificateNumber,
              certificateDate: new Date(formatISO(certificateDate)),
            });
          } else {
            append({
              certificateNumber: +certificateNumber,
              certificateDate: new Date(formatISO(`${thirdDatePart}/${secondDatePart}/${firstDatePart}`)),
            });
          }
        });
      } else {
        certficates.map((certificate: string) => {
          const [certificateYear, certificateBillNumber, certificateNumber] = certificate.split("\t");
          const billNumberWithYear = `${certificateBillNumber}/${certificateYear}`;

          append({
            certificateNumber: +certificateNumber,
            certificateBillNumber: billNumberWithYear,
          });
        });
      }
    }

    e.target.value = "";
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="certificateType"
            render={({ field }) => (
              <FormItem className="space-y-3 my-4">
                <FormLabel>{t("Certificate Type")}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(e) => {
                      field.onChange(e);
                      setValue("certificates", []);
                    }}
                    defaultValue={field.value}
                    className="justify-end flex"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="IMPORT_CERTIFICATE" />
                      </FormControl>
                      <FormLabel className="font-normal">{t("Import Certificate")}</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="EXPORT_CERTIFICATE" />
                      </FormControl>
                      <FormLabel className="font-normal">{t("Export Certificate")}</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"companyName"}
            render={({ field }) => (
              <Select onValueChange={field.onChange} {...field}>
                <SelectTrigger className="w-[180px] my-4" dir="rtl">
                  <SelectValue placeholder={t("Company name")} />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {companies.map(({ id, name }) => (
                    <SelectItem key={id} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {fields.map((field, idx) => (
            <div className="flex gap-5 mb-5" key={field.id}>
              <FormField
                control={form.control}
                name={`certificates.${idx}.certificateNumber`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Certificate No")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Certificate No")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`certificates.${idx}.certificateDate`}
                render={({ field }) => (
                  <FormItem hidden={getValues("certificateType") !== "IMPORT_CERTIFICATE"}>
                    <FormLabel>{t("Certificate Date")}</FormLabel>
                    <FormControl>
                      <DatePicker field={field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`certificates.${idx}.certificateBillNumber`}
                render={({ field }) => (
                  <FormItem hidden={getValues("certificateType") !== "EXPORT_CERTIFICATE"}>
                    <FormLabel>{t("Bill number")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Bill number")} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          ))}
          {fields.length > 0 && (
            <Button type="submit" disabled={isSubmitting}>
              {t("Sent to settle")}
            </Button>
          )}
        </form>
      </Form>
      {getValues("certificateType") && (
        <Input
          onChange={handleInputChange}
          className="my-4"
          style={{ display: fields.length > 0 ? "none" : "block" }}
        />
      )}
    </>
  );
}

export default SendToSettle;
