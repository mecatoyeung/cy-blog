import { NextResponse } from "next/server";

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

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM ?? process.env.SMTP_FROM;
  const contactToEmail = process.env.CONTACT_TO_EMAIL ?? "me@catoyeung.com";

  if (!resendApiKey || !resendFrom) {
    return NextResponse.json({ error: "Resend settings are not fully configured." }, { status: 500 });
  }

  try {
    const sendMessage = {
      from: resendFrom,
      to: contactToEmail,
      reply_to: email,
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

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendMessage),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Failed to send contact email via Resend", errorBody);
      return NextResponse.json({ error: "Failed to send email via Resend." }, { status: 500 });
    }
  } catch (error) {
    console.error("Failed to send contact email", error);
    return NextResponse.json({ error: "Failed to send email via Resend." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}