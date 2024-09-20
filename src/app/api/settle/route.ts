import { getCorrectDate } from "@/lib/utils";
import prisma from "@/services/prisma/db";
import axios, { AxiosError, AxiosResponse } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const { certificates, company, certificateType, settlementNumber } = await req.json();
  let foundCertificates = [];

  try {
    if (certificateType === "IMPORT_CERTIFICATE") {
      foundCertificates = await Promise.all(
        certificates.map(async (certificate: { certificateNumber: number; certificateDate: string }) => {
          const foundCertificate = await prisma.certificate.findFirst({
            where: {
              importCertificate: {
                certificateNumber: certificate.certificateNumber,
                date: getCorrectDate(certificate.certificateDate)!,
              },
            },
          });

          if (foundCertificate) {
            return await prisma.importCertificate.update({
              where: {
                certificateNumber_date: {
                  certificateNumber: certificate.certificateNumber,
                  date: getCorrectDate(certificate.certificateDate)!,
                },
              },
              data: {
                certificate: {
                  update: {
                    sentForAdjustment: true,
                  },
                },
              },
            });
          } else {
            return {
              certificateNumber: certificate.certificateNumber,
              date: certificate.certificateDate,
            };
          }
        })
      );
    } else {
      foundCertificates = await Promise.all(
        certificates.map(async (certificate: { certificateNumber: number; certificateBillNumber: string }) => {
          const foundCertificate = await prisma.certificate.findFirst({
            where: {
              exportCertificate: {
                certificateNumber: certificate.certificateNumber,
                billNumber: certificate.certificateBillNumber,
              },
            },
          });

          if (foundCertificate) {
            return await prisma.exportCertificate.update({
              where: {
                certificateId: foundCertificate.id,
              },
              data: {
                certificate: {
                  update: {
                    sentForAdjustment: true,
                  },
                },
              },
            });
          } else {
            return {
              certificateNumber: certificate.certificateNumber,
              date: new Date("1970"),
            };
          }
        })
      );
    }
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong while updating the certificates" }, { status: 500 });
  }

  try {
    await axios.post("http://localhost:3001/files/settle", {
      certificates: foundCertificates,
      company,
      certificateType,
      settlementNumber,
    });
  } catch (error) {
    const { response } = error as AxiosError;
    const { data: errorData, status } = response as AxiosResponse;

    return NextResponse.json(
      {
        message: errorData.message,
        notFoundElements: errorData.notFoundCertificates || errorData.notFoundDocuments,
      },
      { status }
    );
  }

  return NextResponse.json({ message: "The operation has been performed successfully" }, { status: 200 });
}
