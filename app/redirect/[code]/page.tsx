import { notFound } from 'next/navigation';
import { getLinkByCode } from '@/lib/queries';
import Redirector from '@/components/Redirector';

export default async function RedirectPage({
  params,
}: {
  params: { code: string };
}) {
  const link = await getLinkByCode(params.code);

  if (!link) {
    notFound();
  }

  return <Redirector code={params.code} />;
}
