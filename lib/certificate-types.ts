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
  signatoryName: 'Prin Rittathanasit',
  signatoryTitle: 'Head of Sales Training & QA',
  accentColor: '#818cf8',
  customNotes: 'Has successfully fulfilled all graduation criteria, course modules, sales quizzes, and AI audit evaluations with distinction.',
};
