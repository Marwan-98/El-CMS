"use client";
import { useTranslations } from "next-intl";

import { UseFormReset, useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@/components/Datepicker";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CLEARANCE_DOCUMENT,
  SALES_DOCUMENT,
  TEMPORARY_PERMIT_DOCUMENT,
  certificateFormSchema,
} from "../AddCertificate.config";
import { FormValues } from "@/lib/types";

const ImportCertificateForm = (props: {
  onSubmit: (values: FormValues, reset: UseFormReset<z.infer<typeof formSchema>>) => void;
  productQuantity: number;
  setProductQuantity: Dispatch<SetStateAction<number>>;
  documentQuantity: number;
  setDocumentQuantity: Dispatch<SetStateAction<number>>;
}) => {
  const t = useTranslations();

  const { onSubmit, productQuantity, setProductQuantity, documentQuantity, setDocumentQuantity } = props;

  const formSchema = certificateFormSchema.extend({
    releaseDate: z.date({
      required_error: t("Release date is required"),
    }),
    products: z
      .object({
        name: z.string().min(1, {
          message: t("Product name is required"),
        }),
        width: z.string().min(1, {
          message: t("Product width is required"),
        }),
        mixingRatio: z.string().min(1, {
          message: t("Mixing ratio is required"),
        }),
        weightPerLinearMeter: z.coerce.number().min(0.001, {
          message: t("Weight per linear meter is required"),
        }),
        incomingQuantity: z.coerce.number().min(1, {
          message: t("Incoming quantity is required"),
        }),
        productWeight: z.coerce.number(),
      })
      .array(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products: [
        {
          name: "",
          width: "",
          mixingRatio: "",
          weightPerLinearMeter: 0,
          incomingQuantity: 0,
          productWeight: 0,
        },
      ],
      documentScans: [
        {
          scan: null,
          type: "CLEARANCE_DOCUMENT",
        },
      ],
      sentForAdjustment: "YES",
    },
  });

  const {
    formState: { isSubmitting },
    reset,
    handleSubmit,
    watch,
    setValue,
  } = form;

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name?.match("incomingQuantity") || name?.match("weightPerLinearMeter")) {
        const inputIdx = name.split(".")[1];

        const { incomingQuantity, weightPerLinearMeter } = value!.products![+inputIdx]!;

        const productWeight = Math.floor(incomingQuantity! * weightPerLinearMeter!);

        setValue(`products.${+inputIdx}.productWeight`, productWeight);
      }
    });

    return () => subscription.unsubscribe();

    //eslint-disable-next-line
  }, [watch]);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit((data) => onSubmit(data, reset))}
        className="space-y-8 h-fit"
        encType="multipart/form-data"
      >
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
            name={"releaseDate"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Certificate Release Date")}</FormLabel>
                <FormControl>
                  <DatePicker field={field} />
                </FormControl>
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
                  name={`products.${idx}.mixingRatio`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Mixing ratio")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Mixing ratio")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`products.${idx}.width`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Width")}</FormLabel>
                      <FormControl>
                        <Input className="w-20" placeholder={t("Width")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`products.${idx}.weightPerLinearMeter`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Weight Per Linear Meter")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="w-24" step="0.001" max="0.999" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`products.${idx}.incomingQuantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Incoming Quantity")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="w-28" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`products.${idx}.productWeight`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Product Weight")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="w-28" disabled />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

export default ImportCertificateForm;
