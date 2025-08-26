import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import EditTranslationForm from './components/EditTranslationForm';

export default async function EditTranslationPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const translation = await prisma.translation.findUnique({
    where: { id: parseInt(id) }
  });

  if (!translation) {
    redirect('/admin/translations');
  }

  return <EditTranslationForm translation={translation} />;
}
