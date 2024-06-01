import prisma from "@/services/prisma/db";
import { NextRequest, NextResponse } from "next/server";
import { createFiles, createFolders } from "./route.config";

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

  await createFolders(companyCode, companyName).catch(() => {
    return NextResponse.json(
      { error: "Something went wrong when creating the folders" },
      { status: 500 }
    );
  });

  await createFiles(companyName).catch(() => {
    return NextResponse.json(
      { error: "Something went wrong when creating the files" },
      { status: 500 }
    );
  });

  const company = await prisma.company.create({
    data: {
      name: companyName,
      codeName: companyCode,
    },
  });

  return NextResponse.json(company, { status: 200 });
}
