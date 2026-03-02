export const transformImg = (url: string, t: string) => {
  if (!url) return url;
  
  // 1. Automatic Domain Migration (Fix Broken Links)
  // Replace old 'blom-cosmetics' cloud name with new 'dd89enrjz'
  let newUrl = url.replace('res.cloudinary.com/blom-cosmetics', 'res.cloudinary.com/dd89enrjz');

  // 2. Automatic Optimization (Fix Slow Loading)
  // Ensure we are using Cloudinary transformations if it's a Cloudinary URL
  if (newUrl.includes('res.cloudinary.com')) {
    // If URL already has /upload/, inject transformation if not present
    if (newUrl.includes("/upload/")) {
      // Check if transformation string 't' is already in the URL to avoid duplication
      // This is a simple check; for more robust handling we might need regex, 
      // but this covers the common case where we just want to add defaults.
      if (!newUrl.includes(t)) {
         return newUrl.replace("/upload/", `/upload/${t}/`);
      }
    }
  }

  return newUrl;
};

export const cardImg = (u: string) => transformImg(u, "f_auto,q_auto,w_400,h_400,c_fill,g_auto");
export const galleryImg = (u: string) => transformImg(u, "f_auto,q_auto,w_1200");
