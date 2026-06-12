import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type ContactRequest = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseBoolean(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return undefined;
}

export async function POST(request: Request) {
  let payload: ContactRequest;

  try {
    payload = (await request.json()) as ContactRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const name = asTrimmedString(payload.name);
  const email = asTrimmedString(payload.email);
  const subject = asTrimmedString(payload.subject);
  const message = asTrimmedString(payload.message);

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Name, email, subject, and message are required." },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPortRaw = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;
  const contactToEmail = process.env.CONTACT_TO_EMAIL ?? "me@catoyeung.com";

  if (!smtpHost || !smtpPortRaw || !smtpUser || !smtpPass || !smtpFrom) {
    return NextResponse.json(
      { error: "SMTP settings are not fully configured." },
      { status: 500 }
    );
  }

  const smtpPort = Number.parseInt(smtpPortRaw, 10);

  if (Number.isNaN(smtpPort)) {
    return NextResponse.json({ error: "SMTP_PORT must be a number." }, { status: 500 });
  }

  const secureFromEnv = parseBoolean(process.env.SMTP_SECURE);
  const secure = secureFromEnv ?? smtpPort === 465;

  try {
    const sendMessage = {
      from: smtpFrom,
      to: contactToEmail,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      text: [
        "New contact form submission",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        "",
        message,
      ].join("\n"),
    };

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail(sendMessage);
    } catch (firstError) {
      const shouldRetryWithAlternateTls =
        (smtpPort === 587 || smtpPort === 465) &&
        typeof firstError === "object" &&
        firstError !== null &&
        "code" in firstError &&
        (firstError as { code?: string }).code === "ESOCKET";

      if (!shouldRetryWithAlternateTls) {
        throw firstError;
      }

      const fallbackTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: !secure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await fallbackTransporter.sendMail(sendMessage);
    }
  } catch (error) {
    console.error("Failed to send contact email", error);
    return NextResponse.json(
      { error: "Failed to send email. Check SMTP_PORT/SMTP_SECURE pairing." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}