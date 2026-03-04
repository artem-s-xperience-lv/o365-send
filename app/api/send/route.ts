import { NextResponse } from "next/server";
import { sendMailWithO365 } from "@/lib/o365";

type RequestBody = {
  to?: string;
  subject?: string;
  body?: string;
};

export async function POST(request: Request) {
  let parsed: RequestBody;

  try {
    parsed = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const to = parsed.to?.trim();
  const subject = parsed.subject?.trim();
  const body = parsed.body?.trim();

  if (!to || !subject || !body) {
    return NextResponse.json(
      { ok: false, error: "Fields to, subject, and body are required" },
      { status: 400 }
    );
  }

  try {
    await sendMailWithO365({ to, subject, body });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}