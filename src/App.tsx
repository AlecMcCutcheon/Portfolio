import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import CreativeWorks from './components/CreativeWorks';
import Certifications from './components/Certifications';
import Resume from './components/Resume';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { BackgroundGradientAnimation } from './ui/background-gradient-animation';

const ENABLE_SECTION_GLASS_OVERLAYS = true;

const App: React.FC = () => {
  useEffect(() => {
    // Initialize EmailJS
    emailjs.init("05vg-yZOLtTcjt36N");
    
    // Set dark mode as default
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'dark');
    }
    
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 transition-colors duration-300">
      <Header />
      <main>
        {/* Shared gradient and glass overlay for Hero + About */}
        <div className="relative">
          <div className="absolute inset-0 z-0">
            <BackgroundGradientAnimation
              gradientBackgroundStart="rgb(226, 232, 240)"
              gradientBackgroundEnd="rgb(203, 213, 225)"
              firstColor="37, 99, 235"
              secondColor="126, 34, 206"
              thirdColor="6, 182, 212"
              fourthColor="190, 24, 93"
              fifthColor="21, 128, 61"
              pointerColor="37, 99, 235"
              size="70%"
              blendingValue="soft-light"
              interactive={false}
            />
          </div>
          <div className="relative z-10 pointer-events-none">
            {/* Hero Section */}
            <div className="relative" style={{ minHeight: '80vh' }}>
              {ENABLE_SECTION_GLASS_OVERLAYS && (
                <div className="absolute inset-0 z-0 pointer-events-none bg-gray-100/70 dark:bg-dark-900/70 backdrop-blur-lg" />
              )}
              <Hero />
            </div>
            {/* Glass transition section with About anchor in the middle */}
            <div className="relative h-16 md:h-40">
              <div id="about" style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 0 }} />
              {ENABLE_SECTION_GLASS_OVERLAYS && (
                <>
                  <div className="absolute inset-0 z-0 pointer-events-none h-full backdrop-blur-sm dark:hidden"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(243,244,246,0.70) 0%, rgba(255,255,255,0.70) 100%)'
                    }}
                  />
                  <div
                    className="absolute inset-0 z-0 pointer-events-none h-full backdrop-blur-sm hidden dark:block"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(15,23,42,0.7) 0%, rgba(22,32,50,0.7) 50%, rgba(30,41,59,0.7) 100%)'
                    }}
                  />
                </>
              )}
            </div>
            {/* About Section */}
            <div className="relative" style={{ minHeight: '80vh' }}>
              {ENABLE_SECTION_GLASS_OVERLAYS && (
                <div className="absolute inset-0 z-0 pointer-events-none bg-white/70 dark:bg-dark-800/70 backdrop-blur-lg" />
              )}
              <About />
            </div>
            {/* Creative Works Section (inside shared gradient wrapper) */}
            <div className="relative">
              {ENABLE_SECTION_GLASS_OVERLAYS && (
                <div className="absolute inset-0 z-0 pointer-events-none bg-white/70 dark:bg-dark-800/70 backdrop-blur-lg" />
              )}
              <CreativeWorks />
            </div>

            {/* Certifications Section (inside shared gradient wrapper) */}
            <div className="relative">
              {ENABLE_SECTION_GLASS_OVERLAYS && (
                <div className="absolute inset-0 z-0 pointer-events-none bg-white/70 dark:bg-dark-800/70 backdrop-blur-lg" />
              )}
              <Certifications />
            </div>

            {/* Removed transition: Certifications and Resume share identical overlay tint */}

            {/* Resume Section (inside shared gradient wrapper) */}
            <div className="relative">
              {ENABLE_SECTION_GLASS_OVERLAYS && (
                <div className="absolute inset-0 z-0 pointer-events-none bg-white/70 dark:bg-dark-800/70 backdrop-blur-lg" />
              )}
              <Resume />
            </div>

            {/* Contact + Footer Section (inside shared gradient wrapper) */}
            <div className="relative">
              {/* Contact with uniform (About/Certs) overlay tint */}
              <div className="relative">
                {ENABLE_SECTION_GLASS_OVERLAYS && (
                  <div className="absolute inset-0 z-0 pointer-events-none bg-white/70 dark:bg-dark-800/70 backdrop-blur-lg" />
                )}
                <div className="relative z-10 pointer-events-none">
                  <Contact />
                </div>
              </div>
              {/* Transition from Contact (lighter) to Footer (darker) */}
              <div className="relative h-16 md:h-40">
                {ENABLE_SECTION_GLASS_OVERLAYS && (
                  <>
                    <div
                      className="absolute inset-0 z-0 pointer-events-none h-full backdrop-blur-sm dark:hidden"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.70) 0%, rgba(226,232,240,0.75) 100%)',
                      }}
                    />
                    <div
                      className="absolute inset-0 z-0 pointer-events-none h-full backdrop-blur-sm hidden dark:block"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(31,41,55,0.70) 0%, rgba(15,23,42,0.84) 100%)',
                      }}
                    />
                  </>
                )}
              </div>
              {/* Footer with darker tint */}
              {/* Footer with darker tint */}
              <div className="relative">
                {ENABLE_SECTION_GLASS_OVERLAYS && (
                  <>
                    <div
                      className="absolute inset-0 z-0 pointer-events-none backdrop-blur-lg dark:hidden"
                      style={{ background: 'rgba(226,232,240,0.75)' }}
                    />
                    <div
                      className="absolute inset-0 z-0 pointer-events-none backdrop-blur-lg hidden dark:block"
                      style={{ background: 'rgba(15,23,42,0.84)' }}
                    />
                  </>
                )}
                <div className="relative z-10 pointer-events-none">
                  <Footer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App; 