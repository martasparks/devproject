import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';

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

  async function updateTranslation(formData: FormData) {
    'use server';
    
    const locale = formData.get('locale') as string;
    const namespace = formData.get('namespace') as string;
    const key = formData.get('key') as string;
    const value = formData.get('value') as string;

    await prisma.translation.update({
      where: { id: parseInt(id) },
      data: { locale, namespace, key, value }
    });
    
    redirect('/admin/translations');
  }

  async function deleteTranslation() {
    'use server';
    
    await prisma.translation.delete({
      where: { id: parseInt(id) }
    });
    
    redirect('/admin/translations');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Labot tulkojumu</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form action={updateTranslation} className="space-y-4">
          
          {/* Valoda */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Valoda</label>
            <select 
              name="locale" 
              defaultValue={translation.locale}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="lv">Latviešu (lv)</option>
              <option value="en">English (en)</option>
              <option value="ru">Русский (ru)</option>
            </select>
          </div>

          {/* Namespace */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Namespace</label>
            <input 
              type="text" 
              name="namespace" 
              defaultValue={translation.namespace}
              required
              placeholder="piemēram: SignIn, HomePage, etc."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Atslēga</label>
            <input 
              type="text" 
              name="key" 
              defaultValue={translation.key}
              required
              placeholder="piemēram: email, welcome, etc."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Vērtība</label>
            <textarea 
              name="value" 
              defaultValue={translation.value}
              required
              rows={3}
              placeholder="Tulkojuma teksts"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Pogas */}
          <div className="flex justify-between">
            <form action={deleteTranslation}>
              <button 
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Dzēst
              </button>
            </form>
            
            <div className="space-x-3">
              <Link 
                href="/admin/translations"
                className="inline-block px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Atcelt
              </Link>
              <button 
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Saglabāt izmaiņas
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
