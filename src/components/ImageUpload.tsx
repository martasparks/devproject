'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  PhotoIcon, 
  TrashIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  PlusIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ProductImage {
  id?: string;
  imageUrl: string;
  imageKey?: string;
  altText?: string;
  order: number;
  isActive?: boolean;
  isNew?: boolean;
}

interface ImageUploadProps {
  productId?: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ 
  productId, 
  images, 
  onImagesChange, 
  maxImages = 10 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: ProductImage[] = [];
    setUploading(true);

    try {
      for (let i = 0; i < files.length && images.length + newImages.length < maxImages; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          alert(`Fails "${file.name}" nav attēls un tika izlaists.`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          alert(`Attēls "${file.name}" ir pārāk liels (maksimums 5MB).`);
          continue;
        }

        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'products/additional-images');

        try {
          // Upload to your upload endpoint
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed for ${file.name}`);
          }

          const uploadData = await uploadResponse.json();
          
          const newImage: ProductImage = {
            imageUrl: uploadData.url,
            imageKey: uploadData.key || null,
            altText: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            order: images.length + newImages.length,
            isActive: true,
            isNew: true
          };

          newImages.push(newImage);
        } catch (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          alert(`Kļūda augšupielādējot "${file.name}". Mēģiniet vēlreiz.`);
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // Reorder remaining images
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    onImagesChange(reorderedImages);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    
    // Swap images
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    
    // Update order values
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    onImagesChange(reorderedImages);
  };

  const updateImageAltText = (index: number, altText: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], altText };
    onImagesChange(newImages);
  };

  const addImageByUrl = () => {
    const url = prompt('Ievadiet attēla URL:');
    if (!url) return;

    const newImage: ProductImage = {
      imageUrl: url,
      altText: 'Produkta attēls',
      order: images.length,
      isActive: true,
      isNew: true
    };

    onImagesChange([...images, newImage]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-900">
          Produkta attēli ({images.length}/{maxImages})
        </h4>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageByUrl}
            disabled={images.length >= maxImages}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Pievienot URL
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= maxImages}
          >
            <CloudArrowUpIcon className="w-4 h-4 mr-2" />
            {uploading ? 'Augšupielādē...' : 'Augšupielādēt'}
          </Button>
        </div>
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Drop Zone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Velciet attēlus šeit vai <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-500"
            >
              izvēlieties failus
            </button>
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, GIF līdz 5MB. Maksimums {maxImages} attēli.
          </p>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              {/* Image Preview */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={image.imageUrl}
                  alt={image.altText || `Attēls ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTJhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPktMVURBPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>

              {/* Alt Text */}
              <div className="space-y-2">
                <Label htmlFor={`alt-${index}`} className="text-xs">
                  Alternatīvais teksts
                </Label>
                <Input
                  id={`alt-${index}`}
                  value={image.altText || ''}
                  onChange={(e) => updateImageAltText(index, e.target.value)}
                  placeholder="Aprakstiet attēlu"
                  className="text-xs"
                />
              </div>

              {/* Order Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Kārta: {index + 1}
                  {index === 0 && ' (Galvenais)'}
                </span>
                {image.isNew && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Jauns
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <div className="flex space-x-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(index, 'up')}
                    disabled={index === 0}
                    className="p-1"
                  >
                    <ArrowUpIcon className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(index, 'down')}
                    disabled={index === images.length - 1}
                    className="p-1"
                  >
                    <ArrowDownIcon className="w-3 h-3" />
                  </Button>
                </div>
                
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="p-1"
                >
                  <TrashIcon className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Nav pievienoti attēli</p>
        </div>
      )}
    </div>
  );
}
