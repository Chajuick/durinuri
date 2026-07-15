import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "두리누리 · 우리 데이트",
    short_name: "두리누리",
    description: "둘이 함께 계획하고 기억하는 데이트 기록",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f6",
    theme_color: "#f0806a",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
