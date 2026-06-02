const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();

    const record = payload?.record;
    if (!record) {
      return new Response('No record in payload', { status: 400 });
    }

    // Only fire on the transition NULL → non-null (new confirmation)
    const oldRecord = payload?.old_record;
    if (!record.email_confirmed_at || (oldRecord && oldRecord.email_confirmed_at)) {
      return new Response('Not a new confirmation event', { status: 200 });
    }

    const email = record.email;
    const fullName = record.raw_user_meta_data?.full_name || 'Athlete';

    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (!brevoApiKey) {
      console.error('BREVO_API_KEY secret is not set');
      return new Response('Missing API key', { status: 500 });
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Welcome to NIL Hispanic!</title>
  </head>
  <body style="margin:0;padding:0;background:#0b1b2a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b1b2a;">
      <tr>
        <td align="center" style="padding:32px 16px;">

          <!-- Card -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;">
            <tr>
              <td style="padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0b1b2a;">
                <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.35;">Welcome to ÑIL Hispanic™, ${fullName}!</h1>
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#334155;">
                  Your email has been verified and your ÑIL Hispanic™ account is ready to go.
                </p>
                <p style="margin:0 0 18px 0;font-size:16px;line-height:1.6;color:#334155;">
                  ÑIL Hispanic™ is the platform built to connect Hispanic student-athletes with brands,
                  opportunities, and a community that celebrates your story. We're glad you're here.
                </p>

                <!-- Primary CTA button -->
                <p style="margin:0 0 18px 0;">
                  <a
                    href="https://nilhispanic.com"
                    style="background:#ff6a00;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:bold;font-size:16px;"
                  >
                    Go to ÑIL Hispanic™
                  </a>
                </p>

                <p style="margin:0;font-size:13px;line-height:1.5;color:#64748b;">
                  If you have any questions, reply to this email and we'll be happy to help.
                </p>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <p style="font-family:Arial,Helvetica,sans-serif;color:#94a3b8;font-size:12px;margin:14px 0 0 0;">
            You're receiving this because you created an account at nilhispanic.com.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
    `.trim();

    const emailPayload = {
      sender: { name: 'NILHispanic', email: 'no-reply@nilhispanic.com' },
      to: [{ email, name: fullName }],
      subject: 'Welcome to NILHispanic!',
      htmlContent,
    };

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Brevo API error:', errText);
      return new Response('Failed to send email', { status: 500 });
    }

    console.log(`Welcome email sent to ${email}`);
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
