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
import AccountPageMinimal from './pages/AccountPageMinimal';
import { WishlistPage } from './pages/WishlistPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import AuthTestPage from './pages/AuthTestPage';
import SimpleAccountPage from './pages/SimpleAccountPage';
import DebugAccountPage from './pages/DebugAccountPage';

function App() {
  // Simple routing based on URL path
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const accountFull = params.get('full') === '1';
  
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

  // Default to minimal page for stability; use ?full=1 to load full account page
  if (path === '/account') {
    return <>{accountFull ? <AccountPage /> : <AccountPageMinimal />}<CartWidget /></>;
  }
  
  if (path === '/simple-account') { return <><SimpleAccountPage /></>; }
  
  if (path === '/debug-account') { return <><DebugAccountPage /></>; }

  if (path === '/wishlist') { return <><WishlistPage /><CartWidget /></>; }
  
  if (path === '/login') { return <><LoginPage /><CartWidget /></>; }
  
  if (path === '/signup') { return <><SignupPage /><CartWidget /></>; }
  
  if (path === '/order-confirmation') { return <><OrderConfirmationPage /><CartWidget /></>; }

  if (path === '/checkout/success') { return <><CheckoutSuccess /><CartWidget /></>; }
  if (path === '/checkout/cancel') { return <><CheckoutCancel /><CartWidget /></>; }
  
  if (path === '/auth-test') { return <><AuthTestPage /></>; }
  
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
