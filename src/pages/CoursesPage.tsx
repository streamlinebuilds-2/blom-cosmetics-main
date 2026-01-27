import React, { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Clock, MapPin, DollarSign, Star, Activity, Users } from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { supabase } from '../lib/supabase';

const CoursesPage: React.FC = () => {
  type CourseRow = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    price: number | string | null;
    image_url: string | null;
    duration: string | null;
    level: string | null;
    course_type?: string | null;
    is_active: boolean;
    created_at: string | null;
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseRow[]>([]);

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: supabaseError } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (supabaseError) {
      console.error('Failed to load courses:', supabaseError.message);
      setError('Unable to load courses right now. Please try again.');
      setCourses([]);
      setIsLoading(false);
      return;
    }

    if (import.meta.env.DEV) {
      console.info('[Courses] Loaded courses', {
        count: (data ?? []).length,
        sampleSlugs: (data ?? []).slice(0, 5).map((c: any) => c?.slug).filter(Boolean),
        supabaseUrl: (supabase as any)?.supabaseUrl || undefined
      });
    }

    setCourses((data ?? []) as CourseRow[]);
    setIsLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await fetchCourses();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const courseCards = useMemo(() => {
    const truncate = (value: string, maxChars: number) => {
      if (value.length <= maxChars) return value;
      return `${value.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
    };

    const formatPrice = (value: CourseRow['price']) => {
      if (value === null || value === undefined || value === '') return '';
      const numeric = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(numeric)) return '';
      return `R${currencyFormatter.format(numeric)}`;
    };

    return courses.map((course) => {
      const description = (course.description ?? '').trim();
      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: description ? truncate(description, 160) : '',
        image: course.image_url || '/assets/blom_logo.webp',
        duration: course.duration || '',
        level: course.level || '',
        priceLabel: formatPrice(course.price),
        courseType: (course as any).course_type ?? null
      };
    });
  }, [courses, currencyFormatter]);

  const inPersonCards = useMemo(() => {
    const isOnline = (slug: string, duration: string, courseType: string | null) => {
      const normalizedType = (courseType || '').toLowerCase();
      if (normalizedType === 'online') return true;
      if (normalizedType === 'in-person') return false;
      const normalizedDuration = duration.toLowerCase();
      return slug.toLowerCase().startsWith('online-') || normalizedDuration.includes('self-paced');
    };

    return courseCards.filter((c) => !isOnline(c.slug, c.duration, (c as any).courseType ?? null));
  }, [courseCards]);

  const onlineCards = useMemo(() => {
    const isOnline = (slug: string, duration: string, courseType: string | null) => {
      const normalizedType = (courseType || '').toLowerCase();
      if (normalizedType === 'online') return true;
      if (normalizedType === 'in-person') return false;
      const normalizedDuration = duration.toLowerCase();
      return slug.toLowerCase().startsWith('online-') || normalizedDuration.includes('self-paced');
    };

    return courseCards.filter((c) => isOnline(c.slug, c.duration, (c as any).courseType ?? null));
  }, [courseCards]);

  // Intersection Observer for mobile shimmer effect
  useEffect(() => {
    if (courseCards.length === 0) return;

    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const shimmerElement = entry.target.querySelector('.shimmer');
          if (shimmerElement && !shimmerElement.classList.contains('shimmer-on-scroll')) {
            // Make container visible first
            const shimmerContainer = entry.target.querySelector('.absolute.inset-0');
            if (shimmerContainer) {
              shimmerContainer.style.opacity = '1';
              shimmerContainer.style.pointerEvents = 'none';
            }
            
            shimmerElement.classList.add('shimmer-on-scroll');
            // Remove class after animation to allow re-triggering
            setTimeout(() => {
              shimmerElement.classList.remove('shimmer-on-scroll');
              if (shimmerContainer) {
                shimmerContainer.style.opacity = '0';
              }
            }, 3000);
          }
        } else {
          // When element goes out of view, reset for re-triggering
          const shimmerElement = entry.target.querySelector('.shimmer');
          if (shimmerElement) {
            shimmerElement.classList.remove('shimmer-on-scroll');
            const shimmerContainer = entry.target.querySelector('.absolute.inset-0');
            if (shimmerContainer) {
              shimmerContainer.style.opacity = '0';
            }
          }
        }
      });
    }, observerOptions);

    // Observe all course cards
    const cardElements = document.querySelectorAll('.course-card');
    cardElements.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [courseCards.length]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header showMobileMenu={true} />

      <main className="flex-1">
        <Container>
          <div id="in-person-training" className="py-16">
            <div className="text-center mb-12">
              <h2 className="heading-with-stripe">In-Person Training</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" text="Loading courses..." />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-neutral-700 mb-4">{error}</p>
                <Button onClick={fetchCourses} variant="primary">
                  Retry
                </Button>
              </div>
            ) : inPersonCards.length === 0 ? (
              <div className="flex justify-center py-16">
                <div className="text-center">
                  <p className="text-neutral-700">No courses available at the moment.</p>
                  {import.meta.env.DEV && (
                    <p className="text-neutral-500 text-sm mt-2">
                      If you expected courses here, seed the courses table or check RLS/is_active.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                  {inPersonCards.map((course) => (
                    <Card key={course.id} className="course-card group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="shimmer"></div>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{course.title}</h3>
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{course.description}</p>

                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-gray-700 text-sm">
                            <Clock className="h-4 w-4 text-pink-500" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700 text-sm">
                            <MapPin className="h-4 w-4 text-pink-500" />
                            <span>{course.level}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700 text-sm">
                            <DollarSign className="h-4 w-4 text-pink-500" />
                            <span className="font-semibold">{course.priceLabel}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => (window.location.href = `/courses/${course.slug}`)}
                          className="w-full bg-pink-400 hover:bg-pink-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                          SEE MORE DETAILS
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div id="online-workshops" className="py-16">
            <div className="text-center mb-12">
              <h2 className="heading-with-stripe">Online Workshops</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" text="Loading courses..." />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-neutral-700 mb-4">{error}</p>
                <Button onClick={fetchCourses} variant="primary">
                  Retry
                </Button>
              </div>
            ) : onlineCards.length === 0 ? (
              <div className="flex justify-center py-16">
                <div className="text-center">
                  <p className="text-neutral-700">No courses available at the moment.</p>
                  {import.meta.env.DEV && (
                    <p className="text-neutral-500 text-sm mt-2">
                      If you expected courses here, seed the courses table or check RLS/is_active.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {onlineCards.map((course) => (
                  <Card key={course.id} className="course-card group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="shimmer"></div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{course.title}</h3>
                      <p className="text-gray-600 mb-6 text-sm leading-relaxed">{course.description}</p>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-gray-700 text-sm">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 text-sm">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span>{course.level}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 text-sm">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-lg text-pink-500">{course.priceLabel}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => (window.location.href = `/courses/${course.slug}`)}
                        className="w-full bg-pink-400 hover:bg-pink-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                      >
                        SEE MORE DETAILS
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Container>

        {/* Why Train with BLOM (card style) */}
        <section className="why-bloom py-16" aria-label="Why Train with BLOM">
          <Container>
            <div className="text-center mb-12">
              <h2 className="heading-with-stripe">Why Train with BLOM</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="why-card">
                <div className="why-icon">
                  <Star width="32" height="32" strokeWidth="2" />
                </div>
                <h3 className="why-heading">Expert-Led Training</h3>
                <p className="why-copy">Learn from industry professionals with years of experience in nail artistry and salon management.</p>
              </div>

              <div className="why-card">
                <div className="why-icon">
                  <Activity width="32" height="32" strokeWidth="2" />
                </div>
                <h3 className="why-heading">Proven Techniques</h3>
                <p className="why-copy">Master salon-grade methods that deliver consistent, professional results every time.</p>
              </div>

              <div className="why-card">
                <div className="why-icon">
                  <Users width="32" height="32" strokeWidth="2" />
                </div>
                <h3 className="why-heading">Community Support</h3>
                <p className="why-copy">Join a network of passionate nail artists and get ongoing support throughout your journey.</p>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;
