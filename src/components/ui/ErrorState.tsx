import { Button } from "@/components/ui/Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
  /** `h1` when the error replaces the whole page, `h2` when it sits inside one. */
  headingAs?: "h1" | "h2";
}

// The one shared "this network call failed" block (CartPage, WishlistPage, order history, the
// product grid) — a failed fetch must never look like a real empty state (no orders/wishlist
// items/cart contents), since those tell the user two very different things.
export function ErrorState({
  title = "Something went wrong",
  message = "Couldn't load this right now. Please try again.",
  onRetry,
  isRetrying = false,
  headingAs: Heading = "h2",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center"
    >
      <Heading className="text-heading-lg text-foreground">{title}</Heading>
      <p className="text-muted-foreground max-w-sm text-sm">{message}</p>
      <Button onClick={onRetry} isLoading={isRetrying}>
        Try again
      </Button>
    </div>
  );
}
