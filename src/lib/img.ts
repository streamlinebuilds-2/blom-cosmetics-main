export const transformImg = (url: string, t: string) => {
  if (!url) return url;
  // If later you switch to Cloudinary URLs with /upload/, this activates automatically.
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/${t}/`) : url;
};

export const cardImg = (u: string) => transformImg(u, "f_auto,q_auto,w_400,h_400,c_fill,g_auto");
export const galleryImg = (u: string) => transformImg(u, "f_auto,q_auto,w_1200");
