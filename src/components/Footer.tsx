import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Github, 
  Linkedin, 
  Mail, 
  Twitter, 
  Youtube,
  Baby,
  HeartPulse,
  Shield,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface FooterProps {
  onGetStarted?: () => void;
}

export default function Footer({ onGetStarted }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A16] text-[#A8A09A] border-t border-[#2A2A24]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            {/* Logo - Left */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <img
                src="/src/asset/icon.png"
                alt="NurtureAI Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="font-bold text-[#ffffff] text-xl sm:text-2xl tracking-tight whitespace-nowrap"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              NurtureAI
            </span>
          </div>
            <p className="text-sm text-[#8A8A7A] leading-relaxed max-w-xs">
              Understand your baby's needs through acoustic analysis. Built with love for sleepless nights.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-5">
              <a 
                href="https://github.com/Supreet37" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#2A2A24] hover:bg-[#33614A] flex items-center justify-center transition-all duration-300 group"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 text-[#8A8A7A] group-hover:text-white transition-colors" />
              </a>
              <a 
                href="https://www.linkedin.com/in/supreet-mohapatra" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#2A2A24] hover:bg-[#33614A] flex items-center justify-center transition-all duration-300 group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-[#8A8A7A] group-hover:text-white transition-colors" />
              </a>
              <a 
                href="https://x.com/cat_eye00" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#2A2A24] hover:bg-[#33614A] flex items-center justify-center transition-all duration-300 group"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 text-[#8A8A7A] group-hover:text-white transition-colors" />
              </a>
              <a 
                href="mailto:supreetmohapatra06@gmail.com"
                className="w-9 h-9 rounded-lg bg-[#2A2A24] hover:bg-[#33614A] flex items-center justify-center transition-all duration-300 group"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 text-[#8A8A7A] group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4 tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors duration-200">
                  How it works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors duration-200">
                  Features
                </a>
              </li>
              <li>
                <a href="#accuracy" className="hover:text-white transition-colors duration-200">
                  Accuracy
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors duration-200">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4 tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: CTA */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4 tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Get Started
            </h4>
            <p className="text-sm text-[#8A8A7A] leading-relaxed mb-4">
              Start understanding your baby's needs today.
            </p>
            {onGetStarted && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 bg-[#33614A] hover:bg-[#2A4F3D] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-[#33614A]/20"
              >
                Try Nurture Free
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
            
            {/* Trust badges */}
            <div className="flex items-center gap-4 mt-5">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#33614A]" />
                <span className="text-[10px] text-[#8A8A7A]">100% Private</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#33614A]" />
                <span className="text-[10px] text-[#8A8A7A]">AI Powered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#2A2A24] mt-12 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#6A6A5A]">
              <span>© {currentYear} Nurture. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                Made for parents everywhere
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}