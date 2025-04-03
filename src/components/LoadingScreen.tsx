export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}
