export const transformImg = (url: string, t: string) => {
  if (!url) return url;
  
  // Safe Optimization Only: Add transformation if it's a Cloudinary URL
  // We do NOT change the domain (cloud name) here to avoid breaking images.
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // Avoid double-transforming if 't' is already present
    if (!url.includes(t)) {
      return url.replace('/upload/', `/upload/${t}/`);
    }
  }
  
  return url;
};

export const cardImg = (u: string) => transformImg(u, "f_auto,q_auto,w_400,h_400,c_fill,g_auto");
export const galleryImg = (u: string) => transformImg(u, "f_auto,q_auto,w_1200");
