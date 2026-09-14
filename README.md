# Meepal

Pet care content site built with [Astro](https://astro.build), Tailwind CSS v4, and Alpine.js.

Production domain: **https://meepal.pet**

## Getting started

```sh
npm install
npm run dev      # dev server
npm run build    # static output into ./dist
npm run preview  # preview the production build locally
```

## Project structure

```text
public/            static assets served as-is (favicons, robots.txt, fonts, og-image.jpg)
src/
  assets/          images and icons processed by Astro's image pipeline
  components/      UI building blocks
  content/blog/    blog posts (Markdown)
  data/            site config, navigation, and JSON-backed content
  layouts/         Layout.astro is the single site shell
  pages/           file-based routes
  styles/          global.css (Tailwind v4 theme + utilities)
  utils/           shared helpers
```

## Content

Editable content lives in two places:

- `src/data/config.ts` — brand name, domain, slogan, contact details, opening hours, social links
- `src/data/menus.js` — main navigation

Collection-backed content:

- `src/data/cats.json` — adoptable cats. The `id` field becomes the URL (`/cats/reckoning/`).
- `src/data/members.json` — team members shown on the About page.
- `src/content/blog/*.md` — blog posts. **The URL comes from the frontmatter `slug`, not the filename**, so `new-cat.md` with `slug: new-arrival-luna` is served at `/blog/new-arrival-luna/`.

## SEO

Every page passes `title` and `description` to `src/layouts/Layout.astro`, which renders the page title, meta description, canonical URL, and the Open Graph and Twitter tags. The social share image is `public/images/og-image.jpg`.

`@astrojs/sitemap` writes `sitemap-index.xml` at build time, and `public/robots.txt` points crawlers at it. `site` in `astro.config.mjs` must stay in sync with the production domain — it is the base for canonical URLs, Open Graph URLs, and the sitemap.

## Deployment

Output is fully static (`output: "static"`), so the contents of `dist/` can be served by any static host.

## Credits

Built on the [Pawstronaut](https://github.com/wpinfusion/pawstronaut) theme by WP Infusion, MIT licensed. See `LICENSE`.

## Notes for contributors

- Client-side scripts must listen for `astro:page-load`, not `DOMContentLoaded`, because view transitions swap the page without a reload.
- Adding a link or resource means updating the navigation in `src/data/menus.js` and, for new routes, nothing else — the sitemap picks up new routes automatically.

