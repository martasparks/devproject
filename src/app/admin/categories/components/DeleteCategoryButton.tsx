'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { TrashIcon } from '@heroicons/react/24/outline';

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
  hasChildren: boolean;
}

export default function DeleteCategoryButton({ categoryId, categoryName, hasChildren }: DeleteCategoryButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (hasChildren) {
    return (
      <Button variant="outline" size="sm" disabled>
        <TrashIcon className="w-4 h-4" />
        Nav dzēšams
      </Button>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }

      toast.success('Kategorija veiksmīgi dzēsta!', {
        duration: 3000,
        icon: '🗑️',
      });

      router.refresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Kļūda dzēšot kategoriju. Lūdzu mēģiniet vēlreiz.',
        {
          duration: 5000,
          icon: '❌',
        }
      );
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
      >
        <TrashIcon className="w-4 h-4" />
        {isDeleting ? 'Dzēš...' : 'Dzēst'}
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Apstiprināt dzēšanu
            </h3>
            <p className="text-gray-600 mb-6">
              Vai esat pārliecināts, ka vēlaties dzēst kategoriju &ldquo;{categoryName}&rdquo;? 
              Šo darbību nevar atsaukt.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                Atcelt
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Dzēš...' : 'Dzēst'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}