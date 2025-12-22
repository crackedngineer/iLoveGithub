import {useState, useEffect, useCallback} from "react";

const STORAGE_KEY = "blog-bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch {
        setBookmarks([]);
      }
    }
  }, []);

  const saveBookmarks = useCallback((newBookmarks: string[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
  }, []);

  const addBookmark = useCallback(
    (slug: string) => {
      const newBookmarks = [...bookmarks, slug];
      saveBookmarks(newBookmarks);
    },
    [bookmarks, saveBookmarks],
  );

  const removeBookmark = useCallback(
    (slug: string) => {
      const newBookmarks = bookmarks.filter((b) => b !== slug);
      saveBookmarks(newBookmarks);
    },
    [bookmarks, saveBookmarks],
  );

  const toggleBookmark = useCallback(
    (slug: string) => {
      if (bookmarks.includes(slug)) {
        removeBookmark(slug);
        return false;
      } else {
        addBookmark(slug);
        return true;
      }
    },
    [bookmarks, addBookmark, removeBookmark],
  );

  const isBookmarked = useCallback(
    (slug: string) => {
      return bookmarks.includes(slug);
    },
    [bookmarks],
  );

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
  };
}
