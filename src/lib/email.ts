import nodemailer from 'nodemailer'

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 465)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true para SSL/TLS, false para STARTTLS
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false, // aceita certificados self-signed
    },
    connectionTimeout: 10000,  // 10s para estabelecer conexão
    greetingTimeout: 10000,    // 10s para receber o greeting do servidor
    socketTimeout: 15000,      // 15s para operações de socket
  })
}

const TYPE_LABELS: Record<string, string> = {
  duvida: 'Dúvida',
  sugestao: 'Sugestão',
  anunciante: 'Anunciante',
}

export async function sendContactNotification(data: {
  name: string
  email: string
  type: string
  subject?: string | null
  message: string
}): Promise<void> {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('[email] SMTP não configurado — notificação de contato ignorada.')
    return
  }

  const to = process.env.CONTACT_EMAIL_TO
  const from = process.env.CONTACT_EMAIL_FROM ?? 'Virago 250 Peças'
  const user = process.env.SMTP_USER!

  if (!to) {
    console.warn('[email] CONTACT_EMAIL_TO não definido — notificação ignorada.')
    return
  }

  const typeLabel = TYPE_LABELS[data.type] ?? data.type
  const subjectLine = `[Contato] ${typeLabel} - ${data.name}`

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subjectLine}</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background-color:#18181b;border-radius:16px;border:1px solid #27272a;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#18181b;border-bottom:1px solid #27272a;padding:24px 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:rgba(249,115,22,0.1);border-radius:10px;padding:8px 10px;vertical-align:middle;">
                    <span style="font-size:20px;">🔧</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <p style="margin:0;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#ffffff;">
                      Virago 250 Peças
                    </p>
                    <p style="margin:2px 0 0;font-size:11px;color:#71717a;">Nova mensagem de contato</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Badge tipo -->
          <tr>
            <td style="padding:24px 32px 0;">
              <span style="display:inline-block;background-color:rgba(249,115,22,0.15);border:1px solid rgba(249,115,22,0.3);border-radius:999px;padding:4px 14px;font-size:12px;font-weight:600;color:#fb923c;text-transform:uppercase;letter-spacing:0.05em;">
                ${typeLabel}
              </span>
            </td>
          </tr>

          <!-- Dados do remetente -->
          <tr>
            <td style="padding:16px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;border-radius:12px;border:1px solid #27272a;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #27272a;">
                    <p style="margin:0 0 2px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#52525b;">Nome</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">${escapeHtml(data.name)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;${data.subject ? 'border-bottom:1px solid #27272a;' : ''}">
                    <p style="margin:0 0 2px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#52525b;">E-mail</p>
                    <a href="mailto:${escapeHtml(data.email)}" style="font-size:15px;font-weight:600;color:#fb923c;text-decoration:none;">${escapeHtml(data.email)}</a>
                  </td>
                </tr>
                ${data.subject ? `
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 2px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#52525b;">Assunto</p>
                    <p style="margin:0;font-size:15px;color:#d4d4d8;">${escapeHtml(data.subject)}</p>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Mensagem -->
          <tr>
            <td style="padding:16px 32px 32px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#52525b;">Mensagem</p>
              <div style="background-color:#09090b;border-radius:12px;border:1px solid #27272a;padding:20px;">
                <p style="margin:0;font-size:14px;line-height:1.7;color:#a1a1aa;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#09090b;border-top:1px solid #27272a;padding:16px 32px;">
              <p style="margin:0;font-size:12px;color:#3f3f46;text-align:center;">
                Para responder, clique em Responder — o Reply-To já aponta para o remetente.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    await transporter.sendMail({
      from: `"${from}" <${user}>`,
      to,
      subject: subjectLine,
      replyTo: `"${data.name}" <${data.email}>`,
      html,
    })
  } catch (err) {
    console.error('[email] Falha ao enviar notificação de contato:', err)
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
