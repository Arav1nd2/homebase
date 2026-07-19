import { Skeleton } from "@/components/ui/skeleton";

export type LoadingStateProps = {
  /** Announced to screen readers while content resolves; the visible skeleton stays static. */
  label?: string;
};

// animate-none overrides shadcn's default animate-pulse: DESIGN.md's Motion
// section forbids "ambient or looping motion" — a loading condition can run
// for an unbounded time, so a perpetually pulsing skeleton would violate
// that rule even though it's a common pattern elsewhere.
export function LoadingState({ label = "Loading" }: LoadingStateProps) {
  return (
    <div role="status" className="flex flex-col gap-3 px-6 py-8">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-5 w-2/3 animate-none" aria-hidden="true" />
      <Skeleton className="h-4 w-full animate-none" aria-hidden="true" />
      <Skeleton className="h-4 w-5/6 animate-none" aria-hidden="true" />
    </div>
  );
}
