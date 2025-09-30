import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Award, 
  Heart, 
  Users, 
  Target, 
  Star, 
  CheckCircle,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  BookOpen,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  // Scroll to hash targets (e.g., #team, #story) and align section to top below sticky header
  useEffect(() => {
    const { hash } = window.location;
    if (!hash) return;
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 80; // accommodates sticky header
      const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      role: 'Founder & Lead Instructor',
      bio: 'With over 15 years in the nail industry, Sarah founded BLOM to share her passion for professional nail artistry and empower others to achieve excellence.',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      credentials: ['Master Nail Technician', 'International Nail Art Champion', 'Certified Educator'],
      specialties: ['Watercolor Techniques', 'Advanced Acrylics', 'Business Development']
    },
    {
      id: 2,
      name: 'Michelle Adams',
      role: 'Senior Instructor & Product Developer',
      bio: 'Michelle brings technical expertise and innovation to BLOM, developing our premium product lines and advanced training curricula.',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      credentials: ['Chemical Engineering Background', 'Product Development Specialist', 'BLOM Certified Trainer'],
      specialties: ['Product Formulation', 'Technical Training', 'Quality Assurance']
    },
    {
      id: 3,
      name: 'Jessica Chen',
      role: 'Creative Director & Nail Artist',
      bio: 'Jessica leads our creative vision, developing trend-forward techniques and inspiring nail artists worldwide with innovative designs.',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      credentials: ['International Nail Art Judge', 'Creative Arts Degree', 'Social Media Influencer'],
      specialties: ['Trend Forecasting', 'Creative Design', 'Social Media Strategy']
    },
    {
      id: 4,
      name: 'Amanda Foster',
      role: 'Education Coordinator',
      bio: 'Amanda ensures our training programs meet the highest standards, coordinating with instructors and supporting student success.',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      credentials: ['Education Management', 'Student Success Specialist', 'Training Coordinator'],
      specialties: ['Curriculum Development', 'Student Support', 'Program Management']
    }
  ];

  const coreValues = [
    {
      icon: Heart,
      title: 'Passion for Excellence',
      description: 'We are driven by an unwavering commitment to quality and excellence in everything we do, from our products to our education.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in building a supportive community where nail professionals can learn, grow, and succeed together.'
    },
    {
      icon: Target,
      title: 'Innovation & Growth',
      description: 'We continuously innovate and evolve, staying ahead of industry trends to provide cutting-edge solutions.'
    },
    {
      icon: Shield,
      title: 'Trust & Integrity',
      description: 'We build lasting relationships through honest communication, reliable products, and consistent quality.'
    },
    {
      icon: Sparkles,
      title: 'Creativity & Artistry',
      description: 'We celebrate creativity and support artists in expressing their unique vision through beautiful nail art.'
    },
    {
      icon: TrendingUp,
      title: 'Professional Development',
      description: 'We are committed to helping nail professionals advance their careers and achieve their business goals.'
    }
  ];

  const whyChooseUs = [
    {
      icon: Award,
      title: 'Industry Recognition',
      description: 'Award-winning products and training programs recognized by professionals worldwide.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Serving nail professionals across multiple countries with localized support and shipping.'
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Education',
      description: 'From beginner basics to advanced masterclasses, we offer complete learning pathways.'
    },
    {
      icon: Zap,
      title: 'Cutting-Edge Innovation',
      description: 'Constantly developing new products and techniques to keep you ahead of trends.'
    }
  ];

  const certifications = [
    {
      name: 'ISO 9001:2015 Quality Management',
      description: 'International standard for quality management systems'
    },
    {
      name: 'Professional Beauty Association Member',
      description: 'Active member of leading beauty industry organizations'
    },
    {
      name: 'Certified Training Provider',
      description: 'Accredited by international beauty education bodies'
    },
    {
      name: 'Product Safety Compliance',
      description: 'All products meet international safety and quality standards'
    }
  ];

  const milestones = [
    { year: '2018', event: 'BLOM Cosmetics Founded', description: 'Started with a vision to elevate nail artistry' },
    { year: '2019', event: 'First Product Line Launch', description: 'Introduced premium acrylic system' },
    { year: '2020', event: 'Online Training Platform', description: 'Launched comprehensive online education' },
    { year: '2021', event: '1000+ Students Certified', description: 'Reached major training milestone' },
    { year: '2022', event: 'International Expansion', description: 'Extended reach to multiple countries' },
    { year: '2023', event: 'Product Innovation Awards', description: 'Recognition for outstanding product development' },
    { year: '2024', event: 'Community of 10,000+', description: 'Built thriving professional community' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        {/* About Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 to-blue-50 section-padding">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold mb-6">About BLOM Cosmetics</h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Empowering nail professionals worldwide with premium products, expert education, 
                and a supportive community. We believe every nail technician deserves access to 
                the finest tools and knowledge to create stunning artistry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/about#team" className="inline-block">
                  <Button size="lg" variant="outline">Meet Our Team</Button>
                </a>
              </div>
            </div>

            {/* Brand Stats removed as requested */}
          </Container>
        </section>

        {/* Story Section */}
        <section className="section-padding">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Our Story</h2>
                <div className="space-y-6 text-gray-600 leading-relaxed">
                  <p>
                    BLOM Cosmetics was born from a simple yet powerful vision: to create a world where 
                    every nail professional has access to premium products and world-class education. 
                    Founded in 2018 by master nail technician Sarah Mitchell, our journey began with 
                    a passion for excellence and a commitment to elevating the nail artistry industry.
                  </p>
                  <p>
                    What started as a small collection of carefully formulated acrylic products has 
                    grown into a comprehensive ecosystem of premium nail systems, innovative training 
                    programs, and a thriving global community of professionals who share our dedication 
                    to quality and creativity.
                  </p>
                  <p>
                    Today, BLOM stands for more than just beautiful products – we represent a movement 
                    of empowerment, education, and excellence. Our motto "Bloom, Blossom, Believe" 
                    reflects our commitment to helping every nail professional flourish in their craft 
                    and achieve their dreams.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop"
                  alt="BLOM Cosmetics story"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-lg max-w-xs">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Our Mission</div>
                      <div className="text-gray-600 text-sm">Empowering Excellence</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Timeline removed as requested */}
          </Container>
        </section>

        {/* Vision & Mission Section */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Vision & Mission</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our vision guides everything we do, from product development to education, 
                ensuring we always stay true to our core purpose.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <Card className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To be the world's leading provider of premium nail products and education, 
                  creating a global community where every nail professional can achieve 
                  excellence and build successful, fulfilling careers in the beauty industry.
                </p>
              </Card>

              <Card className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To empower nail professionals with premium products, comprehensive education, 
                  and ongoing support, enabling them to create beautiful artistry, build 
                  successful businesses, and inspire confidence in every client they serve.
                </p>
              </Card>
            </div>
          </Container>
        </section>

        {/* Values Section */}
        <section className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These fundamental principles guide our decisions, shape our culture, 
                and define how we serve our community of professionals.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreValues.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Why Choose Us Section */}
        <section className="section-padding bg-gradient-to-br from-pink-50 to-blue-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Why Choose BLOM?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover what sets us apart and makes BLOM the preferred choice 
                for nail professionals worldwide.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {whyChooseUs.map((reason, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <reason.icon className="h-6 w-6 text-pink-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">{reason.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{reason.description}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Meet Team Section */}
        <section id="team" className="section-padding">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our passionate team of experts brings together decades of experience, 
                creativity, and dedication to serve the nail professional community.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.id} className="text-center overflow-hidden group">
                  <div className="relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2">{member.name}</h3>
                    <p className="text-pink-400 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.bio}</p>
                    
                    <div className="space-y-2 mb-4">
                      <h4 className="font-semibold text-sm">Credentials:</h4>
                      {member.credentials.map((credential, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{credential}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Specialties:</h4>
                      <div className="flex flex-wrap gap-1">
                        {member.specialties.map((specialty, index) => (
                          <span key={index} className="px-2 py-1 bg-pink-100 text-pink-600 rounded text-xs">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Education Section */}
        <section className="section-padding bg-gray-50">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Education & Certifications</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Our commitment to excellence is backed by industry-leading certifications, 
                  continuous education, and adherence to the highest professional standards. 
                  We maintain rigorous quality controls and stay current with industry developments.
                </p>

                <div className="space-y-6">
                  {certifications.map((cert, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{cert.name}</h4>
                        <p className="text-gray-600">{cert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop"
                  alt="Education and certifications"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -top-6 -right-6 bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">ISO</div>
                    <div className="text-sm text-gray-600">Certified Quality</div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Closing CTA Section */}
        <section className="section-padding bg-gradient-to-r from-pink-400 to-blue-300 text-white">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Ready to Join the BLOM Family?</h2>
              <p className="text-xl text-pink-100 mb-8 leading-relaxed">
                Whether you're just starting your nail artistry journey or looking to take your 
                skills to the next level, we're here to support you every step of the way. 
                Join thousands of professionals who trust BLOM for their success.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a href="/shop" className="inline-block" onClick={(e) => {
                  e.preventDefault();
                  try {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    const overlay = document.createElement('div');
                    overlay.className = 'page-transition-overlay';
                    document.body.appendChild(overlay);
                    window.setTimeout(() => { window.location.assign('/shop'); }, 400);
                  } catch { window.location.assign('/shop'); }
                }}>
                  <Button size="lg" variant="secondary">Shop Products</Button>
                </a>
                <a href="/courses" className="inline-block" onClick={(e) => {
                  e.preventDefault();
                  try {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    const overlay = document.createElement('div');
                    overlay.className = 'page-transition-overlay';
                    document.body.appendChild(overlay);
                    window.setTimeout(() => { window.location.assign('/courses'); }, 400);
                  } catch { window.location.assign('/courses'); }
                }}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-pink-400">Explore Courses</Button>
                </a>
                <a href="/contact" className="inline-block" onClick={(e) => {
                  e.preventDefault();
                  try {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    const overlay = document.createElement('div');
                    overlay.className = 'page-transition-overlay';
                    document.body.appendChild(overlay);
                    window.setTimeout(() => { window.location.assign('/contact'); }, 400);
                  } catch { window.location.assign('/contact'); }
                }}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-pink-400">Contact Us</Button>
                </a>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <Mail className="h-8 w-8 text-pink-200 mb-3" />
                  <h4 className="font-semibold mb-2">Email Us</h4>
                  <p className="text-pink-100">shopblomcosmetics@gmail.com</p>
                </div>
                <div className="flex flex-col items-center">
                  <Phone className="h-8 w-8 text-pink-200 mb-3" />
                  <h4 className="font-semibold mb-2">Call Us</h4>
                  <p className="text-pink-100">+27 79 548 3317</p>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="h-8 w-8 text-pink-200 mb-3" />
                  <h4 className="font-semibold mb-2">Visit Us</h4>
                  <p className="text-pink-100">South Africa</p>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};