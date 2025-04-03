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
      {children} <Footer />
    </div>
  );
}
