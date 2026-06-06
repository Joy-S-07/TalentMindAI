"use client";

import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ avatar?: string; name?: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
            // Fetch profile for avatar
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.user);
                }
            })
            .catch(console.error);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
        router.push("/login");
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#030303]/80 backdrop-blur-md border-b border-white/[0.05]">
            <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Image src="/logo.png" alt="TalentMind Logo" width={32} height={32} className="rounded-full" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
                        Talent-Mind
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-light text-white/60">
                    <Link href="/features" className="relative hover:text-white transition-colors group">
                        Features
                        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link href="/how-it-works" className="relative hover:text-white transition-colors group">
                        How it Works
                        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>

                    <Link href="/pricing" className="relative hover:text-white transition-colors group">
                        Pricing
                        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    {isLoggedIn && (
                        <>
                            <Link href="/dashboard" className="relative hover:text-white transition-colors group">
                                Talent Ranker
                                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                            <Link href="/profile" className="relative hover:text-white transition-colors group">
                                Profile
                                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        </>
                    )}
                </nav>

                <div className="flex items-center gap-4">
                    {!isLoggedIn ? (
                        <>
                            <Link href="/login" className="hidden sm:block">
                                <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/[0.05] transition-all duration-300 hover:scale-105">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/login?view=register">
                                <Button className="bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/profile" className="hidden sm:flex items-center justify-center h-9 w-9 rounded-full bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition-colors overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                ) : user?.name ? (
                                    <span className="text-xs font-medium text-white/70">
                                        {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                    </span>
                                ) : (
                                    <User className="h-4 w-4 text-white/70" />
                                )}
                            </Link>
                            <Button 
                                onClick={handleLogout}
                                variant="ghost" 
                                className="text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 px-3"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
