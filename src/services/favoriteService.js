import API from './api.js';

const LOCAL_FAV_KEY = 'egreen_guest_favorites';

export const favoriteService = {
  // Backend API methods (for authenticated users)
  getMyFavorites: async () => {
    const response = await API.get('/favorites');
    return response.data;
  },
  addFavorite: async (itemType, itemId) => {
    const response = await API.post('/favorites', { itemType, itemId });
    return response.data;
  },
  removeFavorite: async (id) => {
    const response = await API.delete(`/favorites/${id}`);
    return response.data;
  },

  // Local Storage methods (for guest users / offline fallback)
  getLocalFavorites: () => {
    try {
      const data = localStorage.getItem(LOCAL_FAV_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveLocalFavorite: (itemType, item) => {
    try {
      const favs = favoriteService.getLocalFavorites();
      const exists = favs.some((f) => f.itemId === item._id || f._id === item._id);
      if (!exists) {
        favs.push({
          _id: `guest_${item._id}`,
          itemType,
          itemId: item._id,
          product: itemType === 'product' ? item : undefined,
          farmer: itemType === 'farmer' ? item : undefined,
          market: itemType === 'market' ? item : undefined,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem(LOCAL_FAV_KEY, JSON.stringify(favs));
      }
      return favs;
    } catch {
      return [];
    }
  },
  removeLocalFavorite: (itemId) => {
    try {
      const favs = favoriteService.getLocalFavorites();
      const updated = favs.filter((f) => f._id !== itemId && f.itemId !== itemId && f.product?._id !== itemId);
      localStorage.setItem(LOCAL_FAV_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },
};

export default favoriteService;

