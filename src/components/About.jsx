import { motion } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' }
    })
};

export default function About() {
    return (
        <section id="about" className="relative overflow-hidden">
            <div className="blob blob-purple w-[350px] h-[350px] -right-20 top-20 opacity-20" />

            <div className="section-container">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid md:grid-cols-2 gap-16 items-center"
                >
                    {/* Left — About text */}
                    <div>
                        <motion.p variants={fadeInUp} custom={0} className="text-primary font-semibold mb-3 tracking-wide uppercase text-sm">
                            About Me
                        </motion.p>
                        <motion.h2 variants={fadeInUp} custom={1} className="section-title">
                            Passionate about{' '}
                            <span className="gradient-text">AI</span> &{' '}
                            <span className="gradient-text">Technology</span>
                        </motion.h2>
                        <motion.p variants={fadeInUp} custom={2} className="text-text-light leading-relaxed mb-6 text-[1.05rem]">
                            I'm a Computer Engineering student at Rizvi College of Engineering, Mumbai University,
                            with a deep passion for Artificial Intelligence and Full Stack Development. I believe
                            in building solutions that are not just functional — but intelligent.
                        </motion.p>
                        <motion.p variants={fadeInUp} custom={3} className="text-text-light leading-relaxed mb-8 text-[1.05rem]">
                            Currently exploring the frontiers of Machine Learning, building AI-powered platforms,
                            and sharpening my skills in Data Structures & Algorithms. My goal is to bridge the gap
                            between cutting-edge AI research and real-world applications.
                        </motion.p>

                        {/* Quick facts */}
                        <motion.div variants={fadeInUp} custom={4} className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Location', value: '📍 Mumbai, India' },
                                { label: 'Education', value: '🎓 B.E. Computer Eng.' },
                                { label: 'CGPA', value: '⭐ 8.20' },
                                { label: 'Focus', value: '🤖 AI & Full Stack' },
                            ].map((fact) => (
                                <div key={fact.label} className="border-l-2 border-primary/30 pl-4 py-1">
                                    <p className="text-xs text-text-light font-medium mb-1 uppercase tracking-wider">{fact.label}</p>
                                    <p className="font-semibold text-sm text-text">{fact.value}</p>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right — Experience card */}
                    <motion.div variants={fadeInUp} custom={3}>
                        <div className="relative pt-8 sm:pt-0 sm:pl-10">

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Work Experience</h3>
                                    <p className="text-text-light text-sm">Professional Journey</p>
                                </div>
                            </div>

                            <div className="border-l-2 border-primary/30 pl-6 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-primary -ml-[31px] ring-4 ring-white" />
                                        <span className="text-xs text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">
                                            Sep 2025 — Feb 2026
                                        </span>
                                    </div>
                                    <h4 className="font-bold">Software Development Intern</h4>
                                    <p className="text-primary font-medium text-sm mb-2">Baloxa Media, Mumbai</p>
                                    <ul className="text-text-light text-sm leading-relaxed space-y-1.5">
                                        <li className="flex gap-2">
                                            <span className="text-primary mt-1">▸</span>
                                            Built full-stack online voting system with React, Node.js & MongoDB
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-primary mt-1">▸</span>
                                            Implemented real-time vote calculation and result generation
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-primary mt-1">▸</span>
                                            Designed dynamic nomination workflow with category-based logic
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-primary mt-1">▸</span>
                                            Optimized frontend performance and backend API responses
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Currently learning tag */}
                            <div className="mt-10">
                                <p className="text-sm font-semibold text-text mb-3">🔥 Currently Learning</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Data Structures', 'Algorithms', 'Machine Learning', 'Pandas', 'NumPy'].map(item => (
                                        <span key={item} className="tech-tag text-xs">{item}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
