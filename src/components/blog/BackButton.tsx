"use client";
import {ArrowLeft} from "lucide-react";
import {useRouter} from "next/navigation";

interface BackButtonProps {
  className?: string;
}

const BackButton = ({className = ""}: BackButtonProps) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`flex items-center gap-1  text-gray-400 hover:text-white transition-colors ${className}`}
      aria-label="Go back to previous page"
    >
      <ArrowLeft size={18} />
      <span>Back</span>
    </button>
  );
};

export default BackButton;
