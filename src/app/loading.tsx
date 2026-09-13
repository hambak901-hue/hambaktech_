export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-24">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
      <p className="mt-4 text-sm font-medium text-body-color dark:text-body-color-dark animate-pulse">
        Loading HambakTech services...
      </p>
    </div>
  );
}
