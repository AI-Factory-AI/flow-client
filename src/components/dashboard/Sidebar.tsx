import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, CheckCircle, Settings, PanelLeftClose, PanelLeftOpen, Bot, FileText, User } from "lucide-react";

interface SidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  currentPage: 'chat' | 'transactions' | 'identity' | 'newAgent' | 'credentials' | 'settings';
  setCurrentPage: (page: 'chat' | 'transactions' | 'identity' | 'newAgent' | 'credentials' | 'settings') => void;
  isConnected: boolean;
  account: string | null;
}

const Sidebar = ({ 
  isSidebarCollapsed, 
  setIsSidebarCollapsed, 
  currentPage, 
  setCurrentPage, 
  isConnected, 
  account 
}: SidebarProps) => {
  return (
    <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out max-md:hidden`}>
      {/* Header with Logo and Collapse Button */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 relative group cursor-pointer"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <PanelLeftOpen className="w-4 h-4 text-white" />
                </div>
              ) : (
                <span className="text-white font-bold text-lg">E</span>
              )}
            </div>
          </div>
          {!isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="h-8 w-8 p-0 hover:bg-muted/50"
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          {!isSidebarCollapsed ? (
            <>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search"
                className="pl-10 bg-muted/50"
              />
            </>
          ) : (
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 mx-auto hover:bg-muted/50">
              <Search className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        <Button 
          variant="ghost" 
          className={`${isSidebarCollapsed ? 'w-8 h-8 p-0 mx-auto' : 'w-full'} justify-start hover:bg-muted/50`}
          onClick={() => setCurrentPage('chat')}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!isSidebarCollapsed ? 'mr-3' : ''} ${currentPage === 'chat' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Bot className="w-4 h-4" />
          </div>
          {!isSidebarCollapsed && <span>AI Chat</span>}
        </Button>
        <Button 
          variant="ghost" 
          className={`${isSidebarCollapsed ? 'w-8 h-8 p-0 mx-auto' : 'w-full'} justify-start hover:bg-muted/50`}
          onClick={() => setCurrentPage('transactions')}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!isSidebarCollapsed ? 'mr-3' : ''} ${currentPage === 'transactions' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <FileText className="w-4 h-4" />
          </div>
          {!isSidebarCollapsed && <span>Transactions</span>}
        </Button>
        <Button 
          variant="ghost" 
          className={`${isSidebarCollapsed ? 'w-8 h-8 p-0 mx-auto' : 'w-full'} justify-start hover:bg-muted/50`}
          onClick={() => setCurrentPage('identity')}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!isSidebarCollapsed ? 'mr-3' : ''} ${currentPage === 'identity' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <User className="w-4 h-4" />
          </div>
          {!isSidebarCollapsed && <span>Identity</span>}
        </Button>
        <Button 
          variant="ghost" 
          className={`${isSidebarCollapsed ? 'w-8 h-8 p-0 mx-auto' : 'w-full'} justify-start hover:bg-muted/50`}
          onClick={() => setCurrentPage('newAgent')}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!isSidebarCollapsed ? 'mr-3' : ''} ${currentPage === 'newAgent' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Plus className="w-4 h-4" />
          </div>
          {!isSidebarCollapsed && <span>New Agent</span>}
        </Button>
        <Button 
          variant="ghost" 
          className={`${isSidebarCollapsed ? 'w-8 h-8 p-0 mx-auto' : 'w-full'} justify-start hover:bg-muted/50`}
          onClick={() => setCurrentPage('credentials')}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!isSidebarCollapsed ? 'mr-3' : ''} ${currentPage === 'credentials' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <CheckCircle className="w-4 h-4" />
          </div>
          {!isSidebarCollapsed && <span>Credentials</span>}
        </Button>
        <Button 
          variant="ghost" 
          className={`${isSidebarCollapsed ? 'w-8 h-8 p-0 mx-auto' : 'w-full'} justify-start hover:bg-muted/50`}
          onClick={() => setCurrentPage('settings')}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!isSidebarCollapsed ? 'mr-3' : ''} ${currentPage === 'settings' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Settings className="w-4 h-4" />
          </div>
          {!isSidebarCollapsed && <span>Settings</span>}
        </Button>
      </nav>

      {/* User Profile */}
      <div className="p-2 md:p-4 bg-card">
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src="/api/placeholder/32/32" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {isConnected && account ? account.slice(2, 3).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>

          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {isConnected && account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'alex.agent.eth'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {isConnected ? 'Wallet Connected' : 'alex@example.com'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
