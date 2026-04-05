import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { trackCVDownload } from '../lib/analytics';
import { supabase } from '../lib/supabase';

const roles = ['Full Stack Developer', 'AI Builder', 'Computer Engineer'];

const DEFAULT_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuA0xCm7uHmXLD-pCs-tyUUrAdeuDf3bYEbZ-R9L2C2iZBzZvGw_TrwwAI9r9VNQvYLiK5R3NhsJuqlPPduOLfKY2Ewpg8FMKLEfyo-C5eNJJdqLh6MJMzEko2b9tetyLEc0w4bMDBdJIRDnvIgVFlMzH8YgbgYvsNoJZRYSOu122okcprYNWBgQsCbXeld6kALlQ4aXzdky8ryjs6IjkbJFDg71Jef6oMBpk_LDxHCbR3mWt-gXRCS4TW612t4e6a7w29FcpLqRkV0";

export default function Hero() {
    const [roleIndex, setRoleIndex] = useState(0);
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    const tick = useCallback(() => {
        const currentRole = roles[roleIndex];
        if (!isDeleting) {
            setText(currentRole.substring(0, text.length + 1));
            if (text === currentRole) {
                setTimeout(() => setIsDeleting(true), 2000);
                return;
            }
        } else {
            setText(currentRole.substring(0, text.length - 1));
            if (text === '') {
                setIsDeleting(false);
                setRoleIndex((prev) => (prev + 1) % roles.length);
                return;
            }
        }
    }, [text, isDeleting, roleIndex]);

    useEffect(() => {
        const speed = isDeleting ? 50 : 100;
        const timer = setTimeout(tick, speed);
        return () => clearTimeout(timer);
    }, [tick, isDeleting]);

    useEffect(() => {
        const fetchImage = async () => {
            const { data } = await supabase
                .from('contacts')
                .select('message')
                .eq('email', 'system@portfolio.local')
                .eq('name', 'SITE_PROFILE_IMAGE')
                .single();
            if (data && data.message) {
                setProfileImage(data.message);
            } else {
                setProfileImage(DEFAULT_IMAGE);
            }
        };
        fetchImage();
    }, []);

    const handleDownloadCV = () => {
        trackCVDownload();
        window.open('/Abdullah_Shaikh_Resume.pdf', '_blank');
    };

    return (
        <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
            {/* Animated blobs */}
            <div className="blob blob-blue w-[500px] h-[500px] -top-20 -left-20" />
            <div className="blob blob-purple w-[400px] h-[400px] top-40 right-0" />
            <div className="blob blob-blue w-[300px] h-[300px] bottom-0 left-1/3" />

            <div className="section-container relative z-10 w-full px-6 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 min-h-screen pt-24 lg:pt-0">
                {/* Text Content */}
                <div className="w-full lg:w-1/2 flex-none">
                    {/* Greeting */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-text-light text-lg mb-4 font-medium"
                    >
                        👋 Hello, I'm
                    </motion.p>

                    {/* Name */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6"
                    >
                        Abdullah{' '}
                        <span className="gradient-text">Shaikh</span>
                    </motion.h1>

                    {/* Typing role */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-2xl sm:text-3xl font-semibold text-text mb-6 h-[44px]"
                    >
                        <span className="text-primary">{text}</span>
                        <span className="typing-cursor" />
                    </motion.div>

                    {/* Bio */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-text-light text-lg leading-relaxed max-w-2xl mb-10"
                    >
                        Computer Engineering student from Mumbai, building intelligent solutions
                        at the intersection of <span className="text-primary font-semibold">AI</span> and{' '}
                        <span className="text-secondary font-semibold">Full Stack Development</span>.
                        Passionate about creating technology that makes a real impact.
                    </motion.p>

                    {/* CTA Buttons — FIX: added items-center */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-wrap gap-4 mb-10 items-center"
                    >
                        <a href="#projects" className="btn-primary"
                            onClick={(e) => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }); }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            View Projects
                        </a>
                        <button onClick={handleDownloadCV} className="btn-secondary">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download CV
                        </button>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-wrap gap-3 sm:gap-4"
                    >
                        <a href="https://linkedin.com/in/abdullah-shaikh225" target="_blank" rel="noopener noreferrer"
                            className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-border hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                            <svg className="w-5 h-5 text-text-light group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                        <a href="https://github.com/abdullah-shaikh225" target="_blank" rel="noopener noreferrer"
                            className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-border hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                            <svg className="w-5 h-5 text-text-light group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                        <a href="mailto:abdullahctmail@gmail.com"
                            className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-border hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                            <svg className="w-5 h-5 text-text-light group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </a>
                    </motion.div>
                </div>

                {/* Profile Photo Elements */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 30 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="w-full max-w-[450px] lg:w-1/2 relative mt-0 lg:mt-0 pb-16 lg:pb-0"
                >
                    <div className="relative aspect-square w-full mx-auto">
                        {/* Decorative glow behind image */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-[2.5rem] blur-2xl transform rotate-3 scale-95"></div>

                        {/* High-quality bordered glass container */}
                        <div className="relative w-full h-full rounded-[2.5rem] border border-white/40 shadow-2xl overflow-hidden glass-card p-3 transform transition-transform hover:-rotate-1 hover:scale-[1.02] duration-500">
                            <img
                                src={profileImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"}
                                alt="Abdullah Shaikh"
                                className={`w-full h-full object-cover rounded-[1.8rem] contrast-[1.05] transition-opacity duration-300 ${profileImage ? 'opacity-100' : 'opacity-0'}`}
                            />

                            {/* Small floating tech badge overlapping */}
                            <div className="absolute bottom-6 -left-4 md:-left-6 hidden sm:flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-white p-3 pr-5 rounded-2xl shadow-xl">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 13l-10-5v5l10 5 10-5v-5l-10 5z" /></svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-text-light uppercase tracking-wider">Focus</p>
                                    <p className="text-sm font-bold text-primary">AI & Full Stack</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-6 h-10 rounded-full border-2 border-text-light/30 flex justify-center pt-2"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </motion.div>
            </motion.div>
        </section >
    );
}