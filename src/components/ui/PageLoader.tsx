export function PageLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status">
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-bone-400">
        <span className="size-2 animate-pulse rounded-full bg-blaze-500" />
        Loading
      </div>
    </div>
  );
}
