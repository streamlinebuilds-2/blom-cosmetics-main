import React from 'react';
import { ArrowUpRight, Facebook, Instagram } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/cosmetics_blom/';
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61581058185006';
const CLOUDINARY_BASE = 'https://res.cloudinary.com/drsrbzm2t/image/upload';

const socialImage = (version: string, publicId: string, width: number) =>
  `${CLOUDINARY_BASE}/f_auto,q_auto,w_${width},h_${width},c_fill,g_auto/${version}/homepage/social/${publicId}`;

const posts = [
  {
    href: 'https://www.instagram.com/p/DbbaL53twx-/',
    image: { version: 'v1785752009', publicId: 'nail-art-statement' },
    alt: 'Statement nude and white stiletto nail set with crystals and sculpted flowers',
    platform: 'Instagram',
  },
  {
    href: 'https://www.instagram.com/p/DbP81PrtFU_/',
    image: { version: 'v1785752015', publicId: 'pink-hydrangea-gel' },
    alt: 'BLOM pink gel polish styled with vivid hydrangea flowers',
    platform: 'Instagram',
  },
  {
    href: 'https://www.facebook.com/photo.php?fbid=122143096635035272&set=pb.61581058185006.-2207520000&type=3',
    image: { version: 'v1785752017', publicId: 'navy-silver-nail-set' },
    alt: 'Navy, nude and silver BLOM acrylic nail set',
    platform: 'Facebook',
  },
  {
    href: 'https://www.instagram.com/p/DbTrsJSNr3y/',
    image: { version: 'v1785752012', publicId: 'gel-colour-swatches' },
    alt: 'Hand holding a fan of BLOM pink, nude, berry and glitter gel colour swatches',
    platform: 'Instagram',
  },
  {
    href: 'https://www.facebook.com/photo.php?fbid=122139722607035272&set=pb.61581058185006.-2207520000&type=3',
    image: { version: 'v1785752019', publicId: 'berry-pink-nail-set' },
    alt: 'Berry, pink and peach BLOM nail set with glitter accents',
    platform: 'Facebook',
  },
  {
    href: 'https://www.facebook.com/photo.php?fbid=122141126853035272&set=pb.61581058185006.-2207520000&type=3',
    image: { version: 'v1785752021', publicId: 'prep-primer-results' },
    alt: 'BLOM Prep and Primer product result feature',
    platform: 'Facebook',
  },
];

export const SocialGallery: React.FC = () => (
  <section id="social-wall" className="home-social" aria-labelledby="social-heading">
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
        {posts.map((post) => {
          const PlatformIcon = post.platform === 'Instagram' ? Instagram : Facebook;

          const src = socialImage(post.image.version, post.image.publicId, 800);

          return (
            <a
              className="home-social__post"
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open this BLOM ${post.platform} post`}
              key={post.href}
            >
              <img
                src={src}
                srcSet={[
                  `${socialImage(post.image.version, post.image.publicId, 360)} 360w`,
                  `${socialImage(post.image.version, post.image.publicId, 600)} 600w`,
                  `${src} 800w`,
                ].join(', ')}
                sizes="(max-width: 700px) 48vw, 33vw"
                alt={post.alt}
                loading="lazy"
                width="800"
                height="800"
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
