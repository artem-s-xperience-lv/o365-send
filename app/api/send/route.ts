import { NextResponse } from "next/server";
import { sendMailWithO365 } from "@/lib/o365";

type RequestBody = {
  to?: string | string[];
  subject?: string;
  body?: string;
};

function parseRecipients(rawTo: string | string[] | undefined): string[] {
  if (!rawTo) {
    return [];
  }

  const values = Array.isArray(rawTo) ? rawTo : [rawTo];

  return values
    .flatMap((value) => value.split(/[,\n;]/g))
    .map((value) => value.trim())
    .filter(Boolean);
}

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

  const to = parseRecipients(parsed.to);
  const subject = parsed.subject?.trim();
  const body = parsed.body?.trim();

  if (to.length === 0 || !subject || !body) {
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
