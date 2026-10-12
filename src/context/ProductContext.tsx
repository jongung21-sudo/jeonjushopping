import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { dbService } from '../services/dbService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const PRODUCTS_STORAGE_KEY = 'jeonjulee_products_cache_v2';
const PRODUCTS_SEEDED_KEY = 'jeonjulee_products_seeded_cpzyrpaenvzfshqqpmrf';

const STORAGE_IMAGES_SYNCED_KEY = 'jeonjulee_storage_products_images_synced_v1';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Product) => Promise<{ success: boolean; message: string }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; message: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; message: string }>;
  refreshProducts: () => Promise<void>;
  syncAllToSupabase: () => Promise<{ success: boolean; count: number; message: string }>;
  syncAttachedImagesToStorage: () => Promise<{ success: boolean; uploadedCount: number; message: string }>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return PRODUCTS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 로컬 스토리지에 캐시 동기화
  const persistProducts = (updated: Product[]) => {
    setProducts(updated);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  // 첨부 이미지 및 상품 이미지를 Supabase Storage 'products' 버킷에 일괄 저장
  const syncAttachedImagesToStorage = async (): Promise<{
    success: boolean;
    uploadedCount: number;
    message: string;
  }> => {
    const currentList = products.length > 0 ? products : PRODUCTS;
    const res = await dbService.syncAttachedImagesToStorage(currentList);
    if (res.success) {
      persistProducts(res.updatedProducts);
      if (res.uploadedCount > 0) {
        localStorage.setItem(STORAGE_IMAGES_SYNCED_KEY, 'true');
      }
    }
    return {
      success: res.success,
      uploadedCount: res.uploadedCount,
      message: res.message,
    };
  };

  // Supabase 클라우드에서 최신 상품 목록 가져오기 (테이블이 비어있으면 최초 1회 자동 업로드 + 첨부 이미지 Storage 자동 업로드)
  const refreshProducts = async () => {
    if (!isSupabaseConfigured()) return;
    setIsLoading(true);
    try {
      let activeList = products;
      const remote = await dbService.fetchProducts();
      if (remote && remote.length > 0) {
        activeList = remote;
        persistProducts(remote);
        localStorage.setItem(PRODUCTS_SEEDED_KEY, 'true');
      } else {
        // products 테이블은 존재하지만 아직 행이 0개인 경우 현재 상품 목록 자동 업로드
        const status = await dbService.checkProductsTableStatus();
        if (status.exists && status.count === 0 && !localStorage.getItem(PRODUCTS_SEEDED_KEY)) {
          const syncRes = await dbService.syncAllProductsToSupabase(products);
          if (syncRes.success) {
            localStorage.setItem(PRODUCTS_SEEDED_KEY, 'true');
            const afterSeed = await dbService.fetchProducts();
            if (afterSeed && afterSeed.length > 0) {
              activeList = afterSeed;
              persistProducts(afterSeed);
            }
          }
        }
      }

      // 첨부된 이미지(DataURL)가 있거나 최초 Storage 동기화가 아직 안 된 경우 자동으로 Storage 'products' 버킷에 저장
      const hasInlineDataImage = activeList.some(
        (p) =>
          (p.thumbnail && p.thumbnail.startsWith('data:image/')) ||
          (p.images && p.images.some((img) => img.startsWith('data:image/')))
      );
      if (hasInlineDataImage || !localStorage.getItem(STORAGE_IMAGES_SYNCED_KEY)) {
        const storageRes = await dbService.syncAttachedImagesToStorage(activeList);
        if (storageRes.success && storageRes.uploadedCount > 0) {
          persistProducts(storageRes.updatedProducts);
          localStorage.setItem(STORAGE_IMAGES_SYNCED_KEY, 'true');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 마운트 및 DB 연결 상태 변경 시 Supabase 동기화 시도
  useEffect(() => {
    refreshProducts();
    const handleConnectionChange = () => {
      refreshProducts();
    };
    window.addEventListener('supabase-connection-changed', handleConnectionChange);
    return () => window.removeEventListener('supabase-connection-changed', handleConnectionChange);
  }, []);

  // 1. 신규 상품 등록 (Supabase products 테이블에 즉시 업로드)
  const addProduct = async (newProduct: Product): Promise<{ success: boolean; message: string }> => {
    const updated = [newProduct, ...products];
    persistProducts(updated);

    if (isSupabaseConfigured()) {
      const result = await dbService.createProduct(newProduct);
      return result;
    }

    return { success: true, message: '로컬에 상품이 등록되었습니다.' };
  };

  // 2. 상품 정보 수정 (Supabase products 테이블에 즉시 수정/업서트)
  const updateProduct = async (
    id: string,
    updates: Partial<Product>
  ): Promise<{ success: boolean; message: string }> => {
    const existing = products.find((p) => p.id === id);
    const mergedProduct = existing ? { ...existing, ...updates } : undefined;
    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    persistProducts(updated);

    if (isSupabaseConfigured()) {
      const result = await dbService.updateProduct(id, updates, mergedProduct);
      return result;
    }

    return { success: true, message: '로컬에 상품 정보가 수정되었습니다.' };
  };

  // 3. 상품 삭제 (Supabase products 테이블에서 즉시 삭제)
  const deleteProduct = async (id: string): Promise<{ success: boolean; message: string }> => {
    const updated = products.filter((p) => p.id !== id);
    persistProducts(updated);
    localStorage.setItem(PRODUCTS_SEEDED_KEY, 'true');

    if (isSupabaseConfigured()) {
      const status = await dbService.checkProductsTableStatus();
      // 만약 DB 테이블이 아직 비어있던 상태에서 삭제를 누른 경우, 남은 상품들을 먼저 DB에 반영
      if (status.exists && status.count === 0 && updated.length > 0) {
        await dbService.syncAllProductsToSupabase(updated);
      }
      const result = await dbService.deleteProduct(id);
      return result;
    }

    return { success: true, message: '로컬에서 상품이 삭제되었습니다.' };
  };

  // 4. 전체 상품 Supabase 일괄 업로드
  const syncAllToSupabase = async (): Promise<{ success: boolean; count: number; message: string }> => {
    const listToSync = products.length > 0 ? products : PRODUCTS;
    const res = await dbService.syncAllProductsToSupabase(listToSync);
    if (res.success) {
      localStorage.setItem(PRODUCTS_SEEDED_KEY, 'true');
      await dbService.syncAttachedImagesToStorage(listToSync);
      await refreshProducts();
    }
    return res;
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts,
        syncAllToSupabase,
        syncAttachedImagesToStorage,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
