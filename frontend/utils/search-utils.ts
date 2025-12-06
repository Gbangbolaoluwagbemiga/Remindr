export function highlightSearchTerm(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}

export function getSearchMatchCount(text: string, query: string): number {
  if (!query) return 0;
  const regex = new RegExp(query, "gi");
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

