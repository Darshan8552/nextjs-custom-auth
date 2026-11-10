import type { EmailContent } from "@/lib/email";
import { emailLayout } from "./layout";

export function resetPasswordEmail(resetUrl: string): EmailContent {
  const html = emailLayout(
    "Reset your password",
    `<p style="margin:0 0 16px;font-size:14px;line-height:1.5;">We received a request to reset your password. This link works once and expires in 1 hour.</p>
     <a href="${resetUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;">Reset password</a>
     <p style="margin:16px 0 0;font-size:12px;color:#52525b;word-break:break-all;">Or paste this link in your browser:<br/>${resetUrl}</p>`,
  );
  const text = `Reset your password using this link (valid for 1 hour, single use): ${resetUrl}`;
  return { subject: "Reset your password", html, text };
}
