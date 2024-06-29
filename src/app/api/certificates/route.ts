import { EXPORT_CERTIFICATE, IMPORT_CERTIFICATE } from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import { ExportProduct, ImportProduct } from "@/lib/types";
import prisma from "@/services/prisma/db";
import { NextRequest, NextResponse } from "next/server";
import { getCorrectDate } from "@/lib/utils";
import { extractDataFromForm, saveFilesToServer, writeToExcelBook } from "./route.config";
import { CERTIFICATE_BOOK_NAMES_MAP, COMPANY } from "@/utils/constants";

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
    sentForAdjustment,
  } = extractDataFromForm(formData);

  if (certificateType === IMPORT_CERTIFICATE) {
    const foundImportCertificate = await prisma.importCertificate.findUnique({
      where: {
        certificateNumber_date: {
          certificateNumber,
          date,
        },
      },
    });

    if (foundImportCertificate) {
      return NextResponse.json({ error: "Certificate Already Created" }, { status: 400 });
    }
  } else {
    const foundExportCertificate = await prisma.exportCertificate.findUnique({
      where: {
        date_billNumber: {
          date,
          billNumber,
        },
      },
    });

    if (foundExportCertificate) {
      return NextResponse.json({ error: "Certificate Already Created" }, { status: 400 });
    }
  }

  const { codeName: companyCode, name: companyName } = await prisma.company
    .findUnique({
      where: {
        id: companyId,
      },
      select: {
        codeName: true,
        name: true,
      },
    })
    .then((res) => res!);

  const bookName = CERTIFICATE_BOOK_NAMES_MAP[certificateType];

  const { FILE_DIR_ROOT_PATH } = process.env;

  const bookPath = `${FILE_DIR_ROOT_PATH}/${COMPANY} ${companyName}/${bookName} ${companyName}.xlsx`;

  const documents = saveFilesToServer(formData, companyCode);

  await writeToExcelBook(bookPath, formData).catch(() => {
    return NextResponse.json(
      {
        error: "Something went wrong when writing certificate details in the book",
      },
      { status: 400 }
    );
  });

  const certificate = await prisma.certificate.create({
    data: {
      sentForAdjustment: sentForAdjustment === "YES" ? true : false,
      createdAt: new Date(),
      modifiedAt: new Date(),
      certificateType,
      importCertificate:
        certificateType === IMPORT_CERTIFICATE
          ? {
              create: {
                certificateNumber,
                date,
                releaseDate,
                importItems: {
                  createMany: {
                    data: (products as ImportProduct[]).map(
                      ({ name, width, weightPerLinearMeter, incomingQuantity, mixingRatio, productWeight }) => ({
                        name,
                        mixingRatio,
                        width,
                        weightPerLinearMeter,
                        incomingQuantity,
                        productWeight,
                      })
                    ),
                  },
                },
              },
            }
          : undefined,
      exportCertificate:
        certificateType === EXPORT_CERTIFICATE
          ? {
              create: {
                certificateNumber,
                date,
                totalGrossWeight,
                totalNetWeight,
                billNumber,
                exportItems: {
                  createMany: {
                    data: (products as ExportProduct[]).map(({ name, grossWeight, netWeight }) => ({
                      name,
                      grossWeight,
                      netWeight,
                    })),
                  },
                },
              },
            }
          : undefined,
      company: {
        connect: {
          id: companyId,
        },
      },
      documentScans: {
        createMany: {
          data: documents.map((document) => ({
            type: document.type,
            path: document.path,
          })),
        },
      },
    },
  });

  return NextResponse.json(certificate, { status: 200 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const certificateNumber = searchParams.get("certificateNumber");
  const dateFrom = getCorrectDate(searchParams.get("date[from]"));
  const dateTo = getCorrectDate(searchParams.get("date[to]"));
  const certificateType = searchParams.get("certificateType");

  if (certificateType === IMPORT_CERTIFICATE) {
    const certificates = await prisma.certificate.findMany({
      where: {
        importCertificate: {
          certificateNumber: {
            equals: +certificateNumber! || undefined,
          },
          date: {
            gte: dateFrom ? dateFrom : undefined,
            lte: dateTo ? dateTo : undefined,
          },
        },
      },
      select: {
        id: true,
        certificateType: true,
        sentForAdjustment: true,
        company: {
          select: {
            name: true,
          },
        },
        importCertificate: {
          select: {
            certificateNumber: true,
            date: true,
          },
        },
      },
    });

    if (!certificates.length) {
      return NextResponse.json({ error: "No certificates found!" }, { status: 404 });
    }

    return NextResponse.json(certificates, { status: 200 });
  }

  const certificates = await prisma.certificate.findMany({
    where: {
      exportCertificate: {
        certificateNumber: {
          equals: +certificateNumber! || undefined,
        },
        date: {
          gte: dateFrom ? dateFrom : undefined,
          lte: dateTo ? dateTo : undefined,
        },
      },
    },
    select: {
      id: true,
      certificateType: true,
      sentForAdjustment: true,
      company: {
        select: {
          name: true,
        },
      },
      exportCertificate: {
        select: {
          certificateNumber: true,
          date: true,
        },
      },
    },
  });

  if (!certificates.length) {
    return NextResponse.json({ error: "No certificates found!" }, { status: 404 });
  }

  return NextResponse.json(certificates, { status: 200 });
}
