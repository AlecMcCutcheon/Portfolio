import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowUp } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 pointer-events-auto bg-transparent text-secondary-900 dark:text-white">
      <div className="container-max section-padding">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold gradient-text mb-3">
              Alec McCutcheon
            </h3>
            <p className="text-secondary-600 dark:text-secondary-300 mb-3">
              Adaptable technologist and automation-focused developer, blending problem-solving, design, and modern tooling to deliver practical, polished solutions.
            </p>
            <p className="text-secondary-500 dark:text-secondary-400 text-sm">
              Currently employed; open to select freelance work and remote opportunities.
            </p>
          </div>

          {/* Quick Links */}
          <div className="pointer-events-auto">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#home" 
                  className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-white transition-colors duration-200"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-white transition-colors duration-200"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#works" 
                  className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-white transition-colors duration-200"
                >
                  Works
                </a>
              </li>
              <li>
                <a 
                  href="#resume" 
                  className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-white transition-colors duration-200"
                >
                  Resume
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-white transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="pointer-events-auto">
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-secondary-600 dark:text-secondary-300">
              <p>
                <a href="mailto:alecraymccutcheon@gmail.com" className="hover:text-primary-600 dark:hover:text-white transition-colors duration-200">alecraymccutcheon@gmail.com</a>
              </p>
              <p>
                <a href="tel:+12072420526" className="hover:text-primary-600 dark:hover:text-white transition-colors duration-200">(207) 242-0526</a>
              </p>
              <p>
                <a href="http://maps.google.com/?q=Fairfield%2C%20Maine" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-white transition-colors duration-200">Fairfield, ME</a>
              </p>
            </div>
            <div className="mt-4">
              <h5 className="text-sm font-semibold mb-2">Follow Me</h5>
              <div className="flex gap-3 pointer-events-auto">
                <a 
                  href="https://linkedin.com/in/alecmccutcheon" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-white transition-colors duration-200"
                >
                  LinkedIn
                </a>
                <a 
                  href="https://github.com/AlecMcCutcheon" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-white transition-colors duration-200"
                >
                  GitHub
                </a>
                <a 
                  href="https://www.fiverr.com/share/2dlaPQ" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-white transition-colors duration-200"
                >
                  Fiverr
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-secondary-300 dark:border-dark-700/40 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-secondary-500 dark:text-secondary-400 text-sm mb-4 md:mb-0">
            © {currentYear} Alec McCutcheon. Made with{' '}
            <Heart className="inline w-4 h-4 text-red-500" />{' '}
            and lots of coffee.
          </p>
          
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 text-primary-700 dark:text-primary-300 bg-primary-100/50 dark:bg-primary-900/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 backdrop-blur-sm pointer-events-auto"
          >
            <ArrowUp size={20} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 