"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "next-intl";
import { FieldValues } from "react-hook-form";
import { arEG } from "date-fns/locale";

export function DatePickerWithRange({
  className,
  field,
}: {
  className?: React.HTMLAttributes<HTMLDivElement>;
  field: FieldValues["date"];
}) {
  const t = useTranslations();

  const [date] = React.useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  });

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start font-normal",
              !date && "text-muted-foreground"
            )}
          >
            {field.value?.from ? (
              field.value.to ? (
                <>
                  {format(field.value.from, "LLL dd, y", { locale: arEG })} -{" "}
                  {format(field.value.to, "LLL dd, y", { locale: arEG })}
                </>
              ) : (
                format(field.value.from, "LLL dd, y", { locale: arEG })
              )
            ) : (
              <span>{t("Pick a date")}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={field.value?.from}
            selected={field.value}
            onSelect={field.onChange}
            numberOfMonths={2}
            dir="rtl"
            lang="ar"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
