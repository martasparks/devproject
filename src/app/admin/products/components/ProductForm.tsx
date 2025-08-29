'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import ImageUpload, { ProductImage } from '@/components/ImageUpload';
import Image from 'next/image';
import { PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: Category | null;
  children?: Category[];
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  brandCode: string;
}

interface Product {
  id?: string;
  productCode: string;
  name: string;
  slug: string;
  categoryId: string;
  brandId?: string;
  shortDescription?: string;
  fullDescription?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  stockStatus: string;
  mainImageUrl?: string;
  mainImageKey?: string;
  width?: number;
  depth?: number;
  height?: number;
  weight?: number;
  notes?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  images?: Array<{
    id: string;
    imageUrl: string;
    imageKey?: string;
    altText?: string;
    order: number;
    isActive: boolean;
  }>;
}

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  brands: Brand[];
}

const STOCK_STATUS_OPTIONS = [
  { value: 'IN_STOCK', label: 'IR NOLIKTAVĀ' },
  { value: 'MANUFACTURER_DELIVERY', label: 'Piegāde no Ražotāja' }
];

export default function ProductForm({ product, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [formData, setFormData] = useState<Product>({
    productCode: product?.productCode || '',
    name: product?.name || '',
    slug: product?.slug || '',
    categoryId: product?.categoryId || '',
    brandId: product?.brandId || '',
    shortDescription: product?.shortDescription || '',
    fullDescription: product?.fullDescription || '',
    price: product?.price || 0,
    salePrice: product?.salePrice || undefined,
    stockQuantity: product?.stockQuantity || 0,
    stockStatus: product?.stockStatus || 'IN_STOCK',
    mainImageUrl: product?.mainImageUrl || '',
    mainImageKey: product?.mainImageKey || '',
    width: product?.width || undefined,
    depth: product?.depth || undefined,
    height: product?.height || undefined,
    weight: product?.weight || undefined,
    notes: product?.notes || '',
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || '',
    isActive: product?.isActive ?? true
  });

  // Initialize images from existing product
  useEffect(() => {
    if (product?.images) {
      const images: ProductImage[] = product.images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        imageKey: img.imageKey,
        altText: img.altText,
        order: img.order,
        isActive: img.isActive
      }));
      setProductImages(images);
    }
  }, [product]);

  // Generate product code when brand is selected (only for new products)
  useEffect(() => {
    if (formData.brandId && !product && !formData.productCode) {
      // Only generate code for new products
      generateProductCode(formData.brandId);
    }
  }, [formData.brandId, product]);

  // Generate slug from name
  useEffect(() => {
    if (formData.name && !product) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9ēūīāšģķļžčņ\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Helper function to find category in nested structure
      const findCategoryById = (cats: Category[], id: string): Category | null => {
        for (const cat of cats) {
          if (cat.id === id) return cat;
          if (cat.children) {
            const found = findCategoryById(cat.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      // Validate that selected category is a leaf category (has no children)
      const selectedCategory = findCategoryById(categories, formData.categoryId);
      if (!selectedCategory) {
        alert('Lūdzu izvēlieties kategoriju.');
        setIsSubmitting(false);
        return;
      }

      // Check if selected category has children - if so, it's not allowed
      if (selectedCategory.children && selectedCategory.children.length > 0) {
        alert('Lūdzu izvēlieties gala kategoriju (apakškategoriju), nevis galveno kategoriju.');
        setIsSubmitting(false);
        return;
      }

      // Validate that brand is selected
      if (!formData.brandId) {
        alert('Lūdzu izvēlieties ražotāju.');
        setIsSubmitting(false);
        return;
      }

      const url = product 
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products';
      
      const method = product ? 'PUT' : 'POST';

      // For edit mode, only send changed fields
      let dataToSend = { ...formData };

      // Generate new product code if brand changed (for edit mode)
      if (product && product.brandId !== formData.brandId) {
        try {
          console.log('Generating new product code for brand:', formData.brandId);
          const codeResponse = await fetch('/api/admin/products/generate-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ brandId: formData.brandId }),
          });
          
          console.log('Code response status:', codeResponse.status);
          
          if (codeResponse.ok) {
            const responseData = await codeResponse.json();
            console.log('Generated product code:', responseData);
            dataToSend.productCode = responseData.productCode;
          } else {
            const errorData = await codeResponse.json();
            console.error('API error:', errorData);
            throw new Error(errorData.error || 'Failed to generate product code');
          }
        } catch (error) {
          console.error('Error generating product code:', error);
          alert('Kļūda ģenerējot produkta kodu. Lūdzu mēģiniet vēlreiz.');
          setIsSubmitting(false);
          return;
        }
      }
      
      if (product && method === 'PUT') {
        const changedFields: Partial<Product> = {};
        
        // Compare each field and only include changed ones
        Object.keys(formData).forEach((key) => {
          const formKey = key as keyof Product;
          const currentValue = formData[formKey];
          const originalValue = product[formKey];
          
          // Handle different data types properly
          if (typeof currentValue === 'number' && typeof originalValue === 'number') {
            if (currentValue !== originalValue) {
              changedFields[formKey] = currentValue as any;
            }
          } else if (typeof currentValue === 'string' && typeof originalValue === 'string') {
            if (currentValue !== originalValue) {
              changedFields[formKey] = currentValue as any;
            }
          } else if (currentValue !== originalValue) {
            changedFields[formKey] = currentValue as any;
          }
        });
        
        // Always include required fields for validation
        dataToSend = {
          productCode: formData.productCode,
          name: formData.name,
          slug: formData.slug,
          categoryId: formData.categoryId,
          price: formData.price,
          stockQuantity: formData.stockQuantity,
          stockStatus: formData.stockStatus,
          isActive: formData.isActive,
          ...changedFields
        };
      }

      // Set main image from first product image if not set
      if (productImages.length > 0 && !dataToSend.mainImageUrl) {
        dataToSend.mainImageUrl = productImages[0].imageUrl;
        dataToSend.mainImageKey = productImages[0].imageKey;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save product');
      }

      const savedProduct = await response.json();
      
      // Handle product images
      if (productImages.length > 0) {
        await handleProductImages(savedProduct.id);
      }

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Kļūda saglabājot produktu. Lūdzu mēģiniet vēlreiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductImages = async (productId: string) => {
    try {
      // Get existing images if editing
      let existingImages: any[] = [];
      if (product) {
        const existingResponse = await fetch(`/api/admin/products/${productId}/images`);
        if (existingResponse.ok) {
          existingImages = await existingResponse.json();
        }
      }

      // Delete removed images
      const existingIds = existingImages.map(img => img.id);
      const currentIds = productImages.filter(img => img.id).map(img => img.id);
      const toDelete = existingIds.filter(id => !currentIds.includes(id));

      for (const imageId of toDelete) {
        await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
          method: 'DELETE'
        });
      }

      // Add new images and update existing ones
      for (const [index, image] of productImages.entries()) {
        if (image.isNew || !image.id) {
          // Create new image
          await fetch(`/api/admin/products/${productId}/images`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: image.imageUrl,
              imageKey: image.imageKey,
              altText: image.altText,
              order: index
            }),
          });
        } else {
          // Update existing image
          await fetch(`/api/admin/products/${productId}/images/${image.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: image.imageUrl,
              imageKey: image.imageKey,
              altText: image.altText,
              order: index,
              isActive: image.isActive
            }),
          });
        }
      }
    } catch (error) {
      console.error('Error handling product images:', error);
      // Don't throw here as the product is already saved
    }
  };

  const generateProductCode = async (brandId: string) => {
    try {
      const response = await fetch('/api/admin/products/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brandId }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, productCode: data.productCode }));
      }
    } catch (error) {
      console.error('Error generating product code:', error);
      // Don't show error to user, just leave productCode empty for manual entry
    }
  };

  // Render hierarchical category options - only show leaf categories (categories without children)
  const renderCategoryOptions = (categories: Category[], level: number = 0): React.ReactNode[] => {
    const options: React.ReactNode[] = [];
    
    // Sort categories: parents first, then children
    const sortedCategories = [...categories].sort((a, b) => {
      // If one has no parent and the other has a parent, prioritize the one without parent
      if (!a.parent && b.parent) return -1;
      if (a.parent && !b.parent) return 1;
      // Otherwise sort by name
      return a.name.localeCompare(b.name);
    });

    sortedCategories.forEach((category) => {
      // Only show top-level categories and their direct children at this level
      if (level === 0 && category.parent) return;
      
      const indent = '—'.repeat(level);
      const displayName = level > 0 ? `${indent} ${category.name}` : category.name;
      
      // Only add option if this category has no children (leaf category)
      // OR if it's a parent category, show it as disabled for context
      if (!category.children || category.children.length === 0) {
        // This is a leaf category - can be selected
        options.push(
          <option key={category.id} value={category.id}>
            {displayName}
          </option>
        );
      } else {
        // This is a parent category - show as disabled for context
        options.push(
          <option key={category.id} value="" disabled>
            {displayName} (izvēlieties apakškategoriju)
          </option>
        );
      }

      // Add children if they exist
      if (category.children && category.children.length > 0) {
        options.push(...renderCategoryOptions(category.children, level + 1));
      }
    });

    return options;
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lūdzu izvēlieties attēla failu.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Attēls ir pārāk liels. Maksimālais izmērs ir 5MB.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products/main-images');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      
      handleChange('mainImageUrl', uploadData.url);
      handleChange('mainImageKey', uploadData.key || '');
      
      // Clear the file input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading main image:', error);
      alert('Kļūda augšupielādējot attēlu. Lūdzu mēģiniet vēlreiz.');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Pamata informācija</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nosaukums *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ievadiet produkta nosaukumu"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandId">Ražotājs</Label>
            <select
              id="brandId"
              value={formData.brandId || ''}
              onChange={(e) => handleChange('brandId', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Izvēlieties ražotāju</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name} ({brand.brandCode})
                </option>
              ))}
            </select>
            {product && (
              <p className="text-xs text-gray-500">
                Mainot ražotāju, produkta kods tiks automātiski ģenerēts no jauna.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="productCode">Produkta kods *</Label>
            <Input
              id="productCode"
              value={formData.productCode}
              placeholder={formData.brandId ? "Automātiski ģenerēts..." : "Vispirms izvēlieties ražotāju"}
              required
              disabled
              className="bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">
              {formData.brandId 
                ? "Automātiski ģenerēts no ražotāja koda. Nevar rediģēt manuāli." 
                : "Tiks automātiski ģenerēts pēc ražotāja izvēles."
              }
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Kategorija *</Label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Izvēlieties kategoriju</option>
              {renderCategoryOptions(categories)}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="produkta-nosaukums"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">Aktīvs</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
              <Label htmlFor="isActive" className="text-sm text-gray-600">
                {formData.isActive ? 'Produkts ir aktīvs' : 'Produkts nav aktīvs'}
              </Label>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Īss apraksts</Label>
            <Textarea
              id="shortDescription"
              value={formData.shortDescription || ''}
              onChange={(e) => handleChange('shortDescription', e.target.value)}
              placeholder="Īss produkta apraksts"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullDescription">Pilns apraksts</Label>
            <Textarea
              id="fullDescription"
              value={formData.fullDescription || ''}
              onChange={(e) => handleChange('fullDescription', e.target.value)}
              placeholder="Detalizēts produkta apraksts"
              rows={6}
            />
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Cenas un noliktava</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price">Cena (EUR) *</Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              min="0"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              placeholder="0.000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salePrice">Akcijas cena (EUR)</Label>
            <Input
              id="salePrice"
              type="number"
              step="0.001"
              min="0"
              value={formData.salePrice || ''}
              onChange={(e) => handleChange('salePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Daudzums noliktavā</Label>
            <Input
              id="stockQuantity"
              type="number"
              min="0"
              value={formData.stockQuantity}
              onChange={(e) => handleChange('stockQuantity', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stockStatus">Noliktavas statuss</Label>
            <select
              id="stockStatus"
              value={formData.stockStatus}
              onChange={(e) => handleChange('stockStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STOCK_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Attēli</h3>
        
        <div className="space-y-6">
          {/* Main Image Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Galvenais attēls</Label>
              <p className="text-xs text-gray-500">
                Ja nav norādīts, tiks izmantots pirmais attēls no galerijas
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image Preview */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Priekšskatījums</Label>
                <div className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  {formData.mainImageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={formData.mainImageUrl}
                        alt="Galvenais attēls"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTJhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPktMVURBPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('mainImageUrl', '');
                          handleChange('mainImageKey', '');
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Nav attēla</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="lg:col-span-2 space-y-4">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Augšupielādēt failu</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      ref={(ref) => {
                        if (ref) {
                          (window as any).mainImageFileInput = ref;
                        }
                      }}
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => (window as any).mainImageFileInput?.click()}
                      disabled={uploading}
                    >
                      <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                      {uploading ? 'Augšupielādē...' : 'Izvēlēties failu'}
                    </Button>
                    {uploading && (
                      <div className="text-xs text-gray-500">
                        Augšupielādē galveno attēlu...
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="mainImageUrl" className="text-xs text-gray-600">Vai ievadiet URL</Label>
                  <Input
                    id="mainImageUrl"
                    value={formData.mainImageUrl || ''}
                    onChange={(e) => handleChange('mainImageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="text-sm"
                  />
                </div>

                {/* S3 Key */}
                <div className="space-y-2">
                  <Label htmlFor="mainImageKey" className="text-xs text-gray-600">S3 atslēga (automātiski)</Label>
                  <Input
                    id="mainImageKey"
                    value={formData.mainImageKey || ''}
                    onChange={(e) => handleChange('mainImageKey', e.target.value)}
                    placeholder="products/image-key"
                    className="text-sm"
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="border-t border-gray-200 pt-6">
            <ImageUpload
              productId={product?.id}
              images={productImages}
              onImagesChange={setProductImages}
              maxImages={10}
            />
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Izmēri</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="width">Platums (cm)</Label>
            <Input
              id="width"
              type="number"
              step="0.01"
              min="0"
              value={formData.width || ''}
              onChange={(e) => handleChange('width', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="depth">Dziļums (cm)</Label>
            <Input
              id="depth"
              type="number"
              step="0.01"
              min="0"
              value={formData.depth || ''}
              onChange={(e) => handleChange('depth', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Augstums (cm)</Label>
            <Input
              id="height"
              type="number"
              step="0.01"
              min="0"
              value={formData.height || ''}
              onChange={(e) => handleChange('height', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Svars (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              min="0"
              value={formData.weight || ''}
              onChange={(e) => handleChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6 space-y-2">
          <Label htmlFor="notes">Piezīmes</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Papildu piezīmes par produktu (iekšējam lietojumam)"
            rows={4}
          />
          <p className="text-xs text-gray-500">
            Šīs piezīmes ir redzamas tikai administrācijai un netiek rādītas mājas lapā.
          </p>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">SEO</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta virsraksts</Label>
            <Input
              id="metaTitle"
              value={formData.metaTitle || ''}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              placeholder="SEO optimizēts virsraksts"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta apraksts</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription || ''}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              placeholder="SEO optimizēts apraksts"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Atcelt
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saglabā...
            </div>
          ) : (
            product ? 'Atjaunināt produktu' : 'Izveidot produktu'
          )}
        </Button>
      </div>
    </form>
  );
}
