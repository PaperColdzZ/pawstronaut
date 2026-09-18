import { defineCollection } from "astro:content";
import { z } from 'astro/zod';
import { file, glob } from "astro/loaders";
import topicData from "./data/topics.json";

// Single source of truth for categories. Post frontmatter is validated against
// this list, so a typo in a post's `category` fails the build instead of
// silently creating a second category.
const topicIds = topicData.map((topic) => topic.id) as [string, ...string[]];

const cats = defineCollection({
	loader: file("src/data/cats.json"),
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			breed: z.string(),
			gender: z.enum(["male", "female"]),
			age: z.number().min(0),
			birthDate: z.coerce.date().optional(),
			description: z.string().optional(),
			image: image(),
			listDate: z.coerce.date(),
			childFriendly: z.boolean().default(false),
			dogFriendly: z.boolean().default(false),
			catFriendly: z.boolean().default(false),
			outsideCat: z.boolean().default(false),
			sterilized: z.boolean().default(false),
		}),
});

const members = defineCollection({
	loader: file("src/data/members.json"),
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			role: z.string(),
			image: image(),
			description: z.string(),
		}),
});

const topics = defineCollection({
	loader: file("src/data/topics.json"),
	schema: z.object({
		name: z.string(),
		description: z.string(),
	}),
});

const blog = defineCollection({
	loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/blog" }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			slug: z.string(),
			image: image(),
			imageAlt: z.string(),
			excerpt: z.string().optional(),
			publishDate: z.coerce.date().default(new Date(2014, 0, 1)),
			// --- added 2026-09-14, all optional: a post without these still builds ---
			updatedDate: z.coerce.date().optional(),
			category: z.enum(topicIds).optional(),
			tags: z.array(z.string()).default([]),
			author: z.string().optional(),
			// 文章页「Key Takeaway」那段加粗引导语；不填就退回用 excerpt，老文章照常构建
			takeaway: z.string().optional(),
		}),
});

export const collections = { cats, members, topics, blog };
