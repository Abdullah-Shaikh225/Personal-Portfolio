import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fallbackCertifications } from '../data/fallbackData';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.15, ease: 'easeOut' }
    })
};

export default function Certifications() {
    const [certifications, setCertifications] = useState([]);

    useEffect(() => {
        const fetchCerts = async () => {
            if (isSupabaseConfigured()) {
                const { data } = await supabase.from('certifications').select('*').order('created_at', { ascending: false });
                if (data && data.length > 0) setCertifications(data);
                else setCertifications(fallbackCertifications);
            } else {
                setCertifications(fallbackCertifications);
            }
        };
        fetchCerts();

        if (isSupabaseConfigured()) {
            const channel = supabase
                .channel('certs-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'certifications' }, () => {
                    fetchCerts();
                })
                .subscribe();
            return () => supabase.removeChannel(channel);
        }
    }, []);

    return (
        <section id="certifications" className="relative overflow-hidden">
            <div className="blob blob-blue w-[350px] h-[350px] left-1/4 top-0 opacity-15" />

            <div className="section-container">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                >
                    <motion.p variants={fadeInUp} custom={0} className="text-primary font-semibold mb-3 tracking-wide uppercase text-sm">
                        Achievements
                    </motion.p>
                    <motion.h2 variants={fadeInUp} custom={1} className="section-title mb-4">
                        Certifications & <span className="gradient-text">Awards</span>
                    </motion.h2>
                    <motion.p variants={fadeInUp} custom={2} className="section-subtitle mb-16">
                        Recognized credentials that validate my expertise in AI, programming,
                        and technical presentation.
                    </motion.p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certifications.map((cert, i) => (
                            <motion.div
                                key={cert.id}
                                variants={fadeInUp}
                                custom={i + 3}
                                className="glass-card glow-hover p-7 group"
                            >
                                {/* Badge icon */}
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-5 group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors">
                                    <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </div>

                                <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">
                                    {cert.title}
                                </h3>
                                <p className="text-text-light text-sm mb-5">
                                    Issued by <span className="font-medium text-text">{cert.issuer}</span>
                                </p>

                                {cert.certificate_link && (
                                    <a
                                        href={cert.certificate_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:gap-3 transition-all"
                                    >
                                        <span>View Certificate</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
