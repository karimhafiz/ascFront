import { createWriteStream } from "fs";
import { SitemapStream } from "sitemap";

const sitemap = new SitemapStream({ hostname: "https://example.com" });

const links = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/about", changefreq: "monthly", priority: 0.8 },
  { url: "/contact", changefreq: "monthly", priority: 0.8 },
  { url: "/events", changefreq: "weekly", priority: 0.9 },
  { url: "/events/123", changefreq: "weekly", priority: 0.7 }, // Example event
];

const writeStream = createWriteStream("./public/sitemap.xml");
sitemap.pipe(writeStream);

links.forEach((link) => sitemap.write(link));
sitemap.end();
