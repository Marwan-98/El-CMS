import { DOCUMENT_TYPES } from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import prisma from "@/services/prisma/db";
import { mkdir, symlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { DOCUMENT_TYPES_IN_ARABIC } from "./route.config";

export async function GET() {
  const companies = await prisma.company.findMany();

  return NextResponse.json(companies, { status: 200 });
}

export async function POST(req: NextRequest) {
  const { companyName, companyCode } = await req.json();

  const foundCompany = await prisma.company.findUnique({
    where: {
      codeName: companyCode,
    },
  });

  if (foundCompany) {
    return NextResponse.json(
      { error: "Company already created" },
      { status: 400 }
    );
  }

  const company = await prisma.company.create({
    data: {
      name: companyName,
      codeName: companyCode,
    },
  });

  await mkdir(`${process.env.PDF_SAVE_PATH!}/${companyCode}`);
  await mkdir(`${process.env.PDF_SAVE_PATH!}/../شركة ${companyName}`);

  DOCUMENT_TYPES.map(async (type: string) => {
    await mkdir(`${process.env.PDF_SAVE_PATH!}/${companyCode}/${type}`);

    await symlink(
      `${process.env.PDF_SAVE_PATH!}/${companyCode}/${type}`,
      `${process.env.PDF_SAVE_PATH!}/../شركة ${companyName}/${
        DOCUMENT_TYPES_IN_ARABIC[type]
      }`
    );
  });

  return NextResponse.json(company, { status: 200 });
}
