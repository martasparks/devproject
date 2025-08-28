'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteManufacturerButtonProps {
  manufacturerId: string;
  manufacturerName: string;
  hasProducts: boolean;
}

export default function DeleteManufacturerButton({ 
  manufacturerId, 
  manufacturerName, 
  hasProducts 
}: DeleteManufacturerButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (hasProducts) {
      toast.error('Nevar dzēst ražotāju, kam ir pievienoti produkti!', {
        duration: 5000,
        icon: '⚠️',
      });
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/manufacturers/${manufacturerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete manufacturer');
      }

      toast.success('Ražotājs veiksmīgi izdzēsts!', {
        duration: 3000,
        icon: '✅',
      });

      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      console.error('Error deleting manufacturer:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Kļūda dzēšot ražotāju. Lūdzu mēģiniet vēlreiz.',
        {
          duration: 5000,
          icon: '❌',
        }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="inline-flex items-center space-x-2">
        <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-800">Dzēst "{manufacturerName}"?</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(false)}
        >
          Atcelt
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting || hasProducts}
        >
          {isDeleting ? 'Dzēš...' : 'Dzēst'}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setShowConfirm(true)}
      disabled={hasProducts}
      title={hasProducts ? 'Nevar dzēst ražotāju ar produktiem' : 'Dzēst ražotāju'}
    >
      <TrashIcon className="w-4 h-4" />
      Dzēst
    </Button>
  );
}