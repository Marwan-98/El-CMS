"use client";
import { useTranslations } from "next-intl";

import { UseFormReset, useFieldArray, useForm } from "react-hook-form";
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
import { ExportCertificate, FormValues } from "@/lib/types";
import { TrashIcon } from "lucide-react";

const ExportCertificateForm = (props: {
  onSubmit: (values: FormValues, reset: UseFormReset<z.infer<typeof formSchema>>) => void;
  productQuantity: number;
  setProductQuantity: Dispatch<SetStateAction<number>>;
  documentQuantity: number;
  setDocumentQuantity: Dispatch<SetStateAction<number>>;
  certificate?: ExportCertificate;
}) => {
  const t = useTranslations();

  const { onSubmit, documentQuantity, setDocumentQuantity, certificate } = props;

  const formSchema = certificateFormSchema.extend({
    billNumber: z.string().min(1, { message: t("Bill Number is required") }),
    totalGrossWeight: z.coerce.number().min(1, { message: t("Total Gross Weight is required") }),
    totalNetWeight: z.coerce.number().min(1, { message: t("Total Net Weight required") }),
    products: z
      .object({
        productId: z.coerce.number().optional(),
        name: z.string().min(1, { message: t("Product name is required") }),
        grossWeight: z.coerce.number().min(1, { message: t("Gross Weight required") }),
        netWeight: z.coerce.number().min(1, { message: t("Net Weight required") }),
      })
      .array(),
    deletedProducts: z
      .object({
        productId: z.coerce.number(),
      })
      .array(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificateNumber: certificate?.exportCertificate?.certificateNumber || 0,
      date: new Date(certificate?.exportCertificate?.date || new Date()),
      billNumber: certificate?.exportCertificate?.billNumber || "",
      totalGrossWeight: certificate?.exportCertificate?.totalGrossWeight || 0,
      totalNetWeight: certificate?.exportCertificate?.totalNetWeight || 0,
      products: certificate?.exportCertificate?.exportItems.map((item) => ({ productId: item.id, ...item })) || [
        {
          productId: -1,
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
      sentForAdjustment: certificate?.sentForAdjustment ? "YES" : "NO",
      deletedProducts: [],
    },
  });

  const {
    control,
    formState: { isSubmitting },
    reset,
    handleSubmit,
  } = form;

  const {
    append: appendNewProduct,
    fields: productFields,
    remove: removeProductField,
  } = useFieldArray({ control, name: "products" });

  const { append: appendNewDeletedProduct } = useFieldArray({
    control,
    name: "deletedProducts",
  });

  const deleteProduct = (product: { productId: number; index: number }) => {
    appendNewDeletedProduct({ productId: product.productId });
    removeProductField(product.index);
  };

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
          {productFields.map((productField, idx: number) => {
            return (
              <div key={productField.id} className="flex gap-4 items-end mb-5">
                <FormField
                  control={form.control}
                  name={`products.${idx}.productId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} type="hidden" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  defaultValue=""
                  name={`products.${idx}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Product")}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t("Product Name")} />
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
                {!certificate && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      deleteProduct({ productId: productField.productId!, index: idx });
                    }}
                  >
                    <TrashIcon />
                  </Button>
                )}
              </div>
            );
          })}
          {!certificate && (
            <Button
              variant="outline"
              className="block"
              onClick={() =>
                appendNewProduct({
                  productId: -1,
                  name: "",
                  grossWeight: 0,
                  netWeight: 0,
                })
              }
              type="button"
            >
              {t("Add product")}
            </Button>
          )}
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
