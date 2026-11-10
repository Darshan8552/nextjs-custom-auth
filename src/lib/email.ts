import "server-only";
import { BrevoClient } from "@getbrevo/brevo";
import { env } from "@/lib/env";
import { AuthError } from "@/lib/auth/errors";

let client: BrevoClient | null = null;
function getClient(): BrevoClient {
  client ??= new BrevoClient({ apiKey: env().BREVO_API_KEY });
  return client;
}

function getSender(value: string): { email: string; name?: string } {
  const match = value.match(/^(.+?)\\s*<([^>]+)>$/);
  return match ? { name: match[1].trim(), email: match[2].trim() } : { email: value };
}

export type EmailContent = { subject: string; html: string; text: string };

const UNAVAILABLE = "Email service is unavailable right now. Please try again in a moment.";

export async function sendEmail(to: string, content: EmailContent): Promise<void> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await getClient().transactionalEmails.sendTransacEmail({
        sender: getSender(env().EMAIL_FROM),
        to: [{ email: to }],
        subject: content.subject,
        htmlContent: content.html,
        textContent: content.text,
      });
      return;
    } catch (err) {
      if (err instanceof AuthError) throw err;
      console.error(`[email] send attempt ${attempt} failed:`, err);
      if (attempt === 2) throw new AuthError("EMAIL_SERVICE_UNAVAILABLE", UNAVAILABLE);
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw new AuthError("EMAIL_SERVICE_UNAVAILABLE", UNAVAILABLE);
}
