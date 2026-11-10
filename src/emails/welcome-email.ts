import type { EmailContent } from "@/lib/email";
import { emailLayout } from "./layout";

export function welcomeEmail(appUrl: string): EmailContent {
  const link = `${appUrl}/dashboard`;
  const html = emailLayout(
    "Welcome aboard!",
    `<p style="margin:0 0 16px;font-size:14px;line-height:1.5;">Your email is verified and your account is ready.</p>
     <a href="${link}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;">Go to your dashboard</a>`,
  );
  const text = `Welcome! Your email is verified and your account is ready. Go to your dashboard: ${link}`;
  return { subject: "Welcome! Your account is ready", html, text };
}
