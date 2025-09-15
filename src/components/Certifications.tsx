import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Award, Calendar, ExternalLink, CheckCircle } from 'lucide-react';
// Use global SpotlightGlow to prevent duplication across chunks
const SpotlightGlow = (window as any).SpotlightGlow;
import { useDirectionalAnimation } from '../hooks/useDirectionalAnimation';

interface Certification {
  id: number;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
  image: string;
  url?: string;
  category: 'development' | 'design' | 'cloud' | 'other';
  featured: boolean;
}

// Removed external badge fetching to avoid rate limits on static hosting

const Certifications: React.FC = () => {
  const { getDirectionalVariants, getStaggeredDirectionalVariants } = useDirectionalAnimation();
  
  const [ref, inView] = useInView({ 
    triggerOnce: false, 
    threshold: 0.1,
    rootMargin: '50px 0px'
  });

  // Split certifications into professional and achievements
  const professionalCerts = [
    {
      id: 1,
      name: "CompTIA A+ ce Certification",
      issuer: "Central Maine Community College",
      date: "Jan 2022",
      credentialId: "COMP001021438205",
      image: (process.env.PUBLIC_URL || '') + "/images/CompTIA_badge.webp",
      url: "https://www.credly.com/badges/0afe650b-5181-470f-af84-fe9f88c23918/linked_in",
      category: "Professional",
      featured: true,
      description: "Industry-standard certification demonstrating core IT skills, troubleshooting, and support expertise."
    }
  ];

  const achievements = [
    {
      id: 2,
      name: "Certified Client Pro",
      issuer: "TestOut Corporation",
      date: "Jan 2017",
      credentialId: "CCP-2017",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
      url: "https://www.testout.com/",
      category: "Achievement",
      description: "Comprehensive certification covering Windows OS, hardware, networking, and security."
    },
    {
      id: 3,
      name: "Certified PC Pro",
      issuer: "TestOut Corporation",
      date: "Jan 2017",
      credentialId: "PCP-2017",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
      url: "https://www.testout.com/",
      category: "Achievement",
      description: "Certification in essential computer hardware, OS, and system management skills."
    },
    {
      id: 4,
      name: "Financial Literacy EverFi",
      issuer: "Maine Financial Scholars Program",
      date: "Jan 2018",
      credentialId: "FL-2018",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
      url: "https://everfi.com/",
      category: "Achievement",
      description: "Practical knowledge in savings, credit, insurance, taxes, and investing."
    },
    {
      id: 5,
      name: "IT Achievement Certificates",
      issuer: "Mid-Maine Technical Center",
      date: "Jan 2016",
      credentialId: "IT-2016",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      category: "Achievement",
      description: "Recognizes foundational skills in number systems, binary math, and technical concepts."
    },
    {
      id: 6,
      name: "Safety Certificates",
      issuer: "Mid-Maine Technical Center",
      date: "Jan 2016",
      credentialId: "SAFE-2016",
      image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop",
      category: "Achievement",
      description: "Completion of workplace safety training, including ergonomics and safe equipment use."
    }
  ];

  const categories = [
    { id: 'all', label: 'All Certifications', count: professionalCerts.length + achievements.length },
    { id: 'professional', label: 'Professional Certifications', count: professionalCerts.length },
    { id: 'achievement', label: 'Achievements & Certificates', count: achievements.length },
  ];

  return (
    <section id="certifications" ref={ref} className="section-padding relative z-10 pointer-events-none bg-transparent">
      <div className="container-max">
        <motion.div
          {...getDirectionalVariants(0.4, 0)}
          className="text-center mb-16"
        >
          {/** # OLD CODE - KEEP UNTIL CONFIRMED WORKING
          <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-4">
            Certifications & Achievements
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
            Below are my professional certifications, as well as additional achievements and certificates earned through coursework and skills programs.
          </p>
          */}
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <SpotlightGlow className="bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 dark:border-dark-700/40 transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45 hover:ring-white/50 dark:hover:ring-white/20">
              <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-4">
                Certifications & Achievements
              </h2>
              <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
                Below are my professional certifications, as well as additional achievements and certificates earned through coursework and skills programs.
              </p>
            </SpotlightGlow>
          </div>
        </motion.div>

        {/* Professional Certifications */}
        <motion.div
          {...getDirectionalVariants(0.4, 0.2)}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-secondary-900 dark:text-white text-center mb-8">
            Professional Certifications
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="col-span-full max-w-3xl mx-auto w-full">
              {professionalCerts.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  {...getStaggeredDirectionalVariants(0.3, 0.2, 0.05)(index)}
                  className="relative max-w-xl mx-auto pointer-events-auto"
                >
                 <SpotlightGlow className="rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-center md:items-stretch gap-8 w-full bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20">
                 <div className="flex-shrink-0 flex items-center justify-center w-full md:w-auto">
                   <div className="w-36 h-36 rounded-xl bg-white/70 dark:bg-dark-800/60 backdrop-blur-sm shadow-md border border-white/30 dark:border-dark-700/40 flex items-center justify-center overflow-hidden ring-1 ring-white/40 dark:ring-white/15">
                     <img
                       src={cert.image}
                       alt={cert.name + ' badge'}
                       className="w-36 h-36 object-cover"
                       referrerPolicy="no-referrer"
                       loading="lazy"
                       decoding="async"
                     />
                   </div>
                 </div>
                 <div className="flex-1 w-full flex flex-col items-center md:items-stretch justify-center text-center md:text-left md:pl-2">
                   <div className="flex items-center justify-between mb-1">
                     <h4 className="text-lg font-bold text-secondary-900 dark:text-white">
                       {cert.name}
                     </h4>
                   </div>
                   <p className="text-secondary-600 dark:text-secondary-300 mb-1">
                     {cert.issuer}
                   </p>
                   <div className="flex items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400 mb-2">
                     <div className="flex items-center gap-1">
                       <Calendar size={16} />
                       {cert.date}
                     </div>
                     <div className="flex items-center gap-1">
                       <CheckCircle size={16} />
                       {cert.credentialId}
                     </div>
                   </div>
                   <p className="text-sm text-secondary-700 dark:text-secondary-300 mb-2 max-w-xl mx-auto md:mx-0">
                     {cert.description}
                   </p>
                   <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                    <span className="px-3 py-1 rounded-full text-sm font-medium capitalize w-fit text-primary-700 dark:text-primary-300 bg-primary-100/70 dark:bg-primary-900/50 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15">
                       {cert.category}
                     </span>
                     {cert.url && (
                       <a
                         href={cert.url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-flex items-center justify-center gap-2 text-secondary-700 dark:text-secondary-300 px-3 py-1 text-sm font-medium shadow-md pointer-events-auto cursor-pointer hover:shadow-lg hover:scale-[1.02] bg-white/50 dark:bg-dark-800/40 rounded-full transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 ml-1 whitespace-nowrap"
                       >
                         View Certification
                       </a>
                     )}
                   </div>
                   </div>
                 </SpotlightGlow>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Achievements & Certificates */}
        <motion.div
          {...getDirectionalVariants(0.4, 0.6)}
        >
          <h3 className="text-2xl font-bold text-secondary-900 dark:text-white text-center mb-8">
            Achievements & Certificates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {achievements.map((cert, index) => {
              const isLastOdd = index === achievements.length - 1 && (achievements.length % 2 === 1);
              return (
              <motion.div
                key={cert.id}
                {...getStaggeredDirectionalVariants(0.3, 0.4, 0.05)(index)}
                className={`pointer-events-auto w-full ${isLastOdd ? 'sm:col-span-2 sm:max-w-xl sm:mx-auto' : ''}`}
              >
                {/* OLD CODE - KEEP UNTIL CONFIRMED WORKING
                <SpotlightGlow className="rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 w-80 bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20">
                */}
                {/* NEW CODE - TESTING: full width on mobile, fixed width on larger screens */}
                <SpotlightGlow className="rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 w-full bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/60 dark:bg-dark-800/50 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15">
                    <Award className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                  </div>
                </div>
                <h4 className="font-bold text-secondary-900 dark:text-white mb-2">
                  {cert.name}
                </h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-3">
                  {cert.issuer}
                </p>
                <div className="flex items-center justify-between text-xs text-secondary-500 dark:text-secondary-400 mb-3">
                  <span>{cert.date}</span>
                  <span>{cert.credentialId}</span>
                </div>
                <p className="text-xs text-secondary-700 dark:text-secondary-300 mb-2">
                  {cert.description}
                </p>
                <span className="px-2 py-1 rounded-full text-xs font-medium capitalize text-secondary-700 dark:text-secondary-300 bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15">
                  {cert.category}
                </span>
                </SpotlightGlow>
              </motion.div>
            );})}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Certifications; 