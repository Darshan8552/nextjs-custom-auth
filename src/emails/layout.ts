const FONT_SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const FONT_MONO =
  "'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

type EmailLayoutOptions = {
  label: string;
  title: string;
  preheader: string;
  bodyHtml: string;
  note: string;
};

export function emailLayout({
  label,
  title,
  preheader,
  bodyHtml,
  note,
}: EmailLayoutOptions): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f2f2ef;">
    <div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;color:#f2f2ef;font-size:1px;line-height:1px;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f2f2ef;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <!--[if mso]>
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td>
          <![endif]-->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:520px;background-color:#fafaf7;border:1px solid #d6d7d2;border-radius:4px;border-collapse:separate;">
            <tr>
              <td style="background-color:#141416;padding:14px 24px;border-radius:4px 4px 0 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-family:${FONT_SANS};font-size:14px;font-weight:700;letter-spacing:-0.2px;color:#f2f2ef;">Sallyport</td>
                    <td align="right" style="font-family:${FONT_MONO};font-size:9px;line-height:1;letter-spacing:1.6px;text-transform:uppercase;color:#a7a8a2;white-space:nowrap;">
                      <span style="display:inline-block;width:6px;height:6px;margin-right:7px;background-color:#d23b2e;vertical-align:middle;"></span>${label}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 24px 28px;">
                <h1 style="margin:0 0 12px;font-family:${FONT_SANS};font-size:25px;line-height:1.2;font-weight:600;letter-spacing:-0.6px;color:#141416;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background-color:#f2f2ef;border-top:1px dashed #d6d7d2;border-radius:0 0 4px 4px;">
                <p style="margin:0;font-family:${FONT_MONO};font-size:9px;line-height:1.6;letter-spacing:1.2px;text-transform:uppercase;color:#606366;">Sallyport access control</p>
                <p style="margin:6px 0 0;font-family:${FONT_SANS};font-size:11px;line-height:1.6;color:#606366;">${note}</p>
              </td>
            </tr>
          </table>
          <!--[if mso]>
          </td></tr></table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function emailParagraph(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT_SANS};font-size:14px;line-height:1.65;color:#606366;">${html}</p>`;
}

export function emailButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
    <tr>
      <td align="center" bgcolor="#141416" style="border-radius:4px;mso-padding-alt:12px 20px;">
        <a href="${href}" style="display:inline-block;padding:12px 20px;font-family:${FONT_SANS};font-size:14px;font-weight:600;line-height:1;color:#fafaf7;text-decoration:none;border-radius:4px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function emailMicroLabel(html: string): string {
  return `<p style="margin:0 0 8px;font-family:${FONT_MONO};font-size:9px;line-height:1.6;letter-spacing:1.4px;text-transform:uppercase;color:#606366;">${html}</p>`;
}

export { FONT_MONO, FONT_SANS };
