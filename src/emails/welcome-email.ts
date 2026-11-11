import type { EmailContent } from "@/lib/types";
import {
  emailButton,
  emailLayout,
  emailMicroLabel,
  emailParagraph,
  FONT_MONO,
} from "./layout";

export function welcomeEmail(appUrl: string): EmailContent {
  const link = `${appUrl}/dashboard`;
  const html = emailLayout({
    label: "Access",
    title: "Welcome to Sallyport",
    preheader:
      "Your email is verified and your Sallyport access pass is active.",
    bodyHtml: `${emailParagraph("Your email is verified and your account is ready. Your Sallyport access pass is now active.")}
      ${emailMicroLabel("Credential status")}
      <p style="margin:0 0 20px;font-family:${FONT_MONO};font-size:10px;line-height:1.6;letter-spacing:1.2px;text-transform:uppercase;color:#1b6b4a;"><span style="display:inline-block;width:6px;height:6px;margin-right:7px;border-radius:50%;background-color:#1b6b4a;vertical-align:middle;"></span>Access pass active</p>
      ${emailButton(link, "Open your dashboard")}`,
    note: "You're receiving this because your email address was verified for a Sallyport account.",
  });

  const text = `Welcome to Sallyport. Your email is verified and your access pass is active. Open your dashboard: ${link}`;
  return { subject: "Welcome to Sallyport", html, text };
}
