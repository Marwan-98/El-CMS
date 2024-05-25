"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "next-intl";
import { FormControl } from "./ui/form";
import { FieldValues } from "react-hook-form";
import { arEG } from "date-fns/locale";

export function DatePicker(props: { field: FieldValues["date"] }) {
  const t = useTranslations();

  const { field } = props;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] pl-3 text-left font-normal justify-start",
              !field.value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-0 h-4 w-4 opacity-50" />
            {field.value ? (
              format(field.value, "PPP", { locale: arEG })
            ) : (
              <span>{t("Pick a date")}</span>
            )}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          lang="ar"
          dir="rtl"
          selected={field.value}
          onSelect={field.onChange}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
