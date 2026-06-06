import { Globe, MessageSquare, User } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-[#030303] border-t border-white/[0.05] py-12 px-4 md:px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col gap-2 text-center md:text-left">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">
                        Talent-Mind
                    </span>
                    <p className="text-white/40 text-sm font-light">
                        Intelligent Candidate Ranking Engine.
                    </p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-white/50">
                    <span>Developers:</span>
                    <div className="flex items-center gap-3">
                        {[
                            { name: "Joy", url: "https://github.com/Joy-S-07" },
                            { name: "Sneha", url: "https://github.com/SnehaBanik" },
                            { name: "Jiya", url: "https://github.com/jiyabhowmick-collab" }
                        ].map((dev) => (
                            <a 
                                key={dev.name}
                                href={dev.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="group relative flex items-center justify-center"
                                title={dev.name}
                            >
                                <img 
                                    src={`${dev.url}.png`} 
                                    alt={dev.name} 
                                    className="h-8 w-8 rounded-full border border-white/10 group-hover:border-indigo-400 group-hover:scale-110 transition-all duration-300"
                                />
                                <span className="absolute -top-8 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    {dev.name}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/[0.02] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30 font-light">
                <p>© {new Date().getFullYear()} TalentMindAI POC. All rights reserved.</p>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-white/60 transition-colors">Choose Skill</a>
                    <a href="#" className="hover:text-white/60 transition-colors">Choose Perfect</a>
                </div>
            </div>
        </footer>
    );
}
