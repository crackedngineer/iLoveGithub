import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-1 w-full overflow-x-hidden relative">
        {/* Subtle dot grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 text-gray-400/30 dark:text-gray-600/20 bg-dot-grid"
        />
        {children}
      </main>
      <Footer />
    </div>
  );
}
