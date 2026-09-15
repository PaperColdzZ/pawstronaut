import { getCollection, type CollectionEntry } from "astro:content";

/** How many posts a single archive page shows. Keeps list pages from growing without bound. */
export const POSTS_PER_PAGE = 12;

export type PostEntry = CollectionEntry<"blog">;

export type Topic = {
	id: string;
	name: string;
	description: string;
	/** Number of published posts in this topic. */
	count: number;
};

/** Newest first, with a stable tiebreak so equal dates keep a predictable order. */
export const sortByDate = (posts: PostEntry[]): PostEntry[] =>
	[...posts].sort(
		(a, b) =>
			b.data.publishDate.getTime() - a.data.publishDate.getTime() || a.id.localeCompare(b.id),
	);

export const getSortedPosts = async (): Promise<PostEntry[]> =>
	sortByDate(await getCollection("blog"));

export const getPostsByTopic = async (topicId: string): Promise<PostEntry[]> =>
	(await getSortedPosts()).filter((post) => post.data.category === topicId);

/** Topics ordered by how much content they hold, so the fullest ones come first. */
export const getTopics = async (): Promise<Topic[]> => {
	const [topics, posts] = await Promise.all([getCollection("topics"), getSortedPosts()]);

	return topics
		.map((topic) => ({
			id: topic.id,
			name: topic.data.name,
			description: topic.data.description,
			count: posts.filter((post) => post.data.category === topic.id).length,
		}))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

/**
 * Topics that actually hold at least one post.
 * Empty archives are not published: they are dead ends for readers, and a
 * noindex page listed in the sitemap sends search engines mixed signals.
 */
export const getPublishedTopics = async (): Promise<Topic[]> =>
	(await getTopics()).filter((topic) => topic.count > 0);

export const totalPagesFor = (items: unknown[]): number =>
	Math.max(1, Math.ceil(items.length / POSTS_PER_PAGE));

export const paginate = <T,>(items: T[], page: number): T[] =>
	items.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

/** Page 1 lives at `/blog/`, later pages at `/blog/page/2/`. */
export const archivePath = (basePath: string, page: number): string =>
	page <= 1 ? `${basePath}/` : `${basePath}/page/${page}/`;

export const formatDate = (date: Date): string =>
	date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
