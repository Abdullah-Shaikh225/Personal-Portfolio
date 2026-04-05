import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fallbackSkills } from '../data/fallbackData';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' }
    })
};

const categoryIcons = {
    'Languages': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    ),
    'Frameworks': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
    ),
    'Tools': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    'Soft Skills': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    )
};

const categoryOrder = ['Languages', 'Frameworks', 'Tools', 'Soft Skills'];

export default function Skills() {
    const [skills, setSkills] = useState([]);

    useEffect(() => {
        const fetchSkills = async () => {
            if (isSupabaseConfigured()) {
                const { data } = await supabase.from('skills').select('*');
                if (data && data.length > 0) setSkills(data);
                else setSkills(fallbackSkills);
            } else {
                setSkills(fallbackSkills);
            }
        };
        fetchSkills();

        if (isSupabaseConfigured()) {
            const channel = supabase
                .channel('skills-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'skills' }, () => {
                    fetchSkills();
                })
                .subscribe();
            return () => supabase.removeChannel(channel);
        }
    }, []);

    const groupedSkills = categoryOrder
        .map(cat => ({
            category: cat,
            items: skills.filter(s => s.category === cat)
        }))
        .filter(group => group.items.length > 0);

    return (
        <section id="skills" className="relative overflow-hidden">
            <div className="blob blob-purple w-[300px] h-[300px] right-0 bottom-20 opacity-15" />

            <div className="section-container">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                >
                    <motion.p variants={fadeInUp} custom={0} className="text-primary font-semibold mb-3 tracking-wide uppercase text-sm">
                        Expertise
                    </motion.p>
                    <motion.h2 variants={fadeInUp} custom={1} className="section-title mb-4">
                        Skills & <span className="gradient-text">Technologies</span>
                    </motion.h2>
                    <motion.p variants={fadeInUp} custom={2} className="section-subtitle mb-16">
                        A well-rounded toolkit spanning programming languages, frameworks,
                        developer tools, and essential soft skills.
                    </motion.p>

                    <div className="grid sm:grid-cols-2 gap-8">
                        {groupedSkills.map((group, gi) => (
                            <motion.div
                                key={group.category}
                                variants={fadeInUp}
                                custom={gi + 3}
                                className="border-t-2 border-border/60 pt-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary">
                                        {categoryIcons[group.category]}
                                    </div>
                                    <h3 className="font-bold text-lg">{group.category}</h3>
                                </div>

                                <div className="space-y-4">
                                    {group.items.map(skill => (
                                        <div key={skill.id} className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-text">{skill.name}</span>
                                            <div className="flex gap-1.5">
                                                {[1, 2, 3, 4, 5].map(dot => (
                                                    <div
                                                        key={dot}
                                                        className={`skill-dot ${dot <= skill.level ? 'skill-dot-filled' : 'skill-dot-empty'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
