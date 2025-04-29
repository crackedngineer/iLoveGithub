"use client";

import { useSession, signIn, signOut, getSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        // Check if session is unauthenticated and if there's no access token
        if (status === "unauthenticated" && session && 'accessToken' in session) {
            console.log("No valid token, logging out...");
            setIsLoggingOut(true); // Set logout state
            signOut({ callbackUrl: "/" }); // Redirect to home or login page after logout
        }
    }, [status, session]);

    // While session is loading, display a loading spinner or message
    if (status === "loading" || isLoggingOut) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-700 text-base font-medium">
                        Checking your session...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}