"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormControl } from "./ui/form";
import { FieldValues } from "react-hook-form";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";

export function DatePicker(props: { field: FieldValues["date"] }) {
  const { field } = props;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={"outline"}
            className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
          >
            {field.value ? format(field.value, "PPP", { locale: arEG }) : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          lang="ar"
          dir="rtl"
          mode="single"
          selected={new Date(field.value)}
          onSelect={field.onChange}
          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
