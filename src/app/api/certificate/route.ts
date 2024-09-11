import { getCorrectDate } from "@/lib/utils";
import prisma from "@/services/prisma/db";
import { NextRequest, NextResponse } from "next/server";
import { extractDataFromFileName } from "./route.config";
import { extractDataFromForm, saveFilesToServer } from "../certificates/route.config";
import { EXPORT_CERTIFICATE, IMPORT_CERTIFICATE } from "@/app/[locale]/(routes)/addCertificate/AddCertificate.config";
import { ExportItem, ImportItem } from "@prisma/client";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const certificateId = searchParams.get("certificateId");

  if (!certificateId) {
    return NextResponse.json({ error: "No ID was provided!" }, { status: 400 });
  }

  const certificate = await prisma.certificate.findUnique({
    where: {
      id: +certificateId!,
    },
    include: {
      company: true,
      importCertificate: {
        include: {
          importItems: true,
        },
      },
      exportCertificate: {
        include: {
          exportItems: true,
        },
      },
      documentScans: true,
    },
  });

  if (!certificate) {
    return NextResponse.json({ error: "No certificate was found!" }, { status: 404 });
  }

  return NextResponse.json(certificate, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  const { documentName, documentType, directory } = await req.json();

  const { id, date } = extractDataFromFileName(documentName);

  if (!id || !date) {
    return NextResponse.json(
      { error: "File name format is not correct!" },
      {
        status: 400,
      }
    );
  }

  if (isNaN(Date.parse(date)) || date.split("-").length !== 3) {
    return NextResponse.json(
      { error: "Date Format is not Correct!" },
      {
        status: 400,
      }
    );
  }

  const foundCertificate = await prisma.certificate.findFirst({
    where: {
      OR: [
        {
          importCertificate: {
            certificateNumber: {
              equals: +id,
            },
            date: {
              equals: getCorrectDate(date)!,
            },
          },
        },
        {
          exportCertificate: {
            certificateNumber: {
              equals: +id,
            },
            date: {
              equals: getCorrectDate(date)!,
            },
          },
        },
      ],
    },
  });

  if (!foundCertificate) {
    return NextResponse.json(
      {
        error: "Certificate Not Found, Please make sure that the certificate number and date is correct!",
      },
      {
        status: 404,
      }
    );
  }

  const foundDocument = await prisma.documentScan.findFirst({
    where: {
      Certificate: {
        id: foundCertificate.id,
      },
      type: documentType,
    },
  });

  if (foundDocument) {
    return NextResponse.json("Document already scanned", { status: 201 });
  }

  const updatedCertificate = await prisma.certificate.update({
    where: {
      id: foundCertificate.id,
    },
    data: {
      documentScans: {
        create: {
          path: directory,
          type: documentType,
        },
      },
    },
  });

  if (!updatedCertificate) {
    return NextResponse.json(
      { error: "Certificate not found!" },
      {
        status: 400,
      }
    );
  }

  return NextResponse.json(updatedCertificate, { status: 200 });
}

export async function PUT(req: NextRequest) {
  const formData = await req.formData();

  const {
    certificateId,
    certificateType,
    certificateNumber,
    date,
    releaseDate,
    products,
    deletedProducts,
    companyCode,
    companyName,
    sentForAdjustment,
    billNumber,
    totalGrossWeight,
    totalNetWeight,
  } = extractDataFromForm(formData);

  type Rename<T, K extends keyof T, N extends string> = Pick<T, Exclude<keyof T, K>> & { [P in N]: T[K] };

  type RenamedImportItem = Rename<ImportItem, "id", "productId">;
  type RenamedExportItem = Rename<ExportItem, "id", "productId">;

  const documents = saveFilesToServer(formData, companyCode);

  const oldCertificate = await prisma.certificate.findUnique({
    where: {
      id: certificateId,
    },
    include: {
      importCertificate: true,
      exportCertificate: true,
    },
  });

  const importCertificate = oldCertificate?.importCertificate ?? undefined;
  const exportCertificate = oldCertificate?.exportCertificate ?? undefined;

  const { FILE_SYSTEM_SERVER_URL } = process.env;

  try {
    await axios.post(`${FILE_SYSTEM_SERVER_URL}/files/edit`!, {
      certificateType,
      formObject: extractDataFromForm(formData),
      companyName,
      oldCertificate: importCertificate || exportCertificate,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }

  const updatedCertificate = await prisma.certificate.update({
    where: {
      id: certificateId,
    },
    data: {
      importCertificate:
        certificateType === IMPORT_CERTIFICATE
          ? {
              update: {
                certificateNumber,
                date,
                releaseDate,
                importItems: {
                  upsert: (products as unknown as RenamedImportItem[]).map(
                    ({
                      productId,
                      name,
                      width,
                      weightPerLinearMeter,
                      incomingQuantity,
                      mixingRatio,
                      productWeight,
                    }) => ({
                      where: {
                        id: productId,
                      },
                      update: {
                        name,
                        mixingRatio,
                        width,
                        weightPerLinearMeter,
                        incomingQuantity,
                        productWeight,
                      },
                      create: {
                        name,
                        mixingRatio,
                        width,
                        weightPerLinearMeter,
                        incomingQuantity,
                        productWeight,
                      },
                    })
                  ),
                  deleteMany: (deletedProducts as { productId: number }[]).map((deletedProduct) => ({
                    id: deletedProduct.productId,
                  })),
                },
              },
            }
          : undefined,
      exportCertificate:
        certificateType === EXPORT_CERTIFICATE
          ? {
              update: {
                certificateNumber,
                date,
                billNumber,
                totalGrossWeight,
                totalNetWeight,
                exportItems: {
                  upsert: (products as unknown as RenamedExportItem[]).map(
                    ({ productId, name, netWeight, grossWeight }) => ({
                      where: {
                        id: productId,
                      },
                      update: {
                        name,
                        netWeight,
                        grossWeight,
                      },
                      create: {
                        name,
                        netWeight,
                        grossWeight,
                      },
                    })
                  ),
                  deleteMany: (deletedProducts as { productId: number }[]).map((deletedProduct) => ({
                    id: deletedProduct.productId,
                  })),
                },
              },
            }
          : undefined,
      documentScans: {
        upsert: documents.map((document) => ({
          where: {
            certificateId_type: {
              certificateId,
              type: document.type,
            },
          },
          update: {
            type: document.type,
            path: document.path,
          },
          create: {
            type: document.type,
            path: document.path,
          },
        })),
      },
      sentForAdjustment: sentForAdjustment === "YES" ? true : false,
    },
  });

  return NextResponse.json(updatedCertificate, { status: 201 });
}
