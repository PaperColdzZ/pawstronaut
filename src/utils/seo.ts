/**
 * Trim text down to a length that search engines will actually display.
 * Cuts on a word boundary so the snippet does not end mid-word.
 */
export const clampDescription = (text: string, max = 155): string => {
	const clean = text.replace(/\s+/g, " ").trim();

	if (clean.length <= max) {
		return clean;
	}

	const cut = clean.slice(0, max);
	const lastSpace = cut.lastIndexOf(" ");
	const trimmed = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;

	return `${trimmed.replace(/[,;:.\s]+$/, "")}\u2026`;
};
