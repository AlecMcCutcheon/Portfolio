import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Download, Briefcase, GraduationCap, Star, Calendar, MapPin } from 'lucide-react';
// Use global SpotlightGlow to prevent duplication across chunks
const SpotlightGlow = (window as any).SpotlightGlow;

interface Experience {
  id: number;
  title: string;
  subtitle?: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  technologies: string[];
}

interface Education {
  id: number;
  degree: string;
  institution: string;
  location: string;
  period: string;
  description: string;
}

const Resume: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px 0px'
  });

  const [activeTab, setActiveTab] = useState<'experience' | 'education' | 'skills'>('experience');

  const experiences: Experience[] = [
    {
      id: 1,
      // title kept updated
      title: "Automation Engineer",
      subtitle: "Tier 1-3 Technical Manager & Support Technician",
      company: "One Bridge Consulting",
      location: "Monmouth, Maine, United States · Hybrid",
      period: "Jul 2019 - Present",
      description: [
        "Developed and enhanced company website, boosting user experience and functionality.",
        "Automated system tasks with PowerShell, elevating performance and efficiency.",
        "Resolved complex technical issues, improving client satisfaction.",
        "Mentored junior technicians, reducing escalations and improving team expertise.",
        "Designed custom scripts for client-specific needs, ensuring optimal system performance.",
        "Collaborated on internal projects, contributing to seamless business operations.",
        "Streamlined client systems with custom scripts, improving operational metrics and user satisfaction.",
        "Refined security protocols, fortifying systems against potential cyber threats.",
        "Streamlined the migration of users and machines from a local domain to Azure AD using PowerShell scripting.",
        "Co-led migration to Datto RMM, significantly enhancing operational efficiency.",
        "Transitioned and adapted existing scripting and automation processes to modern tooling.",
        "Managed detailed system documentation to ensure compliance and efficient knowledge transfer."
      ],
      technologies: [
        "PowerShell",
        "Azure AD",
        "Datto RMM",
        "Automation",
        "System Administration",
        "Security",
        "Documentation"
      ]
    },
    {
      id: 2,
      title: "PowerShell Programmer",
      subtitle: "PowerShell and Project Consultant",
      company: "Fiverr",
      location: "Remote",
      period: "Apr 2023",
      description: [
        "Develop custom PowerShell scripts to automate client tasks, enhancing operational efficiency.",
        "Provide expert consulting on PowerShell projects, delivering tailored solutions to meet client needs.",
        "Optimize existing scripts to improve performance and reliability, ensuring seamless execution.",
        "Collaborate with clients to identify requirements and deliver precise, effective scripting solutions.",
        "Conduct thorough code reviews to ensure script integrity and efficiency."
      ],
      technologies: ["PowerShell", "Automation", "Consulting", "Script Optimization", "Code Review"]
    },
    {
      id: 4,
      title: "Web Designer (Wix)",
      subtitle: "Wix Specialist, SEO & Content Management",
      company: "Jackson RV Rental",
      location: "Remote",
      period: "Apr 2024 - Present",
      description: [
        "Designed and deployed a visually appealing, user-friendly website, enhancing brand messaging.",
        "Configured site with SEO best practices, ensuring high visibility and easy customer access.",
        "Utilized web design and SEO skills to create an effective online presence.",
        "Achieved measurable improvements in online visibility and customer engagement."
      ],
      technologies: ["Web Design", "Wix", "SEO", "HTML", "CSS", "User Experience", "Content Management"]
    }
  ];

  const education: Education[] = [
    {
      id: 1,
      degree: "Information Technology",
      institution: "Mid-Maine Technical Center",
      location: "Maine",
      period: "2016 - 2017",
      description: "Basic troubleshooting of desktop and laptop hardware and software problems using diagnostic software and electronic test equipment. Able to assemble, upgrade, and install computer operating systems, perform preventive maintenance, and conduct diagnostic system tests."
    },
    {
      id: 2,
      degree: "Apple Technology",
      institution: "Mid-Maine Technical Center",
      location: "Maine",
      period: "2017 - 2018",
      description: "Basic troubleshooting and repair of desktop and portable Macintosh systems. Able to identify and resolve common OS X problems and use Apple Service and Support products to effectively repair Apple hardware."
    },
    {
      id: 3,
      degree: "High School Diploma",
      institution: "Messalonskee High School",
      location: "Maine",
      period: "2014 - 2018",
      description: "Completed high school education with focus on technology and computer systems."
    }
  ];

  const skillCategories = [
    {
      category: "System Administration",
      skills: [
        { name: "PowerShell", level: 95 },
        { name: "System Administration", level: 90 },
        { name: "Hardware Troubleshooting", level: 90 },
        { name: "Network Setup", level: 85 },
        { name: "Azure AD", level: 85 }
      ]
    },
    {
      category: "Web Development",
      skills: [
        { name: "HTML/CSS", level: 90 },
        { name: "JavaScript", level: 85 },
        { name: "Web Design", level: 85 },
        { name: "SEO", level: 80 },
        { name: "User Experience", level: 80 }
      ]
    },
    {
      category: "IT Support & Tools",
      skills: [
        { name: "ConnectWise Automate", level: 90 },
        { name: "Malware Detection", level: 85 },
        { name: "System Hardening", level: 85 },
        { name: "Automation Scripting", level: 95 },
        { name: "Technical Support", level: 90 }
      ]
    }
  ];

  return (
    <section id="resume" className="section-padding relative z-10 pointer-events-none bg-transparent">
      <div className="container-max">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          {/* Resume header */}
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <SpotlightGlow className="bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 dark:border-dark-700/40 transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45 hover:ring-white/50 dark:hover:ring-white/20">
              <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-4">Resume</h2>
              <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto mb-8">My professional journey, education, and technical expertise.</p>
              {/* Static PDF download */}
              <a
                href={(process.env.PUBLIC_URL || '') + '/pdfs/resume.pdf'}
                download
                className="inline-flex items-center gap-2 text-secondary-700 dark:text-secondary-300 px-6 py-3 font-medium text-base shadow-md pointer-events-auto cursor-pointer hover:shadow-lg hover:scale-[1.02] bg-white/50 dark:bg-dark-800/40 rounded-lg transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 mx-auto"
              >
                <Download size={20} />
                Download Full Resume
              </a>
            </SpotlightGlow>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12 pointer-events-auto"
        >
          <button
            onClick={() => setActiveTab('experience')}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-base shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 ${
              activeTab === 'experience'
                ? 'text-primary-700 dark:text-primary-300 bg-primary-100/50 dark:bg-primary-900/40'
                : 'text-secondary-700 dark:text-secondary-300 bg-white/50 dark:bg-dark-800/40'
            }`}
          >
            <Briefcase size={20} />
            Experience
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-base shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 ${
              activeTab === 'education'
                ? 'text-primary-700 dark:text-primary-300 bg-primary-100/50 dark:bg-primary-900/40'
                : 'text-secondary-700 dark:text-secondary-300 bg-white/50 dark:bg-dark-800/40'
            }`}
          >
            <GraduationCap size={20} />
            Education
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-base shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 ${
              activeTab === 'skills'
                ? 'text-primary-700 dark:text-primary-300 bg-primary-100/50 dark:bg-primary-900/40'
                : 'text-secondary-700 dark:text-secondary-300 bg-white/50 dark:bg-dark-800/40'
            }`}
          >
            <Star size={20} />
            Skills
          </button>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {activeTab === 'experience' && (
            <div className="space-y-8">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  className="pointer-events-auto"
                >
                  <SpotlightGlow className="rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-1">
                        {exp.title}
                      </h3>
                      {exp.subtitle && (
                        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">{exp.subtitle}</p>
                      )}
                      <p className="text-lg text-primary-600 font-medium mb-2">
                        {exp.company}
                      </p>
                      <div className="flex items-center gap-4 text-secondary-500 dark:text-secondary-400">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          {exp.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {exp.period}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {exp.description.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-primary-500/80 dark:bg-primary-300/80 ring-1 ring-white/40"></div>
                        <span className="text-secondary-600 dark:text-secondary-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 rounded-full text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-100/70 dark:bg-primary-900/50 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  </SpotlightGlow>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-8">
              {education.map((edu, index) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  className="pointer-events-auto"
                >
                  <SpotlightGlow className="rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
                        {edu.degree}
                      </h3>
                      <p className="text-lg text-primary-600 font-medium mb-2">
                        {edu.institution}
                      </p>
                      <div className="flex items-center gap-4 text-secondary-500 dark:text-secondary-400">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          {edu.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {edu.period}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
                    {edu.description}
                  </p>
                  </SpotlightGlow>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-8">
              {skillCategories.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  className="pointer-events-auto"
                >
                  <SpotlightGlow className="rounded-xl p-8 shadow-lg transition-all bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15">
                  <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6">
                    {category.category}
                  </h3>
                  <div className="space-y-4">
                    {category.skills.map((skill) => (
                      <div key={skill.name}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-secondary-700 dark:text-secondary-300">
                            {skill.name}
                          </span>
                          <span className="text-sm text-secondary-500 dark:text-secondary-400">
                            {skill.level}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary-200 dark:bg-dark-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={inView ? { width: `${skill.level}%` } : {}}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                            className="h-2 rounded-full bg-primary-500/80 dark:bg-primary-300/80 ring-1 ring-white/30"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  </SpotlightGlow>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Resume; 