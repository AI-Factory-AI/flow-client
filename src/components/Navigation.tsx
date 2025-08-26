import { Button } from "@/components/ui/button";
import { Wallet, Menu, Bot, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useFlowWeb3 } from "../web3";

const Navigation = () => {
  const location = useLocation();
  const { isConnected, account, connectWallet, disconnectWallet } = useFlowWeb3();

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full gradient-ens"></div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Flow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#explore" className="text-muted-foreground hover:text-foreground transition-smooth">
              Explore Agents
            </a>
            <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-smooth">
              How It Works
            </a>
            <Link to="/chat" className="text-muted-foreground hover:text-foreground transition-smooth flex items-center space-x-1">
              <Bot className="w-4 h-4" />
              <span>AI Chat</span>
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            {/* Wallet Status */}
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={disconnectWallet}
                >
                  <User className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={connectWallet}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
            
            <Link to="/onboarding">
              <Button variant="hero" size="sm">
                Activate Agent
              </Button>
            </Link>
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;