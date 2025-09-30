import React from 'react';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import CoursesPage from './pages/CoursesPage';
import { BlogPage } from './pages/BlogPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { CartWidget } from './components/cart/CartWidget';
import { ProductTemplateExample } from './pages/ProductTemplateExample';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { AccountPage } from './pages/AccountPage';

function App() {
  // Simple routing based on URL path
  const path = window.location.pathname;
  
  if (path === '/shop') {
    return <ShopPage />;
  }
  
  if (path === '/courses') {
    return <CoursesPage />;
  }
  
  if (path === '/blog') {
    return <BlogPage />;
  }
  
  if (path === '/about') {
    return <AboutPage />;
  }
  
  if (path === '/contact') {
    return <ContactPage />;
  }
  
  if (path === '/checkout') {
    return <CheckoutPage />;
  }

  if (path === '/privacy') {
    return <PrivacyPage />;
  }

  if (path === '/terms') {
    return <TermsPage />;
  }

  if (path === '/returns') {
    return <ReturnsPage />;
  }

  if (path === '/cookie-policy') {
    return <CookiePolicyPage />;
  }

  if (path === '/account') {
    return <AccountPage />;
  }
  
  if (path === '/order-confirmation') {
    return <OrderConfirmationPage />;
  }
  
  if (path === '/product-template-example') {
    return <ProductTemplateExample />;
  }
  
  if (path.startsWith('/courses/')) {
    const courseSlug = path.split('/courses/')[1];
    return <CourseDetailPage courseSlug={courseSlug} />;
  }
  
  if (path.startsWith('/products/')) {
    const productSlug = path.split('/products/')[1];
    return <ProductDetailPage productSlug={productSlug} />;
  }

  return (
    <>
      <HomePage />
      <CartWidget />
    </>
  );
}

export default App;
