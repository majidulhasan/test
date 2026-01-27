export const searchTransactions = (items: any[], query: string) => {
  if (!query) return items;
  const lowerQuery = query.toLowerCase();
  return items.filter(item => 
    (item.category && item.category.toLowerCase().includes(lowerQuery)) ||
    (item.person && item.person.toLowerCase().includes(lowerQuery)) ||
    (item.note && item.note.toLowerCase().includes(lowerQuery)) ||
    (item.reason && item.reason.toLowerCase().includes(lowerQuery))
  );
};
