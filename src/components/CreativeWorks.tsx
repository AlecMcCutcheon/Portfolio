import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ExternalLink, Github, Code, Palette, Globe } from 'lucide-react';
import SpotlightGlow from '../ui/SpotlightGlow';
import { generateProceduralImage, stableStringify } from '../ui/ProceduralArt';
import OptimizedImage from '../ui/OptimizedImage';
import { useDirectionalAnimation } from '../hooks/useDirectionalAnimation';

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  updated_at: string;
  has_pages?: boolean;
  default_branch: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  category: 'web' | 'design' | 'other';
  technologies: string[];
  liveUrl?: string;
  githubUrl: string;
  featured: boolean;
  stars: number;
  updatedAt: string;
  seed?: string;
  isCurrentWebsite?: boolean;
}

const CreativeWorks: React.FC = () => {
  const { getDirectionalVariants, getStaggeredDirectionalVariants } = useDirectionalAnimation();
  
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
    rootMargin: '50px 0px'
  });

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  // Trigger re-render on theme change so procedural images update
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const check = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Function to fetch README content
  const fetchReadmeContent = async (repoName: string): Promise<string> => {
    try {
      const response = await fetch(`https://api.github.com/repos/AlecMcCutcheon/${repoName}/readme`);
      if (!response.ok) return '';
      
      const data = await response.json();
      const readmeContent = atob(data.content); // Decode base64 content
      
      // Extract first paragraph or first few sentences
      const lines = readmeContent.split('\n').filter(line => line.trim());
      let description = '';
      
      for (const line of lines) {
        // Skip headers, code blocks, and empty lines
        if (line.startsWith('#') || line.startsWith('```') || line.trim() === '') continue;
        
        // Take the first meaningful paragraph
        if (line.trim().length > 20) {
          description = line.trim();
          break;
        }
      }
      
      return description;
    } catch (error) {
      console.error(`Error fetching README for ${repoName}:`, error);
      return '';
    }
  };

  // Function to check if repository has GitHub Pages
  const checkGitHubPages = (repo: GitHubRepo): boolean => {
    // Use the has_pages field from the repository data
    return repo.has_pages || false;
  };

  // Function to fetch social media preview image and description from a URL using Open Graph API
  const fetchSocialData = async (url: string): Promise<{image: string, description: string}> => {
    try {
      // Use a public Open Graph API service to avoid CORS issues
      // Request higher quality images with specific dimensions
      const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true&screenshot=true&screenshot.width=1200&screenshot.height=630&image.width=1200&image.height=630`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      let image = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop";
      let description = "Professional website showcasing modern design and functionality.";
      
      if (data.status === 'success' && data.data) {
        // Try to get the Open Graph image with high quality
        if (data.data.image && data.data.image.url) {
          image = data.data.image.url;
        } else if (data.data.screenshot && data.data.screenshot.url) {
          image = data.data.screenshot.url;
        } else if (data.data.logo && data.data.logo.url) {
          image = data.data.logo.url;
        }
        
        // Try to get the Open Graph description
        if (data.data.description) {
          description = data.data.description;
        } else if (data.data.title) {
          description = data.data.title;
        }
      }
      
      return { image, description };
    } catch (error) {
      console.error(`Error fetching social data for ${url}:`, error);
      return {
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
        description: "Professional website showcasing modern design and functionality."
      };
    }
  };

  // Function to generate a better description
  const generateDescription = (repo: GitHubRepo, readmeContent: string): string => {
    // If repo has a good description, use it
    if (repo.description && repo.description.length > 50) {
      return repo.description;
    }
    
    // If README content is available and meaningful, use it
    if (readmeContent && readmeContent.length > 30) {
      return readmeContent;
    }
    
    // Generate description based on repo name and topics
    const name = repo.name.replace(/-/g, ' ').replace(/_/g, ' ');
    const topics = repo.topics.join(', ');
    
    if (repo.topics.includes('stremio')) {
      return `A Stremio addon for ${name.toLowerCase().includes('radio') ? 'streaming radio content' : 'streaming media content'}.`;
    }
    
    if (repo.topics.includes('aws') || repo.name.toLowerCase().includes('aws')) {
      return `AWS Connect addons and integrations for enhanced cloud communication solutions.`;
    }
    
    if (repo.language === 'JavaScript') {
      return `A JavaScript-based ${name.toLowerCase().includes('api') ? 'API' : 'web application'} showcasing modern development practices.`;
    }
    
    // Default fallback
    return `A creative project showcasing innovative solutions and technical expertise in ${repo.language || 'web development'}.`;
  };

  useEffect(() => {
    const fetchGitHubProjects = async () => {
      try {
        const response = await fetch('https://api.github.com/users/AlecMcCutcheon/repos');
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        const repos = await response.json();
        
        // Check if repos is an array
        if (!Array.isArray(repos)) {
          console.error('GitHub API did not return an array:', repos);
          throw new Error('Invalid response from GitHub API');
        }
        
        // Filter out forks, archived repos, Portfolio repo, and sort by stars and update date
        const filteredRepos = repos
          .filter(repo => !repo.fork && !repo.archived && repo.description && repo.name !== 'Portfolio')
          .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        const projectImages = [
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&h=400&fit=crop"
        ];

        // Fetch README content and check GitHub Pages for repos
        const reposWithData = await Promise.all(
          filteredRepos.map(async (repo) => {
            let readmeContent = '';
            if (!repo.description || repo.description.length < 50) {
              readmeContent = await fetchReadmeContent(repo.name);
            }
            const hasPages = checkGitHubPages(repo);
            return { ...repo, readmeContent, hasPages };
          })
        );

        const mappedProjects: Project[] = reposWithData.map((repo, index) => {
          // Determine category based on topics, language, and description
          let category: 'web' | 'design' | 'other' = 'other';
          
          // Web Apps category: any repository with GitHub Pages enabled
          if (repo.has_pages) {
            category = 'web';
          } else if (repo.topics.includes('design') || repo.topics.includes('ui') || repo.topics.includes('ux')) {
            category = 'design';
          }

          // Extract technologies from topics and language
          const technologies = [
            repo.language,
            ...repo.topics.filter((topic: string) => 
              ['javascript', 'typescript', 'react', 'node', 'python', 'aws', 'docker', 'api', 'web', 'design', 'stremio'].includes(topic.toLowerCase())
            )
          ].filter(Boolean) as string[];

          const liveUrl = repo.hasPages ? `https://alecmccutcheon.github.io/${repo.name}` : undefined;
          
          const title = repo.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
          const description = generateDescription(repo, repo.readmeContent);
          // Build a seed from the ENTIRE repo object (deterministic ordering)
          const seed = stableStringify(repo);
          return {
            id: repo.id,
            title,
            description,
            image: generateProceduralImage(seed),
            category,
            technologies: technologies.length > 0 ? technologies : ['JavaScript'],
            liveUrl,
            githubUrl: repo.html_url,
            featured: index < 3, // First 3 projects are featured
            stars: repo.stargazers_count,
            updatedAt: repo.updated_at,
            seed,
          };
        });

        // Add client websites to the projects
        const clientWebsites = [
          {
            id: 1000,
            title: "Personal Portfolio (This Website)",
            description: "Modern, responsive portfolio website showcasing my work as an adaptable technologist, creative problem-solver, and lifelong learner. Features smooth directional animations, mobile optimization, and interactive sections including creative works, certifications, and professional background.",
            image: generateProceduralImage(stableStringify({ url: 'https://alecmccutcheon.github.io/Portfolio/', title: 'Personal Portfolio' })),
            category: "design" as const,
            technologies: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "Responsive Design"],
            liveUrl: "https://alecmccutcheon.github.io/Portfolio/",
            githubUrl: "https://github.com/AlecMcCutcheon/Portfolio",
            featured: false,
            stars: 1,
            updatedAt: new Date().toISOString(),
            seed: stableStringify({ url: 'https://alecmccutcheon.github.io/Portfolio/', title: 'Personal Portfolio' }),
            isCurrentWebsite: true
          },
          {
            id: 9991,
            title: "One Bridge Consulting",
            description: "Managed IT and consulting in Central Maine—security & compliance, automation, device and app management, cloud migration, and proactive support. My role: end‑to‑end site setup, Wix web design, structure, and SEO improvements.",
            image: generateProceduralImage(stableStringify({ url: 'https://www.onebridgeconsulting.net/', title: 'One Bridge Consulting' })),
            category: "design" as const,
            technologies: ["Wix", "Web Design", "Business", "Consulting"],
            liveUrl: "https://www.onebridgeconsulting.net/",
            githubUrl: "#",
            featured: false,
            stars: 0,
            updatedAt: "2024-01-01T00:00:00Z",
            seed: stableStringify({ url: 'https://www.onebridgeconsulting.net/', title: 'One Bridge Consulting' })
          },
          {
            id: 9992,
            title: "Jackson RV Rental",
            description: "RV rentals in Anson, ME—quality RVs, 24/7 assistance, expert trip advice, transparent pricing, and a simple reserve‑plan‑go flow. My role: full Wix site build, design, SEO, plus backend support for a custom reservations system.",
            image: generateProceduralImage(stableStringify({ url: 'https://www.jacksonrvrental.com/', title: 'Jackson RV Rental' })),
            category: "design" as const,
            technologies: ["Wix", "Web Design", "Backend", "Custom Reservations", "Rental", "RV"],
            liveUrl: "https://www.jacksonrvrental.com/",
            githubUrl: "#",
            featured: false,
            stars: 0,
            updatedAt: "2024-01-01T00:00:00Z",
            seed: stableStringify({ url: 'https://www.jacksonrvrental.com/', title: 'Jackson RV Rental' })
          },
          {
            id: 9993,
            title: "Tidewater O.P.E.N. Speedtest",
            description: "Custom‑branded speed test for Tidewater based on OpenSpeedTest—an HTML5, no‑plugins network speed test designed to replicate real‑world speeds across devices. My role: UI customization and deployment as a static web app. Learn more: openspeedtest.com",
            image: generateProceduralImage(stableStringify({ url: 'https://speedtest.tidewater.net/', title: 'Tidewater O.P.E.N. Speedtest' })),
            category: "design" as const,
            technologies: ["HTML/CSS", "OpenSpeedTest", "UI Customization", "Web App"],
            liveUrl: "https://speedtest.tidewater.net/",
            githubUrl: "#",
            featured: false,
            stars: 0,
            updatedAt: "2024-01-01T00:00:00Z",
            seed: stableStringify({ url: 'https://speedtest.tidewater.net/', title: 'Tidewater O.P.E.N. Speedtest' })
          }
        ];

        setProjects([...mappedProjects, ...clientWebsites]);
      } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        // Fallback to sample projects if API fails
        setProjects([
          {
            id: 1,
            title: "Stremio Maine Local News",
            description: "Stremio Add-On to Watch Maine Local News Stations - A streaming media addon for local news content.",
            image: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&h=400&fit=crop",
            category: "web",
            technologies: ["JavaScript", "API", "Streaming"],
            liveUrl: "https://a0da031547f5-stremio-mainelocalnews.baby-beamup.club",
            githubUrl: "https://github.com/AlecMcCutcheon/stremio-mainelocalnews",
            featured: true,
            stars: 0,
            updatedAt: "2024-02-03T05:53:53Z"
          },
          {
            id: 2,
            title: "Stremio Maine Radio",
            description: "A streaming media addon for Maine radio stations, providing local audio content.",
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
            category: "web",
            technologies: ["JavaScript", "Audio", "Streaming"],
            liveUrl: "https://a0da031547f5-stremio-maine-radio.baby-beamup.club",
            githubUrl: "https://github.com/AlecMcCutcheon/stremio-maine-radio",
            featured: true,
            stars: 0,
            updatedAt: "2024-01-30T17:55:40Z"
          },
          {
            id: 3,
            title: "AWS Connect Addons",
            description: "AWS Connect addons and integrations for enhanced cloud communication solutions.",
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
            category: "web",
            technologies: ["AWS", "Cloud", "JavaScript"],
            githubUrl: "https://github.com/AlecMcCutcheon/AWS-Connect-Addons",
            featured: true,
            stars: 0,
            updatedAt: "2023-09-24T22:05:35Z"
          },
          {
            id: 4,
            title: "One Bridge Consulting",
            description: "Managed IT and consulting in Central Maine—security & compliance, automation, device and app management, cloud migration, and proactive support. My role: end‑to‑end site setup, Wix web design, structure, and SEO improvements.",
            image: generateProceduralImage(stableStringify({ url: 'https://www.onebridgeconsulting.net/', title: 'One Bridge Consulting' })),
            category: "design",
            technologies: ["Wix", "Web Design", "Business", "Consulting"],
            liveUrl: "https://www.onebridgeconsulting.net/",
            githubUrl: "#",
            featured: false,
            stars: 0,
            updatedAt: "2024-01-01T00:00:00Z"
          },
          {
            id: 5,
            title: "Jackson RV Rental",
            description: "RV rentals in Anson, ME—quality RVs, 24/7 assistance, expert trip advice, transparent pricing, and a simple reserve‑plan‑go flow. My role: full Wix site build, design, SEO, plus backend support for a custom reservations system.",
            image: generateProceduralImage(stableStringify({ url: 'https://www.jacksonrvrental.com/', title: 'Jackson RV Rental' })),
            category: "design",
            technologies: ["Wix", "Web Design", "Backend", "Custom Reservations", "Rental", "RV"],
            liveUrl: "https://www.jacksonrvrental.com/",
            githubUrl: "#",
            featured: false,
            stars: 0,
            updatedAt: "2024-01-01T00:00:00Z"
          },
          {
            id: 6,
            title: "Tidewater O.P.E.N. Speedtest",
            description: "Custom‑branded speed test for Tidewater based on OpenSpeedTest—an HTML5, no‑plugins network speed test designed to replicate real‑world speeds across devices. My role: UI customization and deployment as a static web app. Learn more: openspeedtest.com",
            image: generateProceduralImage(stableStringify({ url: 'https://speedtest.tidewater.net/', title: 'Tidewater O.P.E.N. Speedtest' })),
            category: "design",
            technologies: ["HTML/CSS", "OpenSpeedTest", "UI Customization", "Web App"],
            liveUrl: "https://speedtest.tidewater.net/",
            githubUrl: "#",
            featured: false,
            stars: 0,
            updatedAt: "2024-01-01T00:00:00Z"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubProjects();
  }, []);

  const filters = [
    { id: 'all', label: 'All Projects', icon: <Globe className="w-4 h-4" /> },
    { id: 'web', label: 'Web Apps', icon: <Code className="w-4 h-4" /> },
    { id: 'design', label: 'Design', icon: <Palette className="w-4 h-4" /> },
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects.filter(project => project.category !== 'design') // Exclude design projects from "All Projects"
    : projects.filter(project => project.category === activeFilter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <section id="works" className="section-padding bg-transparent">
        <div className="container-max">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600 dark:text-secondary-300">Loading projects...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="works" ref={ref} className="section-padding relative z-10 pointer-events-none bg-transparent">
      <div className="container-max">
        <motion.div
          {...getDirectionalVariants(0.4, 0)}
          className="text-center mb-16"
        >
          {/* Badge-themed container (matches About title card) */}
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <SpotlightGlow className="bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 dark:border-dark-700/40 transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45 hover:ring-white/50 dark:hover:ring-white/20">
              <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-4">
                Creative Works
              </h2>
              <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
                Explore my portfolio of projects, from web applications to design work. 
                Each project represents a unique challenge and creative solution.
              </p>
            </SpotlightGlow>
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12 pointer-events-auto"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-base shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 ${
                activeFilter === filter.id
                  ? 'text-primary-700 dark:text-primary-300 bg-primary-100/50 dark:bg-primary-900/40'
                  : 'text-secondary-700 dark:text-secondary-300 bg-white/50 dark:bg-dark-800/40'
              }`}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <div className={activeFilter === 'design' 
          ? 'grid gap-8 md:grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto items-stretch'
          : 'grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch'
        }>
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              {...getStaggeredDirectionalVariants(0.3, 0.2, 0.05)(index)}
              className="pointer-events-auto h-full"
            >
              <SpotlightGlow className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 card-hover flex flex-col h-full bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20">
                {/* Project Image */}
                <div className={`relative overflow-hidden ${project.category === 'design' ? 'h-64' : 'h-56'}`}>
                  <OptimizedImage
                    data={project.githubUrl !== '#' ? (project.seed || (project.title + '|' + project.description)) : project.image}
                    width={800}
                    height={project.category === 'design' ? 256 : 224}
                    alt={project.title}
                    className={`w-full h-full transition-transform duration-300 hover:scale-110 object-cover`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {project.featured && project.category !== 'design' && (
                    <>
                      <div className="absolute top-4 left-4 inline-flex items-center gap-1 text-primary-800 dark:text-primary-200 px-3 py-1 font-semibold text-sm bg-primary-100/90 dark:bg-primary-900/70 backdrop-blur-md rounded-full shadow-lg border border-white/50 dark:border-dark-700/60 ring-1 ring-white/60 dark:ring-white/25">
                        Featured
                      </div>
                    </>
                  )}
                  {project.category !== 'design' && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-secondary-700 dark:text-secondary-300 px-2 py-1 bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-full text-sm shadow-md border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15">
                      <span>⭐</span>
                      <span>{project.stars}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 flex gap-4">
                      {project.liveUrl && (
                        project.isCurrentWebsite ? (
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-700 dark:text-green-300">
                            <span className="text-xs font-medium">✓</span>
                          </div>
                        ) : (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-secondary-700 hover:text-primary-600 transition-colors duration-200"
                            aria-label={`View ${project.title} live site`}
                          >
                            <ExternalLink size={20} />
                          </a>
                        )
                      )}
                      {project.category !== 'design' && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-secondary-700 hover:text-primary-600 transition-colors duration-200"
                          aria-label={`View ${project.title} source code on GitHub`}
                        >
                          <Github size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-3">
                      {project.title}
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Bottom Section - Technologies, Date, and Buttons */}
                  <div className="mt-auto">
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 rounded-full text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Updated Date - Only show for non-design projects */}
                    {project.category !== 'design' && (
                      <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-4">
                        Updated: {formatDate(project.updatedAt)}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {project.liveUrl && (
                        project.isCurrentWebsite ? (
                          <div className="flex-1 inline-flex items-center justify-center gap-2 text-green-700 dark:text-green-300 px-4 py-2 font-medium text-base shadow-md bg-green-100/50 dark:bg-green-900/40 rounded-lg ring-1 ring-green-200 dark:ring-green-800">
                            <span className="text-sm">✓</span>
                            Currently Viewing
                          </div>
                        ) : (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 text-primary-700 dark:text-primary-300 px-4 py-2 font-medium text-base shadow-md pointer-events-auto cursor-pointer hover:shadow-lg hover:scale-[1.02] bg-primary-100/50 dark:bg-primary-900/40 rounded-lg transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20"
                          >
                            View Live
                          </a>
                        )
                      )}
                      {project.category !== 'design' && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 text-secondary-700 dark:text-secondary-300 px-4 py-2 font-medium text-base shadow-md pointer-events-auto cursor-pointer hover:shadow-lg hover:scale-[1.02] bg-white/50 dark:bg-dark-800/40 rounded-lg transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20"
                        >
                          View Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </SpotlightGlow>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CreativeWorks; 