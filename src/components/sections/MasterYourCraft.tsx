import React, { useEffect, useRef } from 'react';
import { Container } from '../layout/Container';
import { Button } from '../ui/Button';
import { Award, Computer, User } from 'lucide-react';

export const MasterYourCraft: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play?.().catch(() => {});
        } else {
          video.pause?.();
        }
      });
    }, { threshold: 0.5 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="master" aria-label="Master Your Craft">
      <Container>
        <div className="master__container">
          {/* Left copy */}
          <div className="master__copy">
            <h2 className="master__title">MASTER YOUR CRAFT</h2>
            <p className="master__lead">Professional training designed to give nail technicians the skills and confidence to succeed in their careers.</p>

            <div className="master__types">
              <article className="m-type" tabIndex={0} aria-label="In-Class Professional Courses">
                <div className="m-type__icon"><User className="h-5 w-5" /></div>
                <div className="m-type__body">
                  <h3>In-Class Professional Courses</h3>
                  <p>Hands-on training from prep to finishes — kits included, small groups, certificate.</p>
                </div>
              </article>

              <article className="m-type" tabIndex={0} aria-label="Creative Online Workshops">
                <div className="m-type__icon"><Computer className="h-5 w-5" /></div>
                <div className="m-type__body">
                  <h3>Creative Online Workshops</h3>
                  <p>Learn at your own pace with instructor feedback — flexible modules, certificate.</p>
                </div>
              </article>
            </div>

            <ul className="master__chips">
              <li className="chip">Beginner → Pro</li>
              <li className="chip">Hands‑on demos</li>
              <li className="chip">Downloadable guides</li>
              <li className="chip">Pro tips</li>
            </ul>

            {/* Stats removed as requested */}

            <div className="master__actions">
              <a className="btn btn-pink" href="/courses">EXPLORE ALL COURSES</a>
            </div>
          </div>

          {/* Right visual */}
          <div className="master__visual">
            <figure className="m-visual aspect-1-1">
              <video
                ref={videoRef}
                className="myc__image"
                muted
                playsInline
                preload="metadata"
                poster="/images/myc-poster.jpg"
              >
                <source src="/videos/myc-demo.mp4" type="video/mp4" />
              </video>

              <span className="m-badge m-badge--pink">Pro Tips</span>
              <span className="m-badge m-badge--blue">New</span>
            </figure>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default MasterYourCraft;


