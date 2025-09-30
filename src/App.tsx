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
    return <><ShopPage /><CartWidget /></>;
  }
  
  if (path === '/courses') {
    return <><CoursesPage /><CartWidget /></>;
  }
  
  if (path === '/blog') {
    return <><BlogPage /><CartWidget /></>;
  }
  
  if (path === '/about') {
    return <><AboutPage /><CartWidget /></>;
  }
  
  if (path === '/contact') {
    return <><ContactPage /><CartWidget /></>;
  }
  
  if (path === '/checkout') {
    return <><CheckoutPage /><CartWidget /></>;
  }

  if (path === '/privacy') { return <><PrivacyPage /><CartWidget /></>; }

  if (path === '/terms') { return <><TermsPage /><CartWidget /></>; }

  if (path === '/returns') { return <><ReturnsPage /><CartWidget /></>; }

  if (path === '/cookie-policy') { return <><CookiePolicyPage /><CartWidget /></>; }

  if (path === '/account') { return <><AccountPage /><CartWidget /></>; }
  
  if (path === '/order-confirmation') { return <><OrderConfirmationPage /><CartWidget /></>; }
  
  if (path === '/product-template-example') { return <><ProductTemplateExample /><CartWidget /></>; }
  
  if (path.startsWith('/courses/')) {
    const courseSlug = path.split('/courses/')[1];
    return <><CourseDetailPage courseSlug={courseSlug} /><CartWidget /></>;
  }
  
  if (path.startsWith('/products/')) {
    const productSlug = path.split('/products/')[1];
    return <><ProductDetailPage productSlug={productSlug} /><CartWidget /></>;
  }

  return (
    <>
      <HomePage />
      <CartWidget />
    </>
  );
}

export default App;
