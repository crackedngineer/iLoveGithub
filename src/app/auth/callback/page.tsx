"use client";

import {useEffect} from "react";
import {supabase} from "@/lib/supabase";
import {useRouter} from "next/navigation";
import Loader from "@/components/Loader";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleSession = async () => {
      const {
        data: {session},
      } = await supabase.auth.getSession();
      if (session) {
        console.log("User logged in:", session.user);
      }
      router.push("/");
    };
    handleSession();
  }, [router]);

  return <Loader />;
}
