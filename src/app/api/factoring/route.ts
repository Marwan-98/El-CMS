import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { company, customsCenter, exportCertificate, importCertificates, torood, itemsCount, netWeight } =
    await req.json();

  const { FILE_SYSTEM_SERVER_URL } = process.env;

  try {
    await axios.post(`${FILE_SYSTEM_SERVER_URL}/files/factoring/create`, {
      company,
      customsCenter,
      exportCertificate,
      importCertificates,
      torood,
      itemsCount,
      netWeight,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "SERVER ERROR" }, { status: 500 });
  }

  return NextResponse.json({ message: "SUCCESS" }, { status: 200 });
}
