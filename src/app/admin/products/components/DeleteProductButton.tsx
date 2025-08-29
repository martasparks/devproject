'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }

      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Kļūda dzēšot produktu. Lūdzu mēģiniet vēlreiz.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <TrashIcon className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Dzēst produktu
            </h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Vai esat pārliecināts, ka vēlaties dzēst produktu{' '}
            <span className="font-semibold">"{productName}"</span>? 
            Šo darbību nevar atsaukt.
          </p>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              Atcelt
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Dzēš...
                </div>
              ) : (
                <>
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Dzēst
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setShowConfirm(true)}
    >
      <TrashIcon className="w-4 h-4" />
      Dzēst
    </Button>
  );
}
