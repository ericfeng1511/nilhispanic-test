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
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1A1F2C;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:1px;">NILHispanic</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1A1F2C;font-size:22px;">Welcome, ${fullName}!</h2>
              <p style="margin:0 0 16px;color:#444;font-size:15px;line-height:1.6;">
                Your email has been verified and your NILHispanic account is ready to go.
              </p>
              <p style="margin:0 0 24px;color:#444;font-size:15px;line-height:1.6;">
                NILHispanic is the platform built to connect Hispanic student-athletes with brands,
                opportunities, and a community that celebrates your story. We're glad you're here.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:#F97316;border-radius:6px;">
                    <a href="https://nilhispanic.com" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
                      Go to your dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#444;font-size:15px;line-height:1.6;">
                If you have any questions, reply to this email and we'll be happy to help.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f4f4f4;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#888;font-size:12px;">
                © ${new Date().getFullYear()} NILHispanic. All rights reserved.<br />
                You're receiving this because you created an account at nilhispanic.com.
              </p>
            </td>
          </tr>

        </table>
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
