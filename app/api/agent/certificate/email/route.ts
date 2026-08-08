import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { fsGet } from '@/lib/server/db';
import type { Agent } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, agentName, email, score = 90, certificateId = 'BT-CERT-2026-88F19' } = body;

    if (!agentId && !email) {
      return NextResponse.json({ error: 'agentId or email is required' }, { status: 400 });
    }

    // Attempt to fetch email from Firestore agent profile if missing
    let targetEmail = email;
    let targetName = agentName || 'Sales Specialist';

    if (agentId) {
      const agentProfile = await fsGet<Agent>('agents', agentId);
      if (agentProfile) {
        targetName = agentProfile.name || targetName;
        if (!targetEmail && agentProfile.email) {
          targetEmail = agentProfile.email;
        }
      }
    }

    if (!targetEmail) {
      targetEmail = 'sales.agent@braintrade.com'; // Default fallback
    }

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    const certDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
          .badge { display: inline-block; background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 6px 16px; border-radius: 50px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; border: 1px solid rgba(129, 140, 248, 0.3); }
          .title { font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
          .body { padding: 32px 30px; }
          .recipient { font-size: 20px; font-weight: 800; color: #4f46e5; margin-bottom: 12px; }
          .desc { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .cert-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px; }
          .cert-id { font-family: monospace; font-size: 14px; font-weight: 700; color: #334155; letter-spacing: 1px; }
          .cert-score { font-size: 18px; font-weight: 900; color: #10b981; margin-top: 6px; }
          .footer { background: #f1f5f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="badge">BrainTrade Training Academy</div>
            <h1 class="title">🎓 Official Certificate of Completion</h1>
          </div>
          <div class="body">
            <p>Dear <span class="recipient">${targetName}</span>,</p>
            <p class="desc">Congratulations on successfully graduating from the <strong>BrainTrade Intelligent Sales Training Curriculum</strong>! Your competency and performance across all training modules, quizzes, and AI audits have met the highest standards.</p>
            
            <div class="cert-box">
              <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">Verification Serial</div>
              <div class="cert-id">${certificateId}</div>
              <div class="cert-score">Mastery Score: ${score}%</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Issued on ${certDate}</div>
            </div>

            <p class="desc">You can log back into your Agent Hub anytime to view or download your high-resolution Certificate of Completion.</p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} BrainTrade Training System · Verified Intelligent Learning Platform
          </div>
        </div>
      </body>
      </html>
    `;

    if (user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"BrainTrade Training Academy" <${user}>`,
        to: targetEmail,
        subject: `🎓 Congratulations ${targetName}! Your BrainTrade Training Certificate`,
        html: htmlContent,
      });

      return NextResponse.json({ success: true, sentTo: targetEmail, simulated: false });
    } else {
      // Development mode / SMTP fallback
      console.log(`[SMTP SIMULATION] Certificate Email dispatched to ${targetEmail} (${targetName}) - Serial: ${certificateId}`);
      return NextResponse.json({ 
        success: true, 
        sentTo: targetEmail, 
        simulated: true, 
        message: 'Certificate Email dispatched successfully (Development Mode)' 
      });
    }
  } catch (err: any) {
    console.error('Failed to send certificate email:', err);
    return NextResponse.json({ error: err.message || 'Failed to send certificate email' }, { status: 500 });
  }
}
