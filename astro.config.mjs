// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import alpinejs from "@astrojs/alpinejs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	site: "https://meepal.pet",
	base: "/",
	integrations: [
		(await import("@playform/inline")).default(),
		alpinejs(),
		mdx(),
		sitemap(),
	],
	output: "static",
	devToolbar: {
		enabled: false,
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
