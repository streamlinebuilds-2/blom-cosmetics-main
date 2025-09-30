import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Cookie, Mail, Phone, MapPin } from 'lucide-react';

export const CookiePolicyPage: React.FC = () => {
  React.useEffect(() => {
    document.title = 'Cookie Policy – BLOM Cosmetics';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about how BLOM Cosmetics uses cookies and similar tracking technologies on our website. Understand your choices and how we protect your privacy.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header showMobileMenu={true} />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 to-blue-50 section-padding">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <Cookie className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
              <p className="text-lg text-gray-600 mb-4">
                This policy explains what cookies are, how we use them, and your choices regarding their use.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Last Updated:</strong> September 30, 2025
              </p>
            </div>
          </Container>
        </section>

        {/* Cookie Policy Content */}
        <section className="section-padding">
          <Container>
            <div className="max-w-4xl mx-auto prose prose-lg">
              
              {/* What are Cookies? */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">What are Cookies?</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                    They are widely used to make websites work more efficiently, as well as to provide information to the 
                    owners of the site. Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your 
                    personal computer or mobile device when you go offline, while session cookies are deleted as soon as 
                    you close your web browser.
                  </p>
                </div>
              </section>

              {/* How We Use Cookies */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">How We Use Cookies</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    We use cookies for the following purposes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To enable certain functions of the Service</li>
                    <li>To provide analytics</li>
                    <li>To store your preferences</li>
                    <li>To enable advertisements delivery, including behavioral advertising</li>
                  </ul>
                </div>
              </section>

              {/* Types of Cookies We Use */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Types of Cookies We Use</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Essential Cookies:</h3>
                  <p>
                    These cookies are essential to provide you with services available through our website and to enable 
                    you to use some of its features. Without these cookies, the services that you have asked for cannot 
                    be provided, and we only use these cookies to provide you with those services.
                  </p>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Analytics Cookies:</h3>
                  <p>
                    These cookies allow us to collect information about how visitors use our website. This information 
                    does not identify any individual visitor. We use this information to compile reports and to help us 
                    improve the website.
                  </p>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Marketing Cookies:</h3>
                  <p>
                    These cookies are used to track advertising effectiveness and to deliver more relevant advertising 
                    to you. They are usually placed by advertising networks with the website operator's permission.
                  </p>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Preference Cookies:</h3>
                  <p>
                    These cookies allow our website to remember choices you make when you use the website, such as 
                    remembering your language preferences or login details. The purpose of these cookies is to provide 
                    you with a more personal experience and to avoid you having to re-enter your preferences every time 
                    you visit our website.
                  </p>
                </div>
              </section>

              {/* Third-Party Cookies */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Third-Party Cookies</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    In addition to our own cookies, we may also use various third-parties cookies to report usage 
                    statistics of the Service, deliver advertisements on and through the Service, and so on.
                  </p>
                </div>
              </section>

              {/* Your Choices Regarding Cookies */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Your Choices Regarding Cookies</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, 
                    please visit the help pages of your web browser.
                  </p>
                  <p>
                    Please note, however, that if you delete cookies or refuse to accept them, you might not 
                    be able to use all of the features we offer, you may not be able to store your preferences, 
                    and some of our pages might not display properly.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>For the Chrome web browser, please visit this page from Google: <a href="https://support.google.com/accounts/answer/32050" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">https://support.google.com/accounts/answer/32050</a></li>
                    <li>For the Internet Explorer web browser, please visit this page from Microsoft: <a href="http://support.microsoft.com/kb/278835" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">http://support.microsoft.com/kb/278835</a></li>
                    <li>For the Firefox web browser, please visit this page from Mozilla: <a href="https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored</a></li>
                    <li>For the Safari web browser, please visit this page from Apple: <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac</a></li>
                  </ul>
                </div>
              </section>

              {/* Changes to Our Cookie Policy */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Changes to Our Cookie Policy</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    We may update our Cookie Policy from time to time. We will notify you of any changes by 
                    posting the new Cookie Policy on this page.
                  </p>
                  <p>
                    We will let you know via email and/or a prominent notice on our Service, prior to the 
                    change becoming effective and update the "Last updated" date at the top of this Cookie Policy.
                  </p>
                  <p>
                    You are advised to review this Cookie Policy periodically for any changes. Changes to this 
                    Cookie Policy are effective when they are posted on this page.
                  </p>
                </div>
              </section>

              {/* Contact Us */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Contact Us</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    If you have any questions about this Cookie Policy, you can contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6 mt-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-pink-400" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-sm">shopblomcosmetics@gmail.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-pink-400" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <p className="text-sm">+27 79 548 3317</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-pink-400" />
                        <div>
                          <p className="font-medium text-gray-900">Address</p>
                          <p className="text-sm">South Africa</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};