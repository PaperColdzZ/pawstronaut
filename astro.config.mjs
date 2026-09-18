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
		// 注：此前模板集成的 @playform/inline 会把 CSS 改为 media="print" 异步加载，
		// 导致在公网冷缓存访问时出现首次排版错乱（FOUC）。移除后使用标准的同步阻塞样式表，彻底根治首访崩坏问题。
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
