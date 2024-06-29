"use client";
import { PlusCircle, Search, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const t = useTranslations();
  const linkMap = [
    {
      title: t("Search for certificates"),
      path: "/ar/search",
      icon: <Search size={20} />,
    },
    {
      title: t("Add Certificate"),
      path: "/ar/addCertificate",
      icon: <PlusCircle size={20} />,
    },
    {
      title: t("Add a company"),
      path: "/ar/addCompany",
      icon: <Building2 size={20} />,
    },
  ];

  return (
    <aside className="bg-[#EFEFEF] min-w-56 p-0 text-center">
      <h1 className="mb-10">El Manar</h1>
      <nav>
        <ul className="flex flex-col gap-10 w-[90%] m-auto">
          {linkMap.map((link, idx) => (
            <li
              className={`flex flex-grow items-center gap-2 p-2 rounded-md ${link.path === pathname ? "active" : ""}`}
              key={idx}
            >
              {link.icon}
              <Link href={link.path}>{link.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
