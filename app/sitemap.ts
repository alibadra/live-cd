export default function sitemap() {
  return [
    {
      url: "https://live.cd",
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 1,
    },
  ];
}