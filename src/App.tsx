import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { SearchModal } from './components/common/SearchModal';
import { QuickViewModal } from './components/common/QuickViewModal';
import { PRODUCTS } from './data/products';
import { Product, ProductCategory } from './types';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { MyPage } from './pages/MyPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { WishlistPage } from './pages/WishlistPage';
import { BrandStoryPage } from './pages/BrandStoryPage';
import { NoticePage } from './pages/NoticePage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { AdminPage } from './pages/AdminPage';

export const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [searchParamCategory, setSearchParamCategory] = useState<ProductCategory>('ALL');
  const [searchParamQuery, setSearchParamQuery] = useState<string>('');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    // If URL is /product/:id, pre-select
    const path = window.location.pathname;
    if (path.startsWith('/product/')) {
      const id = path.replace('/product/', '');
      return PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
    }
    return null;
  });

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync state with popstate (browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const cat = (params.get('category') as ProductCategory) || 'ALL';
      const q = params.get('q') || '';

      setCurrentPath(path);
      setSearchParamCategory(cat);
      setSearchParamQuery(q);

      if (path.startsWith('/product/')) {
        const id = path.replace('/product/', '');
        const found = PRODUCTS.find((p) => p.id === id);
        if (found) setSelectedProduct(found);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (fullUrl: string) => {
    const [pathPart, queryPart] = fullUrl.split('?');
    const params = new URLSearchParams(queryPart || '');
    const cat = (params.get('category') as ProductCategory) || 'ALL';
    const q = params.get('q') || '';

    window.history.pushState({}, '', fullUrl);
    setCurrentPath(pathPart);
    setSearchParamCategory(cat);
    setSearchParamQuery(q);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    navigate(`/product/${product.id}`);
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleNavigateToShopWithSearch = (query: string) => {
    navigate(`/shop?q=${encodeURIComponent(query)}`);
  };

  // Route Resolver
  const renderRoute = () => {
    // Product Detail
    if (currentPath.startsWith('/product/')) {
      const prodId = currentPath.replace('/product/', '');
      const current = selectedProduct || PRODUCTS.find((p) => p.id === prodId) || PRODUCTS[0];
      return (
        <ProductDetailPage
          product={current}
          navigate={navigate}
          onSelectProduct={handleSelectProduct}
          onQuickView={handleQuickView}
        />
      );
    }

    // Category redirect to shop
    if (currentPath.startsWith('/category/')) {
      const cat = currentPath.replace('/category/', '').toUpperCase() as ProductCategory;
      return (
        <ShopPage
          initialCategory={cat}
          onSelectProduct={handleSelectProduct}
          onQuickView={handleQuickView}
        />
      );
    }

    switch (currentPath) {
      case '/shop':
        return (
          <ShopPage
            initialCategory={searchParamCategory}
            initialSearchQuery={searchParamQuery}
            onSelectProduct={handleSelectProduct}
            onQuickView={handleQuickView}
          />
        );
      case '/cart':
        return <CartPage navigate={navigate} onSelectProduct={handleSelectProduct} />;
      case '/checkout':
        return (
          <CheckoutPage
            navigate={navigate}
            onOrderCompleted={() => {}}
          />
        );
      case '/login':
        return <LoginPage navigate={navigate} />;
      case '/signup':
        return <SignUpPage navigate={navigate} />;
      case '/mypage':
        return <MyPage navigate={navigate} onSelectProduct={handleSelectProduct} />;
      case '/orders':
        return <OrderHistoryPage navigate={navigate} />;
      case '/wishlist':
        return (
          <WishlistPage
            navigate={navigate}
            onSelectProduct={handleSelectProduct}
            onQuickView={handleQuickView}
          />
        );
      case '/brand':
      case '/about':
        return <BrandStoryPage navigate={navigate} />;
      case '/notice':
        return <NoticePage navigate={navigate} />;
      case '/faq':
        return <FaqPage navigate={navigate} />;
      case '/contact':
        return <ContactPage navigate={navigate} />;
      case '/privacy':
        return <LegalPage type="privacy" navigate={navigate} />;
      case '/terms':
        return <LegalPage type="terms" navigate={navigate} />;
      case '/shipping-returns':
        return <LegalPage type="shipping-returns" navigate={navigate} />;
      case '/admin':
        return <AdminPage navigate={navigate} />;
      case '/':
      default:
        return (
          <HomePage
            navigate={navigate}
            onSelectProduct={handleSelectProduct}
            onQuickView={handleQuickView}
          />
        );
    }
  };

  const isAdminView = currentPath === '/admin';

  return (
    <div className="min-h-screen flex flex-col bg-paper-100 text-ink-900 font-sans selection:bg-ink-900 selection:text-paper-100">
      {/* Header */}
      {!isAdminView && (
        <Header
          currentPath={currentPath}
          navigate={navigate}
          openSearch={() => setSearchModalOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${!isAdminView ? 'pt-16 sm:pt-20' : ''}`}>
        {renderRoute()}
      </main>

      {/* Footer */}
      {!isAdminView && <Footer navigate={navigate} />}

      {/* Mobile Sticky Bottom Navigation Bar */}
      {!isAdminView && (
        <MobileBottomBar
          currentPath={currentPath}
          navigate={navigate}
          openSearch={() => setSearchModalOpen(true)}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectProduct={handleSelectProduct}
        onNavigateToShop={handleNavigateToShopWithSearch}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewDetail={handleSelectProduct}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
