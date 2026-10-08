import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { dbService } from '../services/dbService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const PRODUCTS_STORAGE_KEY = 'jeonjulee_products_cache_v2';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Product) => Promise<{ success: boolean; message: string }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; message: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; message: string }>;
  refreshProducts: () => Promise<void>;
  syncAllToSupabase: () => Promise<{ success: boolean; count: number; message: string }>;
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

  // Supabase 클라우드에서 최신 상품 목록 가져오기
  const refreshProducts = async () => {
    if (!isSupabaseConfigured()) return;
    setIsLoading(true);
    try {
      const remote = await dbService.fetchProducts();
      if (remote && remote.length > 0) {
        persistProducts(remote);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 마운트 시 Supabase 동기화 시도
  useEffect(() => {
    refreshProducts();
  }, []);

  // 1. 신규 상품 등록
  const addProduct = async (newProduct: Product): Promise<{ success: boolean; message: string }> => {
    let result = { success: true, message: '로컬에 상품이 등록되었습니다.' };

    if (isSupabaseConfigured()) {
      result = await dbService.createProduct(newProduct);
    }

    const updated = [newProduct, ...products];
    persistProducts(updated);
    return result;
  };

  // 2. 상품 정보 수정
  const updateProduct = async (
    id: string,
    updates: Partial<Product>
  ): Promise<{ success: boolean; message: string }> => {
    let result = { success: true, message: '로컬에 상품 정보가 수정되었습니다.' };

    if (isSupabaseConfigured()) {
      result = await dbService.updateProduct(id, updates);
    }

    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    persistProducts(updated);
    return result;
  };

  // 3. 상품 삭제
  const deleteProduct = async (id: string): Promise<{ success: boolean; message: string }> => {
    let result = { success: true, message: '로컬에서 상품이 삭제되었습니다.' };

    if (isSupabaseConfigured()) {
      result = await dbService.deleteProduct(id);
    }

    const updated = products.filter((p) => p.id !== id);
    persistProducts(updated);
    return result;
  };

  // 4. 전체 상품 Supabase 일괄 업로드
  const syncAllToSupabase = async (): Promise<{ success: boolean; count: number; message: string }> => {
    const res = await dbService.syncAllProductsToSupabase(products);
    if (res.success) {
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
