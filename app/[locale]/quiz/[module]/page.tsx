import QuizSystem from '@/components/features/QuizSystem';

export default async function QuizPage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  return <QuizSystem moduleId={module} />;
}
