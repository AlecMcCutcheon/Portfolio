import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, Phone, MapPin, Send, Linkedin, Github, ExternalLink } from 'lucide-react';
import emailjs from '@emailjs/browser';
import SpotlightGlow from '../ui/SpotlightGlow';

const Contact: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px 0px'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Send email using EmailJS
      await emailjs.send("Portfolio_send", "template_9amdiuw", {
        title: formData.subject,
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Show success message
      setShowSuccess(true);
      setShowError(false);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Email send failed:', error);
      setShowError(true);
      setShowSuccess(false);
      // Hide error message after 5 seconds
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      value: "alecraymccutcheon@gmail.com",
      link: "mailto:alecraymccutcheon@gmail.com"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      value: "(207) 242-0526",
      link: "tel:+12072420526"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Location",
      value: "Fairfield, ME",
      link: "http://maps.google.com/?q=Fairfield%2C%20Maine"
    }
  ];

  const socialLinks = [
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/alecmccutcheon",
      icon: <Linkedin className="w-5 h-5" />
    },
    {
      name: "GitHub",
      url: "https://github.com/AlecMcCutcheon",
      icon: <Github className="w-5 h-5" />
    },
    {
      name: "Fiverr",
      url: "https://www.fiverr.com/share/2dlaPQ",
      icon: <ExternalLink className="w-5 h-5" />
    }
  ];

  return (
    <section id="contact" className="section-padding relative z-10 pointer-events-none bg-transparent">
      <div className="container-max">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          {/* Section header */}
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <SpotlightGlow className="bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 dark:border-dark-700/40 transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45 hover:ring-white/50 dark:hover:ring-white/20">
              <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-4">Get In Touch</h2>
              <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">I'm always open to discussing new opportunities, creative projects, or just having a chat about technology and innovation.</p>
            </SpotlightGlow>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-8">
              Let's Connect
            </h3>
            
            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  className="flex items-center gap-4"
                >
                  <SpotlightGlow className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/60 dark:bg-dark-800/50 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 text-primary-600 dark:text-primary-400 shadow-md">
                    {info.icon}
                  </SpotlightGlow>
                  <div>
                    <h4 className="font-semibold text-secondary-900 dark:text-white mb-1">
                      {info.title}
                    </h4>
                    <a
                      href={info.link}
                      className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 pointer-events-auto"
                    >
                      {info.value}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Follow Me
              </h4>
              <div className="flex gap-4 pointer-events-auto">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-secondary-600 dark:text-secondary-400 transition-all duration-200 bg-white/60 dark:bg-dark-800/50 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 shadow-md hover:scale-[1.05] hover:shadow-lg hover:ring-white/60 dark:hover:ring-white/30 hover:bg-white/70 dark:hover:bg-dark-800/60"
                    aria-label={`Connect with me on ${social.name}`}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="mt-8 pointer-events-auto"
            >
              <SpotlightGlow className="p-6 rounded-lg bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 shadow-lg hover:shadow-xl transition-all duration-300">
                <h4 className="font-semibold text-secondary-900 dark:text-white mb-3">
                  Availability
                </h4>
                <p className="text-secondary-600 dark:text-secondary-300 mb-2">
                  Currently employed; open to exploring freelance engagements and selectively pivoting into better opportunities.
                </p>
                <p className="mb-2">
                  <span className="font-semibold text-primary-700 dark:text-primary-300">Preference:</span>
                  <span className="ml-1 text-secondary-600 dark:text-secondary-300">Remote or flexible hybrid (e.g., ~1 day/week or as-needed).</span>
                </p>
                <p>
                  <span className="font-semibold text-primary-700 dark:text-primary-300">Response time:</span>
                  <span className="ml-1 text-secondary-600 dark:text-secondary-300">1–3 business days</span>
                </p>
              </SpotlightGlow>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6 pointer-events-auto">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-white/30 dark:border-dark-700/40 bg-white/80 dark:bg-dark-800/60 backdrop-blur-sm text-secondary-900 dark:text-white rounded-lg ring-1 ring-white/40 dark:ring-white/15 shadow-md hover:shadow-lg hover:ring-white/50 focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:shadow-lg transition-all duration-200"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-white/30 dark:border-dark-700/40 bg-white/80 dark:bg-dark-800/60 backdrop-blur-sm text-secondary-900 dark:text-white rounded-lg ring-1 ring-white/40 dark:ring-white/15 shadow-md hover:shadow-lg hover:ring-white/50 focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:shadow-lg transition-all duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-white/30 dark:border-dark-700/40 bg-white/80 dark:bg-dark-800/60 backdrop-blur-sm text-secondary-900 dark:text-white rounded-lg ring-1 ring-white/40 dark:ring-white/15 shadow-md hover:shadow-lg hover:ring-white/50 focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:shadow-lg transition-all duration-200"
                  placeholder="What's this about?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-white/30 dark:border-dark-700/40 bg-white/80 dark:bg-dark-800/60 backdrop-blur-sm text-secondary-900 dark:text-white rounded-lg ring-1 ring-white/40 dark:ring-white/15 shadow-md hover:shadow-lg hover:ring-white/50 focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:shadow-lg transition-all duration-200 resize-none"
                  placeholder="Tell me about your project or opportunity..."
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 text-primary-700 dark:text-primary-300 px-6 py-3 font-medium text-base shadow-md pointer-events-auto cursor-pointer hover:shadow-lg hover:scale-[1.02] bg-primary-100/50 dark:bg-primary-900/40 rounded-lg transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </button>
            </form>

            {/* Success Message */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    Thank you for your message! I will get back to you soon.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {showError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-red-800 dark:text-red-200 font-medium">
                    Sorry, there was an error sending your message. Please try again.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact; 