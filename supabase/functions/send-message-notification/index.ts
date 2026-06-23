const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const RATE_LIMIT_MINUTES = 2;

const ROLE_TO_PATH: Record<string, string> = {
  admin: '/admin/dashboard',
  athlete: '/athlete/dashboard',
  high_school_athlete: '/highschool/dashboard',
  family_friend: '/family/dashboard',
};

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const record = payload?.record;
    if (!record) {
      return new Response('No record in payload', { status: 400 });
    }

    const { conversation_id, sender_id, content } = record;
    if (!conversation_id || !sender_id) {
      return new Response('Missing conversation_id or sender_id', { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');

    if (!supabaseUrl || !serviceRoleKey || !brevoApiKey) {
      console.error('Missing required environment variables');
      return new Response('Missing environment variables', { status: 500 });
    }

    const dbHeaders = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    };

    // Fetch conversation to get participants and last notification times
    const convoRes = await fetch(
      `${supabaseUrl}/rest/v1/conversations?id=eq.${conversation_id}&select=admin_id,participant_id,participant_type,last_notified_admin_at,last_notified_participant_at`,
      { headers: dbHeaders }
    );
    if (!convoRes.ok) {
      console.error('Failed to fetch conversation:', await convoRes.text());
      return new Response('Failed to fetch conversation', { status: 500 });
    }
    const convos = await convoRes.json();
    if (!convos || convos.length === 0) {
      return new Response('Conversation not found', { status: 404 });
    }
    const convo = convos[0];

    // Determine recipient (the participant who did NOT send this message)
    const recipientIsAdmin = sender_id === convo.participant_id;
    const recipientId = recipientIsAdmin ? convo.admin_id : convo.participant_id;
    const notifiedAtColumn = recipientIsAdmin ? 'last_notified_admin_at' : 'last_notified_participant_at';

    // Rate limit: skip if a notification was already sent to this recipient within the last N minutes
    const lastNotifiedAt = convo[notifiedAtColumn];
    if (lastNotifiedAt) {
      const elapsed = Date.now() - new Date(lastNotifiedAt).getTime();
      if (elapsed < RATE_LIMIT_MINUTES * 60 * 1000) {
        console.log(`Rate limit active for ${notifiedAtColumn} on conversation ${conversation_id}, skipping`);
        return new Response('Rate limited', { status: 200 });
      }
    }

    // Fetch recipient and sender profiles in one query
    const profilesRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=in.(${recipientId},${sender_id})&select=id,full_name,email,role`,
      { headers: dbHeaders }
    );
    if (!profilesRes.ok) {
      console.error('Failed to fetch profiles:', await profilesRes.text());
      return new Response('Failed to fetch profiles', { status: 500 });
    }
    const profiles: { id: string; full_name: string | null; email: string; role: string }[] =
      await profilesRes.json();

    const recipientProfile = profiles.find((p) => p.id === recipientId);
    const senderProfile = profiles.find((p) => p.id === sender_id);

    if (!recipientProfile?.email) {
      console.error('Recipient profile or email not found');
      return new Response('Recipient not found', { status: 404 });
    }

    const recipientName = recipientProfile.full_name || 'there';
    const senderName = senderProfile?.full_name || 'Someone';
    const recipientRole = recipientProfile.role;
    const dashboardPath = ROLE_TO_PATH[recipientRole] ?? '/athlete/dashboard';
    const deepLink = `https://nilhispanic.com${dashboardPath}?openChat=${conversation_id}`;

    const preview =
      content && content.length > 0
        ? content.slice(0, 120) + (content.length > 120 ? '…' : '')
        : '(attachment)';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>New message from ${senderName}</title>
  </head>
  <body style="margin:0;padding:0;background:#0b1b2a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b1b2a;">
      <tr>
        <td align="center" style="padding:32px 16px;">

          <!-- Card -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;">
            <tr>
              <td style="padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0b1b2a;">
                <h1 style="margin:0 0 12px 0;font-size:20px;line-height:1.35;">New message from ${senderName}</h1>
                <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#334155;">
                  Hi ${recipientName}, you have a new message on ÑIL Hispanic™:
                </p>

                <!-- Message preview -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px 0;">
                  <tr>
                    <td style="background:#f1f5f9;border-left:4px solid #ff6a00;border-radius:4px;padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#334155;line-height:1.6;">
                      ${preview}
                    </td>
                  </tr>
                </table>

                <!-- CTA -->
                <p style="margin:0 0 18px 0;">
                  <a
                    href="${deepLink}"
                    style="background:#ff6a00;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:bold;font-size:15px;"
                  >
                    View Message
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
            You're receiving this because you have an account at nilhispanic.com.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
    `.trim();

    const emailPayload = {
      sender: { name: 'NIL Hispanic', email: 'no-reply@nilhispanic.com' },
      to: [{ email: recipientProfile.email, name: recipientName }],
      subject: `New message from ${senderName}`,
      htmlContent,
    };

    const brevoRes = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!brevoRes.ok) {
      console.error('Brevo API error:', await brevoRes.text());
      return new Response('Failed to send email', { status: 500 });
    }

    // Update the recipient-specific notified_at column
    await fetch(
      `${supabaseUrl}/rest/v1/conversations?id=eq.${conversation_id}`,
      {
        method: 'PATCH',
        headers: { ...dbHeaders, Prefer: 'return=minimal' },
        body: JSON.stringify({ [notifiedAtColumn]: new Date().toISOString() }),
      }
    );

    console.log(`Message notification sent to ${recipientProfile.email}`);
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
