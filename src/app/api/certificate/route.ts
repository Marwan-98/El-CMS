import { getCorrectDate } from "@/lib/utils";
import prisma from "@/services/prisma/db";
import { NextRequest, NextResponse } from "next/server";
import { extractDataFromFileName } from "./route.config";

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
      company: {
        select: {
          name: true,
        },
      },
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

export async function PUT(req: NextRequest) {
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
