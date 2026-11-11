import type { EmailContent } from "@/lib/types";
import {
  emailButton,
  emailLayout,
  emailMicroLabel,
  emailParagraph,
  FONT_MONO,
} from "./layout";

export function resetPasswordEmail(resetUrl: string): EmailContent {
  const html = emailLayout({
    label: "Recovery",
    title: "Reset your password",
    preheader:
      "A password reset was requested for your Sallyport account. The link expires in 1 hour.",
    bodyHtml: `${emailParagraph('We received a request to reset the password for your Sallyport access pass. This link works once and expires in <strong style="color:#141416;">1 hour</strong>.')}
      ${emailButton(resetUrl, "Reset password")}
      ${emailMicroLabel("Recovery link")}
      <p style="margin:0;padding:12px 14px;background-color:#f2f2ef;border:1px solid #d6d7d2;border-radius:4px;font-family:${FONT_MONO};font-size:11px;line-height:1.6;color:#606366;word-break:break-all;">Or paste this link in your browser:<br/><a href="${resetUrl}" style="color:#141416;text-decoration:underline;">${resetUrl}</a></p>`,
    note: "If you didn't request a password reset, you can ignore this email. Your password will not change.",
  });

  const text = `Reset your Sallyport password using this link (valid for 1 hour, single use): ${resetUrl}`;
  return { subject: "Reset your Sallyport password", html, text };
}
