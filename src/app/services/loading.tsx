export default function ServicesLoading() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-md mx-auto text-center mb-12 animate-pulse">
        <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
        <div className="h-10 w-72 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto mb-4" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-8 rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-dark animate-pulse"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 mb-6" />
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md mb-3" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-2" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md mb-6" />
            <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
