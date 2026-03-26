import QuizSystem from '@/components/features/QuizSystem';

export default async function QuizPage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleId } = await params;
  return <QuizSystem moduleId={moduleId} />;
}
