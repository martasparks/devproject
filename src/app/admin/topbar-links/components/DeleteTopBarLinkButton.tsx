'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteTopBarLinkButtonProps {
  linkId: number;
  linkTitle: string;
}

export default function DeleteTopBarLinkButton({ linkId, linkTitle }: DeleteTopBarLinkButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/topbar-links/${linkId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Kļūda dzēšot linku. Lūdzu mēģiniet vēlreiz.');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-900"
        disabled={isDeleting}
      >
        {isDeleting ? 'Dzēš...' : 'Dzēst'}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Apstiprināt dzēšanu
            </h3>
            <p className="text-gray-600 mb-6">
              Vai esat pārliecināts, ka vēlaties dzēst linku "{linkTitle}"? 
              Šo darbību nevar atsaukt.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                disabled={isDeleting}
              >
                Atcelt
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Dzēš...' : 'Dzēst'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}