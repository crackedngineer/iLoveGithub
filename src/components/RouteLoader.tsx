"use client";

import {useEffect, useState, useRef} from "react";
import {usePathname} from "next/navigation";
import Loader from "./Loader";
import {useRouter} from "next/navigation";

export default function RouteLoader() {
  const isFirst = useRef(true);
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname, router]);

  return loading ? <Loader /> : null;
}
