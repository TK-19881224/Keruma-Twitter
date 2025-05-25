export const getOrCreateAnonymousId = () => {
  let anonId = localStorage.getItem('anonymousId');
  if (!anonId) {
    anonId = `anon_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('anonymousId', anonId);
  }
  return anonId;
};