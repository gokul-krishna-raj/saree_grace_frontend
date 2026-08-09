import { Button } from "@/components/ui/Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

// The one shared "this network call failed" block (CartPage, WishlistPage, order history, the
// product grid) — a failed fetch must never look like a real empty state (no orders/wishlist
// items/cart contents), since those tell the user two very different things.
export function ErrorState({
  title = "Something went wrong",
  message = "Couldn't load this right now. Please try again.",
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center"
    >
      <h1 className="font-heading text-maroon-900 text-2xl">{title}</h1>
      <p className="text-maroon-600 text-sm">{message}</p>
      <Button onClick={onRetry} isLoading={isRetrying}>
        Try again
      </Button>
    </div>
  );
}
