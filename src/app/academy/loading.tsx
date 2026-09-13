export default function AcademyLoading() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-md mx-auto text-center mb-12 animate-pulse">
        <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
        <div className="h-10 w-72 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto mb-4" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto" />
      </div>

      <div className="space-y-6 max-w-4xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-8 rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-dark animate-pulse"
          >
            <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded-md mb-4" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-md mb-6" />
            <div className="h-20 w-full bg-gray-100 dark:bg-gray-800 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
