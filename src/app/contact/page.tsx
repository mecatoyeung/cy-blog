import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact | Cato Yeung",
  description: "Reach Cato by email or WhatsApp.",
};

const CONTACT_EMAIL = "me@catoyeung.com";
const WHATSAPP_NUMBER = "85296330385";
const WHATSAPP_DEFAULT_MESSAGE =
  "Hi, Cato. I would like to contact you for job opportunities or free consultancy services.";

const emailHref = `mailto:${CONTACT_EMAIL}`;
const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;

export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Contact Me</h1>
        <p className="text-sm text-muted-foreground">
          Choose email for a direct message or WhatsApp for a faster reply.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>
              Send a message directly to me@catoyeung.com.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ButtonLink href={emailHref} className="gap-2 bg-rose-600 text-white hover:bg-rose-700">
              <Mail size={18} className="text-rose-100" aria-hidden="true" />
              Open email app
            </ButtonLink>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/30">
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>
              Message me on WhatsApp at +852 96330385.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ButtonLink
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2 bg-rose-600 text-white hover:bg-rose-700"
            >
              <MessageCircle size={18} className="text-rose-100" aria-hidden="true" />
              Chat on WhatsApp
            </ButtonLink>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}