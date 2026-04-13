/** DiceBear avatar utility */
export function agentAvatarUrl(username: string): string {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(username)}`;
}
