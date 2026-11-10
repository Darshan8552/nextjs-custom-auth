import type { EmailContent } from "@/lib/email";
import {
  emailLayout,
  emailMicroLabel,
  emailParagraph,
  FONT_MONO,
  FONT_SANS,
} from "./layout";

export function otpEmail(code: string): EmailContent {
  const digits = code
    .split("")
    .map(
      (digit) =>
        `<td width="34" height="46" align="center" valign="middle" style="width:34px;height:46px;background-color:#f2f2ef;border:1px solid #d6d7d2;border-radius:4px;font-family:${FONT_MONO};font-size:21px;font-weight:500;text-align:center;color:#141416;">${digit}</td>`,
    )
    .join("");

  const html = emailLayout({
    label: "Verification",
    title: "Verify your email",
    preheader: `Your Sallyport verification code is ${code}. It expires in 10 minutes.`,
    bodyHtml: `${emailParagraph("Use this one-time code to verify your email address and activate your access pass.")}
      ${emailMicroLabel("One-time code")}
      <table role="presentation" cellpadding="0" cellspacing="4" border="0" style="margin:0 0 20px;border-collapse:separate;">
        <tr>${digits}</tr>
      </table>
      <p style="margin:0;font-family:${FONT_SANS};font-size:13px;line-height:1.65;color:#606366;">The code expires in <strong style="color:#141416;">10 minutes</strong>. Never share it with anyone.</p>`,
    note: "If you didn't request this code, you can safely ignore this email.",
  });

  const text = `Your Sallyport verification code is ${code}. It expires in 10 minutes. Never share it with anyone.`;
  return {
    subject: `${code} is your Sallyport verification code`,
    html,
    text,
  };
}
