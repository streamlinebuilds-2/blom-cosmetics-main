import { useEffect, useState } from 'react';
import { Check, LockKeyhole, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { cartStore } from '../lib/cart';
import { supabase } from '../lib/supabase';

const OFFER_PATH = '/offers/trendy-ring-petal-paste';
const OFFER_IMAGE = 'https://res.cloudinary.com/dnlgohkcc/image/upload/v1785314350/IMG-20260728-WA0023_wssnnp.jpg';

interface OfferProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}

interface OfferResponse {
  coupon_code: string;
  products: OfferProduct[];
}

export function CourseOfferClaimPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Your Petal Paste Offer | BLOM Cosmetics';
    void supabase.auth.getSession().then(({ data }) => setIsLoggedIn(Boolean(data.session)));
  }, []);

  const claimOffer = async () => {
    setIsClaiming(true);
    setError('');

    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        setIsLoggedIn(false);
        return;
      }

      const response = await fetch('/.netlify/functions/course-offer', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const offer = await response.json().catch(() => ({})) as OfferResponse & { error?: string };

      if (!response.ok) {
        throw new Error(offer.error || 'We could not load your course offer.');
      }

      const currentItems = cartStore.getState().items;
      offer.products.forEach((product) => {
        const alreadyInCart = currentItems.some((item) => item.productId === product.id);
        if (!alreadyInCart) {
          cartStore.addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image
          }, 1);
        }
      });

      localStorage.setItem('blom_pending_course_offer', offer.coupon_code);
      navigate('/checkout');
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : 'We could not load your course offer.');
    } finally {
      setIsClaiming(false);
    }
  };

  const authRedirect = encodeURIComponent(OFFER_PATH);

  return (
    <div className="min-h-screen bg-[#f8f4fb]">
      <Header showMobileMenu />
      <main className="py-10 sm:py-16">
        <Container>
          <section className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_80px_rgba(83,55,114,0.14)]">
            <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
              <div className="relative min-h-[320px] bg-[#eee7f5]">
                <img
                  src={OFFER_IMAGE}
                  alt="Exclusive Trendy Ring course offer with White and Clear Petal Paste"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#efe5f7] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6d4a87]">
                  <Sparkles className="h-4 w-4" />
                  Course student exclusive
                </div>
                <h1 className="font-serif text-4xl leading-tight text-[#302439] sm:text-5xl">
                  Both Petal Pastes for R399
                </h1>
                <p className="mt-5 text-base leading-7 text-[#655b6c]">
                  Your Trendy Ring Nail Art Course purchase unlocks one White and one Clear
                  Petal Paste for R399 together. The offer never expires and can be used once.
                </p>

                <div className="mt-7 space-y-3 text-sm text-[#4f4556]">
                  {[
                    'White 3D non-sticky Petal Paste, 15g',
                    'Clear non-sticky Petal Paste, 15g',
                    'Automatically added and applied at checkout'
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 rounded-full bg-[#e9f4eb] p-1 text-[#3f7a4d]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {error}
                  </div>
                )}

                <div className="mt-8">
                  {isLoggedIn === false ? (
                    <div className="space-y-3">
                      <Button
                        fullWidth
                        size="lg"
                        onClick={() => navigate(`/login?redirect=${authRedirect}`)}
                      >
                        Log in to claim your offer
                      </Button>
                      <Button
                        fullWidth
                        size="lg"
                        variant="outline"
                        onClick={() => navigate(`/signup?redirect=${authRedirect}`)}
                      >
                        Create a Store account
                      </Button>
                      <p className="text-center text-xs leading-5 text-[#7d7183]">
                        Use the same email address used to buy the course.
                      </p>
                    </div>
                  ) : (
                    <Button
                      fullWidth
                      size="lg"
                      loading={isLoggedIn === null || isClaiming}
                      disabled={isLoggedIn === null}
                      onClick={() => void claimOffer()}
                    >
                      Add both gels and continue to checkout
                    </Button>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#817587]">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Linked securely to your course purchase email
                </div>
              </div>
            </div>
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
