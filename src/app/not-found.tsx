"use client";

import {useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Home, ArrowLeft} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          {/* 404 Number with gradient */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-github-blue to-github-green bg-clip-text text-transparent mb-4">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-github-gray dark:text-white mb-4">
              Oops! Page not found
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              The page you&apos;re looking for seems to have wandered off into the digital void.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-github-blue to-blue-600 hover:from-github-blue hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/">
                  <Home className="h-5 w-5 mr-2" />
                  Return to Home
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                className="border-github-blue text-github-blue hover:bg-github-blue hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
