import { Resend } from 'resend';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_placeholder') return null;
  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resend = getResend();
  if (!resend) {
    console.warn('[EMAIL] Resend não configurado. Link de reset:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`);
    return { message: 'Modo desenvolvimento: E-mail não enviado.' };
  }
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Fidelidade Digital <onboarding@resend.dev>', // Resend default for initial testing
      to: [email],
      subject: 'Recuperação de Senha - Fidelidade Digital',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Recuperação de Senha</h2>
          <p>Olá,</p>
          <p>Você solicitou a redefinição de sua senha no Fidelidade Digital. Clique no botão abaixo para criar uma nova senha:</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Redefinir Senha
            </a>
          </div>
          <p>Este link é válido por 1 hora.</p>
          <p>Se você não solicitou esta alteração, ignore este e-mail.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280;">Fidelidade Digital - Sua plataforma de fidelidade</p>
        </div>
      `,
    });

    if (error) {
      console.error('[EMAIL] Erro ao enviar e-mail:', error);
      throw new Error('Falha ao enviar e-mail de recuperação');
    }

    return data;
  } catch (err) {
    console.error('[EMAIL] Erro inesperado:', err);
    throw err;
  }
}
