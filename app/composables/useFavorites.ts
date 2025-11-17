import { ref } from 'vue';

export const useFavorites = () => {
  const favoriteIds = useCookie<number[]>('my-favorites', {
    default: () => []
  });
  const favorites = ref(favoriteIds.value);
  const toggleFavorite = (id: number) => {
    const index = favorites.value.indexOf(id);
    if (index === -1) {
      favorites.value.push(id);
    } else {
      favorites.value.splice(index, 1);
    }
    favoriteIds.value = favorites.value;
  };
  const isFavorite = (id: number): boolean => {
    return favorites.value.includes(id);
  };
  return { favorites, toggleFavorite, isFavorite };
};