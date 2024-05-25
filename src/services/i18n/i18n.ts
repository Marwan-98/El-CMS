import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { AbstractIntlMessages } from "next-intl";

const locales = ["ar"];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale)) notFound();

  const messages: AbstractIntlMessages | undefined = (
    await import(`../../../messages/${locale}.json`)
  ).default;

  return {
    messages,
  };
});
