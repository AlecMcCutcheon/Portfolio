import React, { useEffect, Suspense, lazy } from 'react';
import emailjs from '@emailjs/browser';
import Header from './components/Header';
import Hero from './components/Hero';
import { BackgroundGradientAnimation } from './ui/background-gradient-animation';
import SectionDivider from './ui/SectionDivider';
import { useMobileDetection } from './hooks/useMobileDetection';
import { ScrollDirectionProvider } from './contexts/ScrollDirectionContext';

// Lazy load components for better performance
const About = lazy(() => import('./components/About'));
const CreativeWorks = lazy(() => import('./components/CreativeWorks'));
const Certifications = lazy(() => import('./components/Certifications'));
const Resume = lazy(() => import('./components/Resume'));
const Contact = lazy(() => import('./components/Contact'));
const Footer = lazy(() => import('./components/Footer'));

const ENABLE_SECTION_GLASS_OVERLAYS = true;

const App: React.FC = () => {
  const { shouldReduceEffects } = useMobileDetection();
  
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
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            // Service worker registered successfully
          })
          .catch((registrationError) => {
            // Service worker registration failed silently
          });
      });
    }
  }, []);

  // Helper function to get glass overlay classes
  const getGlassOverlayClasses = (baseClasses: string) => {
    return shouldReduceEffects 
      ? baseClasses.replace(/backdrop-blur-\w+/g, '').trim()
      : baseClasses;
  };

  return (
    <ScrollDirectionProvider>
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
              {ENABLE_SECTION_GLASS_OVERLAYS && !shouldReduceEffects && (
                <div className="absolute inset-0 z-0 pointer-events-none bg-gray-100/70 dark:bg-dark-900/70 backdrop-blur-lg" />
              )}
              {ENABLE_SECTION_GLASS_OVERLAYS && shouldReduceEffects && (
                <div className="absolute inset-0 z-0 pointer-events-none bg-gray-100/80 dark:bg-dark-900/80" />
              )}
              <Hero />
            </div>
            {/* Glass transition section */}
            <div className="relative h-16 md:h-40">
              {ENABLE_SECTION_GLASS_OVERLAYS && (
                <>
                  <div className={`absolute inset-0 z-0 pointer-events-none h-full ${shouldReduceEffects ? '' : 'backdrop-blur-sm'} dark:hidden`}
                    style={{
                      background: 'linear-gradient(to bottom, rgba(243,244,246,0.70) 0%, rgba(255,255,255,0.80) 100%)'
                    }}
                  />
                  <div
                    className={`absolute inset-0 z-0 pointer-events-none h-full ${shouldReduceEffects ? '' : 'backdrop-blur-sm'} hidden dark:block`}
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
                <div className={`absolute inset-0 z-0 pointer-events-none bg-white/80 dark:bg-dark-800/70 ${getGlassOverlayClasses('backdrop-blur-lg')}`} />
              )}
              <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="animate-pulse text-gray-500">Loading...</div></div>}>
                <About />
              </Suspense>
            </div>
            {/* Creative Works Section (inside shared gradient wrapper) */}
            <div className="relative">
              {ENABLE_SECTION_GLASS_OVERLAYS && (
                <div className={`absolute inset-0 z-0 pointer-events-none bg-white/80 dark:bg-dark-800/70 ${getGlassOverlayClasses('backdrop-blur-lg')}`} />
              )}
              <div className="relative z-10 pointer-events-none">
                {/* Divider between About and Creative Works */}
                <SectionDivider />
                <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="animate-pulse text-gray-500">Loading...</div></div>}>
                  <CreativeWorks />
                </Suspense>
              </div>
            </div>

            {/* Certifications Section (inside shared gradient wrapper) */}
            <div className="relative">
              {ENABLE_SECTION_GLASS_OVERLAYS && (
                <div className={`absolute inset-0 z-0 pointer-events-none bg-white/80 dark:bg-dark-800/70 ${getGlassOverlayClasses('backdrop-blur-lg')}`} />
              )}
              <div className="relative z-10 pointer-events-none">
                {/* Divider between Creative Works and Certifications */}
                <SectionDivider />
                <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="animate-pulse text-gray-500">Loading...</div></div>}>
                  <Certifications />
                </Suspense>
              </div>
            </div>

            {/* Divider between Certifications and Resume (sits at top of Resume) */}

            {/* Resume Section (inside shared gradient wrapper) */}
            <div className="relative">
              {ENABLE_SECTION_GLASS_OVERLAYS && (
                <div className={`absolute inset-0 z-0 pointer-events-none bg-white/80 dark:bg-dark-800/70 ${getGlassOverlayClasses('backdrop-blur-lg')}`} />
              )}
              <div className="relative z-10 pointer-events-none">
                {/* Divider between Certifications and Resume */}
                <SectionDivider />
                <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="animate-pulse text-gray-500">Loading...</div></div>}>
                  <Resume />
                </Suspense>
              </div>
            </div>

            {/* Themed divider rendered inside the next section (no overlay gap) */}

            {/* Contact + Footer Section (inside shared gradient wrapper) */}
            <div className="relative">
              {/* Contact with uniform (About/Certs) overlay tint */}
              <div className="relative">
                {ENABLE_SECTION_GLASS_OVERLAYS && (
                  <div className={`absolute inset-0 z-0 pointer-events-none bg-white/80 dark:bg-dark-800/70 ${getGlassOverlayClasses('backdrop-blur-lg')}`} />
                )}
                <div className="relative z-10 pointer-events-none">
                  {/* Inline themed divider at the top of Get In Touch (inside overlay) */}
                  <SectionDivider />
                  <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="animate-pulse text-gray-500">Loading...</div></div>}>
                    <Contact />
                  </Suspense>
                </div>
              </div>
              {/* Transition from Contact (lighter) to Footer (darker) */}
              <div className="relative h-16 md:h-40">
                {ENABLE_SECTION_GLASS_OVERLAYS && (
                  <>
                    <div
                      className={`absolute inset-0 z-0 pointer-events-none h-full ${getGlassOverlayClasses('backdrop-blur-sm')} dark:hidden`}
                      style={{
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.80) 0%, rgba(226,232,240,0.75) 100%)',
                      }}
                    />
                    <div
                      className={`absolute inset-0 z-0 pointer-events-none h-full ${getGlassOverlayClasses('backdrop-blur-sm')} hidden dark:block`}
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
                      className={`absolute inset-0 z-0 pointer-events-none ${getGlassOverlayClasses('backdrop-blur-lg')} dark:hidden`}
                      style={{ background: 'rgba(226,232,240,0.75)' }}
                    />
                    <div
                      className={`absolute inset-0 z-0 pointer-events-none ${getGlassOverlayClasses('backdrop-blur-lg')} hidden dark:block`}
                      style={{ background: 'rgba(15,23,42,0.84)' }}
                    />
                  </>
                )}
                <div className="relative z-10 pointer-events-none">
                  <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center"><div className="animate-pulse text-gray-500">Loading...</div></div>}>
                    <Footer />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </ScrollDirectionProvider>
  );
};

export default App; 