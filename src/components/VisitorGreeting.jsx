import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function VisitorGreeting() {
    const [isVisible, setIsVisible] = useState(false);
    const [name, setName] = useState('');
    const [status, setStatus] = useState('idle'); // idle | submitting | success

    useEffect(() => {
        // Check if they've already seen or dismissed the greeting
        const hasSeenGreeting = localStorage.getItem('hasSeenVisitorGreeting');

        if (!hasSeenGreeting) {
            // Delay the appearance so it's not aggressively immediate
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismissGreeting = () => {
        setIsVisible(false);
        localStorage.setItem('hasSeenVisitorGreeting', 'true');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            dismissGreeting();
            return;
        }

        setStatus('submitting');

        if (isSupabaseConfigured()) {
            // We save it to the contacts table with a special email flag to avoid schema changes
            await supabase.from('contacts').insert({
                name: name.trim(),
                email: 'visitor-greeting@portfolio.local',
                message: 'Portfolio Visitor Greeting'
            });

            // To provide an immediate hook to admin panel live
            // (Contacts table already triggers realtime events if configured)
        }

        setStatus('success');
        localStorage.setItem('hasSeenVisitorGreeting', 'true');

        setTimeout(() => {
            setIsVisible(false);
        }, 2000);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="fixed bottom-6 right-6 z-50 w-full max-w-[320px]"
                >
                    <div className="bg-white/90 backdrop-blur-xl border border-border/60 shadow-2xl rounded-2xl p-5 overflow-hidden relative">
                        {/* Decorative glow */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
                        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-secondary/20 blur-2xl rounded-full" />

                        <div className="relative z-10 flex flex-col gap-3 text-center">
                            {status === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-6 flex flex-col items-center gap-2"
                                >
                                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success mb-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="font-bold text-text">Hey {name.split(' ')[0]}! 👋</h3>
                                    <p className="text-xs text-text-light">Feel free to explore my portfolio.</p>
                                </motion.div>
                            ) : (
                                <>
                                    <button
                                        onClick={dismissGreeting}
                                        className="absolute -top-2 -right-2 p-2 text-text-light hover:text-text transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-2">
                                        <span className="text-xl">👋</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text text-[15px]">Welcome!</h3>
                                        <p className="text-xs text-text-light font-medium mt-1 leading-relaxed px-2">
                                            I'd love to know who is visiting, what's your name?
                                        </p>
                                    </div>
                                    <form onSubmit={handleSubmit} className="mt-2 space-y-3">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Your name (optional)"
                                            className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={status === 'submitting'}
                                                className="btn-primary py-2 text-xs flex-1 justify-center rounded-xl font-semibold"
                                            >
                                                {status === 'submitting' ? '...' : (name.trim() ? "That's me!" : "Skip")}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
