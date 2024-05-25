import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "../globals.css";
import Sidebar from "../../components/Sidebar";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tajawal = Tajawal({ subsets: ["arabic", "latin"], weight: "700" });

export const metadata: Metadata = {
  title: "El Manar",
  description: "El Manar",
};

export default function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = useMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <html lang={locale} dir="rtl">
        <body className={`${tajawal.className} flex`}>
          <Sidebar />
          <div className="p-5 flex-grow min-h-screen">
            <ToastContainer />
            {children}
          </div>
        </body>
      </html>
    </NextIntlClientProvider>
  );
}
