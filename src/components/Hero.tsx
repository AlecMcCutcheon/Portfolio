import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Download, Mail } from 'lucide-react';
import { usePerformanceOptimizedAnimation } from '../hooks/usePerformanceOptimizedAnimation';

const Hero: React.FC = () => {
  const { shouldDisableAnimations, getOptimizedVariants } = usePerformanceOptimizedAnimation();
  
  const scrollToAbout = () => {
    const element = document.querySelector('#about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };



  return (
    <>
      {/* GlassDebugSample disabled for performance */}
      {/* <GlassDebugSample /> */}
      <section id="home" className="hero-section">
        <div className="container-max section-padding relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Profile Image - Optimized for LCP */}
            <picture>
              <source
                srcSet={`${process.env.PUBLIC_URL || ''}/images/Profile_Image.webp`}
                type="image/webp"
              />
              <img
                src={`${process.env.PUBLIC_URL || ''}/images/Profile_Image.webp`}
                alt="Alec McCutcheon profile"
                className="profile-image"
                width="144"
                height="144"
                loading="eager"
                decoding="sync"
                {...({ fetchpriority: "high" } as any)}
              />
            </picture>
            {/* Main Heading - Critical for LCP */}
            <motion.h1
              {...getOptimizedVariants(0.6, 0)}
              className="hero-title"
            >
              Hi, I'm{' '}
              <span className="gradient-text">Alec McCutcheon</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.div
              {...getOptimizedVariants(0.5, shouldDisableAnimations ? 0 : 0.15)}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              {[
                'Certified IT Specialist',
                'PowerShell Programmer',
                'Automation Engineer',
                'Tier 1–3 Support'
              ].map((item) => (
                <span
                  key={item}
                  className="inline-block text-primary-700 dark:text-primary-300 px-4 py-2 font-medium text-base bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-full shadow-lg border border-white/30 dark:border-dark-700/40 pointer-events-auto hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45 transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20"
                  style={{ minWidth: 0 }}
                >
                  {item}
                </span>
              ))}
            </motion.div>

            {/* Description */}
            <motion.div
              {...getOptimizedVariants(0.5, shouldDisableAnimations ? 0 : 0.3)}
              className="mb-12 max-w-3xl mx-auto"
            >
              <p className="text-lg text-secondary-500 dark:text-secondary-400">
                Certified IT Specialist, seasoned PowerShell programmer, automation engineer, and experienced Tier 1–3 support technician. I specialize in automation, scripting, and RMM migration, developing custom solutions that streamline business operations and solve unique client challenges. My background spans system administration, technical support, and freelance work in PowerShell scripting and web design. I also have hands-on experience with network-attached storage (NAS) systems—particularly Unraid for a range of applications including Docker container orchestration, reverse proxy setup, SSL certificate management, and web server hosting.
              </p>
              <p className="text-lg text-secondary-500 dark:text-secondary-400 mt-4">
                Outside of my professional work, I’m passionate about using technology to help others—whether it’s volunteering my skills for individuals in need, building educational resources like a scareware simulation site to help users recognize online threats, or creating open-source tools to solve real-world problems.
              </p>
              <p className="text-lg text-secondary-500 dark:text-secondary-400 mt-4">
                I’m always exploring new technologies—dabbling in React, Flutter, and integrating AI into my workflow—to stay at the forefront of innovation and to empower others through knowledge and practical solutions.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              {...getOptimizedVariants(0.4, shouldDisableAnimations ? 0 : 0.25)}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              {/* Download Resume CTA */}
              <a
                href={(process.env.PUBLIC_URL || '') + '/pdfs/resume.pdf'}
                download
                className="inline-flex items-center gap-2 text-primary-700 dark:text-primary-300 px-6 py-3 font-medium text-base shadow-md pointer-events-auto cursor-pointer hover:shadow-lg hover:scale-[1.02] bg-primary-100/50 dark:bg-primary-900/40 rounded-lg transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20"
                style={{ minWidth: 0 }}
              >
                <Download size={20} />
                Download Resume
              </a>
              <button
                className="inline-flex items-center gap-2 text-secondary-700 dark:text-secondary-300 px-6 py-3 font-medium text-base shadow-md pointer-events-auto cursor-pointer hover:shadow-lg hover:scale-[1.02] bg-white/50 dark:bg-dark-800/40 rounded-lg transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20"
                style={{ 
                  minWidth: 0,
                }}
                onClick={() => {
                  const el = document.querySelector('#contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const el = document.querySelector('#contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Mail size={20} />
                Get In Touch
              </button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              {...getOptimizedVariants(0.3, shouldDisableAnimations ? 0 : 0.4)}
              className="flex justify-center"
            >
              <button
                onClick={scrollToAbout}
                className="flex flex-col items-center text-secondary-400 dark:text-secondary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              >
                <span className="text-sm mb-2">Learn More</span>
                <motion.div
                  animate={shouldDisableAnimations ? {} : { y: [0, 10, 0] }}
                  transition={shouldDisableAnimations ? {} : { duration: 2, repeat: Infinity }}
                >
                  <ChevronDown size={24} />
                </motion.div>
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero; 