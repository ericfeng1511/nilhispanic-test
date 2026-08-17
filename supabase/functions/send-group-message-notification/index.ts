const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const RATE_LIMIT_MINUTES = 2;

const ROLE_TO_PATH: Record<string, string> = {
  admin: '/admin/dashboard',
  athlete: '/athlete/dashboard',
  high_school_athlete: '/highschool/dashboard',
  family_friend: '/family/dashboard',
  alumni: '/alumni/dashboard',
};

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const record = payload?.record;
    if (!record) {
      return new Response('No record in payload', { status: 400 });
    }

    const { group_id, sender_id, content } = record;
    if (!group_id || !sender_id) {
      return new Response('Missing group_id or sender_id', { status: 400 });
    }

    // Skip system messages (title changes, member removals, etc.)
    if (typeof content === 'string' && content.startsWith('[system]')) {
      return new Response('System message skipped', { status: 200 });
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

    // Fetch group title
    const groupRes = await fetch(
      `${supabaseUrl}/rest/v1/group_conversations?id=eq.${group_id}&select=title`,
      { headers: dbHeaders }
    );
    const groupRows = await groupRes.json();
    const groupTitle = groupRows?.[0]?.title || 'Group';

    // Fetch all participants except the sender, with their last_notified_at for rate limiting
    const partsRes = await fetch(
      `${supabaseUrl}/rest/v1/group_participants?group_id=eq.${group_id}&user_id=neq.${sender_id}&select=user_id,last_notified_at`,
      { headers: dbHeaders }
    );
    if (!partsRes.ok) {
      console.error('Failed to fetch participants:', await partsRes.text());
      return new Response('Failed to fetch participants', { status: 500 });
    }
    const participants: { user_id: string; last_notified_at: string | null }[] = await partsRes.json();

    if (!participants || participants.length === 0) {
      return new Response('No recipients', { status: 200 });
    }

    // Filter out recipients notified within the last RATE_LIMIT_MINUTES
    const now = Date.now();
    const eligible = participants.filter((p) => {
      if (!p.last_notified_at) return true;
      const elapsed = now - new Date(p.last_notified_at).getTime();
      return elapsed >= RATE_LIMIT_MINUTES * 60 * 1000;
    });

    if (eligible.length === 0) {
      console.log(`All recipients rate limited for group ${group_id}, skipping`);
      return new Response('Rate limited', { status: 200 });
    }

    // Batch-fetch sender + all eligible recipient profiles in one query
    const allIds = [sender_id, ...eligible.map((p) => p.user_id)];
    const profilesRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=in.(${allIds.join(',')})&select=id,full_name,email,role`,
      { headers: dbHeaders }
    );
    if (!profilesRes.ok) {
      console.error('Failed to fetch profiles:', await profilesRes.text());
      return new Response('Failed to fetch profiles', { status: 500 });
    }
    const profiles: { id: string; full_name: string | null; email: string; role: string }[] =
      await profilesRes.json();

    const senderProfile = profiles.find((p) => p.id === sender_id);
    const senderName = senderProfile?.full_name || 'Someone';

    const preview =
      content && content.length > 0
        ? content.slice(0, 120) + (content.length > 120 ? '…' : '')
        : '(attachment)';

    const nowIso = new Date().toISOString();

    for (const participant of eligible) {
      const recipientProfile = profiles.find((p) => p.id === participant.user_id);
      if (!recipientProfile?.email) continue;

      const recipientName = recipientProfile.full_name || 'there';
      const recipientRole = recipientProfile.role;
      const dashboardPath = ROLE_TO_PATH[recipientRole] ?? '/athlete/dashboard';
      const deepLink = `https://nilhispanic.com${dashboardPath}?openGroupChat=${group_id}`;

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
                  Hi ${recipientName}, you have a new message in <strong>${groupTitle}</strong> on ÑIL Hispanic™:
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
        subject: `New message from ${senderName} in ${groupTitle}`,
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
        console.error(`Brevo API error for ${recipientProfile.email}:`, await brevoRes.text());
        continue;
      }

      // Update last_notified_at for this participant
      await fetch(
        `${supabaseUrl}/rest/v1/group_participants?group_id=eq.${group_id}&user_id=eq.${participant.user_id}`,
        {
          method: 'PATCH',
          headers: { ...dbHeaders, Prefer: 'return=minimal' },
          body: JSON.stringify({ last_notified_at: nowIso }),
        }
      );

      console.log(`Group message notification sent to ${recipientProfile.email}`);
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
