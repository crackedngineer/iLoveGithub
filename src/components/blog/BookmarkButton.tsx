import {Bookmark} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {useBookmarks} from "@/hooks/useBookmarks";
import {cn} from "@/lib/utils";

interface BookmarkButtonProps {
  slug: string;
  title: string;
  className?: string;
}

const BookmarkButton = ({slug, title, className}: BookmarkButtonProps) => {
  const {isBookmarked, toggleBookmark} = useBookmarks();
  const bookmarked = isBookmarked(slug);

  const handleClick = () => {
    const added = toggleBookmark(slug);
    toast(added ? "Bookmarked!" : "Removed from bookmarks", {
      description: added
        ? `"${title}" saved for later`
        : `"${title}" removed from your reading list`,
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} className={cn("gap-2", className)}>
      <Bookmark
        className={cn("h-4 w-4 transition-colors", bookmarked && "fill-primary text-primary")}
      />
      {bookmarked ? "Saved" : "Save"}
    </Button>
  );
};

export default BookmarkButton;
