import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.15, ease: 'easeOut' }
    })
};

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | sending | sent | error

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) return;

        setStatus('sending');

        if (isSupabaseConfigured()) {
            const { error } = await supabase.from('contacts').insert({
                name: form.name,
                email: form.email,
                message: form.message
            });
            if (error) {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 3000);
                return;
            }
        }

        setStatus('sent');
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
    };

    return (
        <section id="contact" className="relative overflow-hidden">
            <div className="blob blob-purple w-[400px] h-[400px] right-0 top-0 opacity-15" />
            <div className="blob blob-blue w-[300px] h-[300px] left-0 bottom-0 opacity-10" />

            <div className="section-container">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                >
                    <motion.p variants={fadeInUp} custom={0} className="text-primary font-semibold mb-3 tracking-wide uppercase text-sm">
                        Get In Touch
                    </motion.p>
                    <motion.h2 variants={fadeInUp} custom={1} className="section-title mb-4">
                        Let's <span className="gradient-text">Connect</span>
                    </motion.h2>
                    <motion.p variants={fadeInUp} custom={2} className="section-subtitle mb-16">
                        Have a project idea, want to collaborate, or just want to say hello?
                        I'd love to hear from you.
                    </motion.p>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <motion.form
                            variants={fadeInUp}
                            custom={3}
                            onSubmit={handleSubmit}
                            className="bg-white/40 border border-white/60 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
                        >
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="form-input"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="form-input"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">Message</label>
                                    <textarea
                                        value={form.message}
                                        onChange={e => setForm({ ...form, message: e.target.value })}
                                        className="form-input min-h-[140px] resize-none"
                                        placeholder="Tell me about your project or idea..."
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="btn-primary w-full justify-center disabled:opacity-60"
                                >
                                    {status === 'sending' ? (
                                        <>
                                            <span className="spinner" />
                                            Sending...
                                        </>
                                    ) : status === 'sent' ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Message Sent!
                                        </>
                                    ) : status === 'error' ? (
                                        'Something went wrong. Try again.'
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.form>

                        {/* Contact Info */}
                        <motion.div variants={fadeInUp} custom={4} className="space-y-6">
                            {/* Info Cards */}
                            {[
                                {
                                    icon: (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    ),
                                    label: 'Phone',
                                    value: '+91 9967680816',
                                    href: 'tel:+919967680816'
                                },
                                {
                                    icon: (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    ),
                                    label: 'Email',
                                    value: 'abdullahctmail@gmail.com',
                                    href: 'mailto:abdullahctmail@gmail.com'
                                },
                                {
                                    icon: (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ),
                                    label: 'Location',
                                    value: 'Mumbai, Maharashtra, India',
                                    href: null
                                }
                            ].map(item => (
                                <div key={item.label} className="p-2 flex items-center gap-5 group">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-light font-medium uppercase tracking-wide">{item.label}</p>
                                        {item.href ? (
                                            <a href={item.href} className="font-semibold text-text hover:text-primary transition-colors text-sm">
                                                {item.value}
                                            </a>
                                        ) : (
                                            <p className="font-semibold text-sm">{item.value}</p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Social links */}
                            <div className="pt-8 mt-4 border-t border-border/60">
                                <p className="text-xs text-text-light font-medium uppercase tracking-wide mb-4">Social Links</p>
                                <div className="flex gap-3">
                                    <a href="https://linkedin.com/in/abdullah-shaikh225" target="_blank" rel="noopener noreferrer"
                                        className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary hover:from-primary hover:to-secondary hover:text-white transition-all duration-300">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    </a>
                                    <a href="https://github.com/abdullah-shaikh225" target="_blank" rel="noopener noreferrer"
                                        className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary hover:from-primary hover:to-secondary hover:text-white transition-all duration-300">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    </a>
                                    <a href="tel:+919967680815"
                                        className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary hover:from-primary hover:to-secondary hover:text-white transition-all duration-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
