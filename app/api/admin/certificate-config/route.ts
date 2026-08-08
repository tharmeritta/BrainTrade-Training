import { NextRequest, NextResponse } from 'next/server';
import { fsGet, fsSet } from '@/lib/server/db';
import { requireAdminOrIT } from '@/lib/session/server';

export interface CertificateConfig {
  academyName: string;
  certificateTitle: string;
  subtitle: string;
  signatoryName: string;
  signatoryTitle: string;
  accentColor: string;
  customNotes: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_CERT_CONFIG: CertificateConfig = {
  academyName: 'BrainTrade Sales Excellence Academy',
  certificateTitle: 'Certificate of Completion',
  subtitle: 'This official document certifies that',
  signatoryName: 'Tharme Ritta',
  signatoryTitle: 'Head of Sales Training & QA',
  accentColor: '#818cf8',
  customNotes: 'Has successfully fulfilled all graduation criteria, course modules, sales quizzes, and AI audit evaluations with distinction.',
};

// GET /api/admin/certificate-config
export async function GET() {
  try {
    const config = await fsGet<CertificateConfig>('certificate_config', 'default');
    return NextResponse.json(config || DEFAULT_CERT_CONFIG);
  } catch (err) {
    console.error('Failed to load certificate config:', err);
    return NextResponse.json(DEFAULT_CERT_CONFIG);
  }
}

// POST /api/admin/certificate-config
export async function POST(req: NextRequest) {
  try {
    let user;
    try {
      user = await requireAdminOrIT();
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CertificateConfig = await req.json();
    
    const updatedConfig: CertificateConfig = {
      academyName: body.academyName || DEFAULT_CERT_CONFIG.academyName,
      certificateTitle: body.certificateTitle || DEFAULT_CERT_CONFIG.certificateTitle,
      subtitle: body.subtitle || DEFAULT_CERT_CONFIG.subtitle,
      signatoryName: body.signatoryName || DEFAULT_CERT_CONFIG.signatoryName,
      signatoryTitle: body.signatoryTitle || DEFAULT_CERT_CONFIG.signatoryTitle,
      accentColor: body.accentColor || DEFAULT_CERT_CONFIG.accentColor,
      customNotes: body.customNotes || DEFAULT_CERT_CONFIG.customNotes,
      updatedAt: new Date().toISOString(),
      updatedBy: user.name || user.uid,
    };

    await fsSet('certificate_config', 'default', updatedConfig);
    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (err: any) {
    console.error('Failed to update certificate config:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
