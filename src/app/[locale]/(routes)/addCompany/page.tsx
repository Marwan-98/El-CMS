"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { Bounce, toast } from "react-toastify";

type FormValues = {
  companyName: string;
  companyCode: string;
};

const AddCompany = () => {
  const t = useTranslations();

  const formSchema = z.object({
    companyName: z.string(),
    companyCode: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyCode: "",
    },
  });

  const {
    formState: { isSubmitting },
    handleSubmit,
    reset,
  } = form;

  async function onSubmit(data: FormValues) {
    await axios
      .post("/api/companies", data)
      .then((res) => {
        if (res.status === 200) {
          reset();

          toast.success(t("Company Added!"), {
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

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 h-fit"
          encType="multipart/form-data"
        >
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Company name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("Company name")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companyCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Company code")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("Company code")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {t("Save company")}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddCompany;
