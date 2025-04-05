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
      <main className="flex-1 w-full overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
}
