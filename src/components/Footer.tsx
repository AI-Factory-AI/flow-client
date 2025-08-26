import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Twitter, 
  Github, 
  MessageCircle, 
  Globe, 
  Mail, 
  ArrowRight,
  Bot,
  Shield,
  Zap,
  Users
} from "lucide-react";

const Footer = () => {
  return (
         <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
                             <span className="text-xl font-bold">Flow</span>
            </div>
                         <p className="text-gray-300 text-sm leading-relaxed">
               Your decentralized AI agents powered by Flow. Create, manage, and coordinate with AI assistants for the future of web3.
             </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <Globe className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">AI Chat</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Identity Management</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Payment Processing</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Credential Verification</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Agent Creation</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Developer Tools</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>© 2024 Flow. All rights reserved.</span>
              <span>•</span>
              <span>Built with for the blockchain community</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
