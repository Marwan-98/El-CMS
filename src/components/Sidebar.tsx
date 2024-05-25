import { PlusCircle, Search, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Sidebar() {
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
    <aside className="bg-slate-100 w-52 p-5 text-center">
      <h1 className="mb-10">El Manar</h1>
      <nav>
        <ul className="flex flex-col gap-10">
          {linkMap.map((link, idx) => (
            <li className="flex items-center gap-2" key={idx}>
              {link.icon}
              <Link href={link.path}>{link.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
