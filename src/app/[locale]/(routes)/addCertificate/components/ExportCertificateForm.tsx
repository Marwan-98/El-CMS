"use client";
import { useTranslations } from "next-intl";

import { UseFormReset, useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@/components/Datepicker";
import { Dispatch, SetStateAction } from "react";
import {
  CLEARANCE_DOCUMENT,
  SALES_DOCUMENT,
  TEMPORARY_PERMIT_DOCUMENT,
  certificateFormSchema,
} from "../AddCertificate.config";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormValues } from "@/lib/types";

const ExportCertificateForm = (props: {
  onSubmit: (values: FormValues, reset: UseFormReset<z.infer<typeof formSchema>>) => void;
  productQuantity: number;
  setProductQuantity: Dispatch<SetStateAction<number>>;
  documentQuantity: number;
  setDocumentQuantity: Dispatch<SetStateAction<number>>;
}) => {
  const t = useTranslations();

  const { onSubmit, productQuantity, setProductQuantity, documentQuantity, setDocumentQuantity } = props;

  const formSchema = certificateFormSchema.extend({
    billNumber: z.string().min(1, { message: t("Bill Number is required") }),
    totalGrossWeight: z.coerce.number().min(1, { message: t("Total Gross Weight is required") }),
    totalNetWeight: z.coerce.number().min(1, { message: t("Total Net Weight required") }),
    products: z
      .object({
        name: z.string().min(1, { message: t("Product name is required") }),
        grossWeight: z.coerce.number().min(1, { message: t("Gross Weight required") }),
        netWeight: z.coerce.number().min(1, { message: t("Net Weight required") }),
      })
      .array(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billNumber: "",
      totalGrossWeight: 0,
      totalNetWeight: 0,
      products: [
        {
          name: "",
          grossWeight: 0,
          netWeight: 0,
        },
      ],
      documentScans: [
        {
          scan: null,
          type: "CLEARANCE_DOCUMENT",
        },
      ],
      sentForAdjustment: "NO",
    },
  });

  const {
    formState: { isSubmitting },
    reset,
    handleSubmit,
  } = form;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit((data) => onSubmit(data, reset))} className="space-y-8 h-fit">
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="certificateNumber"
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
            name={"date"}
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
            name="billNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Bill number")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("Bill number")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-5">
          <FormField
            control={form.control}
            name="totalGrossWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Total gross weight")}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" className="w-24" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalNetWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Total net weight")}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" className="w-24" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          {Array.from({ length: productQuantity }).map((_, idx: number) => {
            return (
              <div key={idx} className="flex gap-4 items-end mb-5">
                <FormField
                  control={form.control}
                  defaultValue=""
                  name={`products.${idx}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Product")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Product Name")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`products.${idx}.grossWeight`}
                  defaultValue={0}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Gross weight")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="w-24" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`products.${idx}.netWeight`}
                  defaultValue={0}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Net weight")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="w-28" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            );
          })}
          <Button
            variant="outline"
            className="block"
            onClick={() => setProductQuantity((productQuantity) => productQuantity + 1)}
            type="button"
          >
            {t("Add product")}
          </Button>
        </div>
        <div>
          {Array.from({ length: documentQuantity }).map((_, idx: number) => {
            return (
              <div className="flex gap-4 items-end mb-5" key={idx}>
                <FormField
                  control={form.control}
                  name={`documentScans.${idx}.scan`}
                  render={() => (
                    <FormItem>
                      <FormLabel>{t("PDF Scan")}</FormLabel>
                      <FormControl>
                        <Input accept="Application/pdf" type="file" {...form.register(`documentScans.${idx}.scan`)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`documentScans.${idx}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("PDF Scan Type")}</FormLabel>
                      <Select onValueChange={field.onChange} {...field}>
                        <FormControl>
                          <SelectTrigger className="w-[200px]" dir="rtl">
                            <SelectValue placeholder={t("Select Scan Type")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
                          <SelectItem value={CLEARANCE_DOCUMENT}>{t("Import Certificate (Permit)")}</SelectItem>
                          <SelectItem value={SALES_DOCUMENT}>{t("Export Certificate (Sales)")}</SelectItem>
                          <SelectItem value={TEMPORARY_PERMIT_DOCUMENT}>
                            {t("Export Certificate (Temporary Permit)")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            );
          })}
          <Button
            variant="outline"
            className="block"
            onClick={() => setDocumentQuantity((documentQuantity) => documentQuantity + 1)}
            type="button"
          >
            {t("Add document")}
          </Button>
        </div>
        <div>
          <FormField
            control={form.control}
            name={"sentForAdjustment"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Was the certificate sent for adjustment?")}</FormLabel>
                <Select onValueChange={field.onChange} {...field}>
                  <FormControl>
                    <SelectTrigger className="w-[250px]" dir="rtl">
                      <SelectValue placeholder={t("Was the certificate sent for adjustment?")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent dir="rtl">
                    <SelectItem value={"NO"}>{t("No")}</SelectItem>
                    <SelectItem value={"YES"}>{t("Yes")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {t("Save Certificate")}
        </Button>
      </form>
    </Form>
  );
};

export default ExportCertificateForm;
