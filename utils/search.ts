
export const searchData = (items: any[], query: string, keys: string[]) => {
  if (!query) return items;
  const lowerQuery = query.toLowerCase();
  return items.filter(item => 
    keys.some(key => 
      String(item[key]).toLowerCase().includes(lowerQuery)
    )
  );
};
