import {
  EXPORT_CERTIFICATE,
  IMPORT_CERTIFICATE,
} from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import { ExportProduct, ImportProduct } from "@/lib/types";
import prisma from "@/services/prisma/db";
import { NextRequest, NextResponse } from "next/server";
import { getCorrectDate } from "@/lib/utils";
import {
  extractDataFromForm,
  writeFilesToServer,
  writeToExcelBook,
} from "./route.config";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const {
    certificateNumber,
    date,
    products,
    certificateType,
    companyId,
    releaseDate,
    billNumber,
    totalGrossWeight,
    totalNetWeight,
  } = extractDataFromForm(formData);

  const foundCertificate = await prisma.certificate.findUnique({
    where: {
      certificateNumber_date: {
        certificateNumber,
        date,
      },
    },
  });

  if (foundCertificate) {
    return NextResponse.json(
      { error: "Certificate Already Created" },
      { status: 400 }
    );
  }

  const companyCode = await prisma.company
    .findUnique({
      where: {
        id: companyId,
      },
      select: {
        codeName: true,
      },
    })
    .then((res) => res!.codeName);

  // const documents = writeFilesToServer(formData, companyCode);

  // const certificate = await prisma.certificate.create({
  //   data: {
  //     certificateNumber,
  //     date,
  //     receivedCopy: false,
  //     sentForAdjustment: false,
  //     createdAt: new Date(),
  //     modifiedAt: new Date(),
  //     certificateType,
  //     importCertificate:
  //       certificateType === IMPORT_CERTIFICATE
  //         ? {
  //             create: {
  //               releaseDate,
  //               importItems: {
  //                 createMany: {
  //                   data: (products as ImportProduct[]).map(
  //                     ({
  //                       name,
  //                       width,
  //                       weightPerLinearMeter,
  //                       incomingQuantity,
  //                       mixingRatio,
  //                     }) => ({
  //                       name,
  //                       mixingRatio,
  //                       width,
  //                       weightPerLinearMeter,
  //                       incomingQuantity,
  //                     })
  //                   ),
  //                 },
  //               },
  //             },
  //           }
  //         : undefined,
  //     exportCertificate:
  //       certificateType === EXPORT_CERTIFICATE
  //         ? {
  //             create: {
  //               totalGrossWeight,
  //               totalNetWeight,
  //               billNumber,
  //               exportItems: {
  //                 createMany: {
  //                   data: (products as ExportProduct[]).map(
  //                     ({ name, grossWeight, netWeight }) => ({
  //                       name,
  //                       grossWeight,
  //                       netWeight,
  //                     })
  //                   ),
  //                 },
  //               },
  //             },
  //           }
  //         : undefined,
  //     company: {
  //       connect: {
  //         id: companyId,
  //       },
  //     },
  //     documentScans: {
  //       createMany: {
  //         data: documents.map((document) => ({
  //           type: document.type,
  //           path: document.path,
  //         })),
  //       },
  //     },
  //   },
  // });

  await writeToExcelBook(
    "C:/Users/A/Desktop/Server Backup/شركة الأمل/كشف وارد الأمل تكس.xlsx",
    formData
  );

  return NextResponse.json("certificate", { status: 400 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const certificateNumber = searchParams.get("certificateNumber");
  const dateFrom = getCorrectDate(searchParams.get("date[from]"));
  const dateTo = getCorrectDate(searchParams.get("date[to]"));

  const certificates = await prisma.certificate.findMany({
    where: {
      certificateNumber: {
        equals: +certificateNumber! || undefined,
      },
      date: {
        gte: dateFrom ? dateFrom : undefined,
        lte: dateTo ? dateTo : undefined,
      },
    },
    include: {
      company: true,
    },
  });

  if (!certificates.length) {
    return NextResponse.json(
      { error: "No certificates found!" },
      { status: 404 }
    );
  }

  return NextResponse.json(certificates, { status: 200 });
}
