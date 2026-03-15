import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

const VALID_MODULES = ['product', 'process', 'payment'] as const;
type Module = typeof VALID_MODULES[number];

export default async function LearnPage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!VALID_MODULES.includes(module as Module)) redirect('/dashboard');

  const t = await getTranslations('learn');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t(module as Module)}</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">Content for {module} module coming soon.</p>
      </div>
    </div>
  );
}
