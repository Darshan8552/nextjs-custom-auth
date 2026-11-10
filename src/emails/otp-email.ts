import type { EmailContent } from "@/lib/email";
import { emailLayout } from "./layout";

export function otpEmail(code: string): EmailContent {
  const html = emailLayout(
    "Verify your email",
    `<p style="margin:0 0 16px;font-size:14px;line-height:1.5;">Use this code to verify your email address. It expires in 10 minutes.</p>
     <p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:8px;font-family:ui-monospace,Menlo,monospace;">${code}</p>
     <p style="margin:0;font-size:13px;color:#52525b;">Never share this code with anyone.</p>`,
  );
  const text = `Your verification code is ${code}. It expires in 10 minutes. Never share it with anyone.`;
  return { subject: `${code} is your verification code`, html, text };
}
