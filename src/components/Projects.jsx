import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fallbackProjects } from '../data/fallbackData';
import { trackProjectClick } from '../lib/analytics';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' }
    })
};

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            if (isSupabaseConfigured()) {
                const { data } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('is_visible', true)
                    .order('order_index', { ascending: true });
                if (data && data.length > 0) setProjects(data);
                else setProjects(fallbackProjects);
            } else {
                setProjects(fallbackProjects);
            }
        };
        fetchProjects();

        if (isSupabaseConfigured()) {
            const channel = supabase
                .channel('projects-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
                    fetchProjects();
                })
                .subscribe();
            return () => supabase.removeChannel(channel);
        }
    }, []);

    const handleProjectClick = (project) => {
        trackProjectClick(project.id);
        if (project.live_link) {
            window.open(project.live_link, '_blank');
        }
    };

    const toggleReadMore = (e, projectId) => {
        e.stopPropagation();
        setExpandedId(expandedId === projectId ? null : projectId);
    };

    return (
        <section id="projects" className="relative overflow-hidden">
            <div className="section-container relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                >
                    <motion.p variants={fadeInUp} custom={0} className="text-primary font-semibold mb-3 tracking-wide uppercase text-sm">
                        Portfolio
                    </motion.p>
                    <motion.h2 variants={fadeInUp} custom={1} className="section-title mb-4">
                        Featured <span className="gradient-text">Projects</span>
                    </motion.h2>
                    <motion.p variants={fadeInUp} custom={2} className="section-subtitle mb-16">
                        A showcase of deployed projects built with modern technologies.
                    </motion.p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, i) => {
                            const isExpanded = expandedId === project.id;
                            const description = project.description || '';
                            const isLong = description.length > 120;

                            return (
                                <motion.div
                                    key={project.id}
                                    variants={fadeInUp}
                                    custom={i + 3}
                                    onClick={() => handleProjectClick(project)}
                                    className="glass-card glow-hover p-6 cursor-pointer flex flex-col items-center text-center group"
                                >
                                    {/* Logo Box */}
                                    <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden mb-5 group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors duration-300">
                                        {project.image_url ? (
                                            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-base font-bold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[48px] flex items-center">
                                        {project.title}
                                    </h3>

                                    {/* Tech Stack */}
                                    <div className="flex flex-wrap justify-center gap-1.5 mb-3 min-h-[28px]">
                                        {(project.tech_stack || []).map((tech, idx) => (
                                            <span key={idx} className="tech-tag text-xs">{tech}</span>
                                        ))}
                                    </div>

                                    {/* Description with Read More */}
                                    <div className="w-full">
                                        <p className={`text-sm text-text-light leading-relaxed ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
                                            {description}
                                        </p>
                                        {isLong && (
                                            <button
                                                onClick={(e) => toggleReadMore(e, project.id)}
                                                className="text-primary text-xs font-semibold mt-2 hover:text-primary-dark transition-colors inline-flex items-center gap-1"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        Show Less
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </>
                                                ) : (
                                                    <>
                                                        Read More
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
