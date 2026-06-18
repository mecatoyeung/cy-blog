import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact | Cato Yeung",
  description: "Send a direct message to Cato via email.",
};

const WHATSAPP_NUMBER = "85296330385";
const WHATSAPP_DEFAULT_MESSAGE =
  "Hi, Cato. I would like to contact you for job opportunities or free consultancy services.";

const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;

export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <Card>
        <CardHeader>
          <CardTitle>Contact Me</CardTitle>
          <CardDescription>
            Send a message and it will be delivered to me@catoyeung.com.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm />
        </CardContent>
      </Card>

      <Card className="mt-6 border-rose-200 bg-rose-50/30">
        <CardHeader>
          <CardTitle>WhatsApp</CardTitle>
          <CardDescription>
            Prefer quick chat? Message me on WhatsApp at +852 96330385.
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
    </main>
  );
}