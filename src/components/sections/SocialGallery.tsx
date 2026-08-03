import React from 'react';
import { ArrowUpRight, Facebook, Instagram } from 'lucide-react';
import fleurCollectionHero from '../../assets/homepage/fleur-collection-hero.webp';
import gelPolishLineup from '../../assets/homepage/gel-polish-lineup.webp';
import peonyBlushGelPolish from '../../assets/homepage/peony-blush-gel-polish.webp';
import pinkHydrangeaGelPolish from '../../assets/homepage/pink-hydrangea-gel-polish.webp';
import rosePourGelPolish from '../../assets/homepage/rose-pour-gel-polish.webp';

const INSTAGRAM_URL = 'https://www.instagram.com/cosmetics_blom/';
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61581058185006';

const posts = [
  {
    image: fleurCollectionHero,
    alt: 'The BLOM Fleur de Berry gel polish collection styled with flowers',
    platform: 'Instagram',
    href: INSTAGRAM_URL,
  },
  {
    image: peonyBlushGelPolish,
    alt: 'BLOM Peony Blush gel polish',
    platform: 'Facebook',
    href: FACEBOOK_URL,
  },
  {
    image: pinkHydrangeaGelPolish,
    alt: 'BLOM pink gel polish with hydrangea flowers',
    platform: 'Instagram',
    href: INSTAGRAM_URL,
  },
  {
    image: gelPolishLineup,
    alt: 'A line-up of BLOM professional gel polish colours',
    platform: 'Facebook',
    href: FACEBOOK_URL,
  },
  {
    image: rosePourGelPolish,
    alt: 'BLOM gel polish styled with a sculptural rose',
    platform: 'Facebook',
    href: FACEBOOK_URL,
  },
  {
    image: fleurCollectionHero,
    alt: 'Close-up of the BLOM Fleur de Berry collection',
    platform: 'Facebook',
    href: FACEBOOK_URL,
    position: '70% center',
  },
];

export const SocialGallery: React.FC = () => (
  <section className="home-social" aria-labelledby="social-heading">
    <div className="home-shell">
      <header className="home-social__heading">
        <div>
          <p className="home-eyebrow">From our community</p>
          <h2 id="social-heading">Follow what&apos;s blooming.</h2>
        </div>
        <p>
          New colours, fresh sets, class moments and behind-the-scenes updates from BLOM.
        </p>
      </header>

      <div className="home-social__grid">
        {posts.map((post, index) => {
          const PlatformIcon = post.platform === 'Instagram' ? Instagram : Facebook;

          return (
            <a
              className="home-social__post"
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View BLOM Cosmetics on ${post.platform}`}
              key={`${post.platform}-${index}`}
            >
              <img
                src={post.image}
                alt={post.alt}
                loading="lazy"
                style={post.position ? { objectPosition: post.position } : undefined}
              />
              <span className="home-social__platform">
                <PlatformIcon aria-hidden="true" />
                {post.platform}
              </span>
              <span className="home-social__open" aria-hidden="true">
                <ArrowUpRight />
              </span>
            </a>
          );
        })}
      </div>

      <div className="home-social__actions">
        <a className="home-button home-button--primary" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
          <Instagram aria-hidden="true" />
          Follow on Instagram
        </a>
        <a className="home-button home-button--secondary" href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
          <Facebook aria-hidden="true" />
          Find us on Facebook
        </a>
      </div>
    </div>
  </section>
);
