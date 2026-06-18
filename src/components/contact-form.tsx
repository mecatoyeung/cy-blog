"use client";

import { FormEvent, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormStatus =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "success" }
  | { state: "error"; message: string; mailtoHref?: string };

const initialStatus: FormStatus = { state: "idle" };
const CONTACT_EMAIL = "me@catoyeung.com";
const API_UNAVAILABLE_ERROR = "CONTACT_API_UNAVAILABLE";

function buildMailtoHref(payload: ContactPayload) {
  const body = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    "",
    payload.message,
  ].join("\n");

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>(initialStatus);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: "sending" });

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload: ContactPayload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 405) {
          throw new Error(API_UNAVAILABLE_ERROR);
        }

        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Unable to send your message right now.");
      }

      form.reset();
      setStatus({ state: "success" });
    } catch (error) {
      if (error instanceof Error && error.message === API_UNAVAILABLE_ERROR) {
        setStatus({
          state: "error",
          message:
            "This site is running as a static export, so direct form delivery is unavailable here. Use the email link below.",
          mailtoHref: buildMailtoHref(payload),
        });
        return;
      }

      const message = error instanceof Error ? error.message : "Unexpected error.";
      setStatus({ state: "error", message });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contact-name">Name</Label>
        <Input id="contact-name" name="name" autoComplete="name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">Email</Label>
        <Input id="contact-email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input id="contact-subject" name="subject" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" name="message" className="min-h-36" required />
      </div>

      <Button type="submit" 
        className="bg-rose-600 text-white hover:bg-rose-700"
        disabled={status.state === "sending"}>
        {status.state === "sending" ? "Sending..." : "Send Message"}
      </Button>

      {status.state === "success" ? (
        <p className="text-sm text-muted-foreground">Thanks, your message has been sent.</p>
      ) : null}

      {status.state === "error" ? (
        <div className="space-y-2 text-sm">
          <p className="text-red-600">{status.message}</p>
          {status.mailtoHref ? (
            <ButtonLink href={status.mailtoHref} className="bg-rose-600 text-white hover:bg-rose-700">
              Open email app
            </ButtonLink>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}