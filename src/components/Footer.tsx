import React from 'react';
import { Github, Twitter, Mail, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-10 px-6 mt-16 bg-github-lightGray dark:bg-github-darkBlue border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5 text-github-gray dark:text-white" />
              <span className="text-lg font-bold text-github-gray dark:text-white">GitShine Hub</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Discover and explore GitHub repositories and tools to enhance your GitHub experience.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-github-blue dark:hover:text-white transition-colors" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-github-blue dark:hover:text-white transition-colors" />
              </a>
              <a href="mailto:contact@gitshinehub.com" aria-label="Email">
                <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-github-blue dark:hover:text-white transition-colors" />
              </a>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-github-gray dark:text-white uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-github-blue dark:hover:text-white transition-colors">Documentation</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-github-blue dark:hover:text-white transition-colors">Tutorials</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-github-blue dark:hover:text-white transition-colors">API Reference</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-github-blue dark:hover:text-white transition-colors">Status</a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-github-gray dark:text-white uppercase tracking-wider">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-github-blue dark:hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-github-blue dark:hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-github-blue dark:hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-github-blue dark:hover:text-white transition-colors">Contact</a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-github-gray dark:text-white uppercase tracking-wider">Stay Updated</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <div className="flex space-x-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-3 py-2 bg-white dark:bg-gray-800 text-sm rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-github-blue dark:focus:ring-blue-500 flex-1"
                aria-label="Email for newsletter"
              />
              <Button variant="default" size="sm" className="bg-github-blue hover:bg-blue-700">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-6 bg-gray-200 dark:bg-gray-800" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <span>&copy; {currentYear} GitShine Hub.</span>
            <span>All rights reserved.</span>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-current" />
            <span>by GitShine Team</span>
          </div>
          
          <div className="mt-4 md:mt-0">
            <a href="/sitemap.xml" className="text-xs text-gray-500 dark:text-gray-400 hover:text-github-blue dark:hover:text-white transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
