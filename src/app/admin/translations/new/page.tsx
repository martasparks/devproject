import { redirect } from 'next/navigation';
import prisma from '@lib/prisma';
import Link from 'next/link';

export default function NewTranslationPage() {
  async function createTranslation(formData: FormData) {
    'use server';
    
    const locale = formData.get('locale') as string;
    const namespace = formData.get('namespace') as string;
    const key = formData.get('key') as string;
    const value = formData.get('value') as string;

    try {
      await prisma.translation.create({
        data: { locale, namespace, key, value }
      });
      redirect('/admin/translations');
    } catch (error) {
      // Apstrādāt kļūdas (piemēram, ja jau eksistē)
      console.error('Error creating translation:', error);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pievienot jaunu tulkojumu</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form action={createTranslation} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Valoda</label>
            <select 
              name="locale" 
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="lv">Latviešu (lv)</option>
              <option value="en">English (en)</option>
              <option value="ru">Русский (ru)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Namespace</label>
            <input 
              type="text" 
              name="namespace" 
              required
              placeholder="piemēram: SignIn, HomePage, etc."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Atslēga</label>
            <input 
              type="text" 
              name="key" 
              required
              placeholder="piemēram: email, welcome, etc."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vērtība</label>
            <textarea 
              name="value" 
              required
              rows={3}
              placeholder="Tulkojuma teksts"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link 
              href="/admin/translations"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Atcelt
            </Link>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Saglabāt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
