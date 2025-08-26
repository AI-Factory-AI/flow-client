import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Menu } from "lucide-react";

interface HeaderProps {
  agentName: string | null;
  agentEns: string | null;
  agentRole: string | null;
  currentPage: string;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const Header = ({ 
  agentName, 
  agentEns, 
  agentRole, 
  currentPage, 
  isSidebarCollapsed, 
  setIsSidebarCollapsed 
}: HeaderProps) => {
  return (
    <>
      {/* Mobile Header with Menu Button */}
      <div className="md:hidden border-b border-border px-4 py-3 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="h-8 w-8 p-0 hover:bg-muted/50"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div>
              <h3 className="font-semibold text-sm">
                {agentName || "AI Agent"}
              </h3>
              {agentEns && (
                <p className="text-xs text-muted-foreground font-mono">{agentEns}</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="border-primary text-primary text-xs">
            <Bot className="w-3 h-3 mr-1" />
            {agentRole || "AI Agent"}
          </Badge>
        </div>
      </div>

      {/* Dynamic Header */}
      {currentPage === 'chat' && (
        <div className="border-b border-border px-4 py-4 bg-card max-md:hidden">
          <div className="flex items-center pb-2 space-x-3">
            <div className="flex-1">
              <h3 className="font-semibold">
                {agentName || "AI Agent"}
              </h3>
              {agentEns && (
                <p className="text-sm text-muted-foreground font-mono">{agentEns}</p>
              )}
            </div>
            <Badge variant="outline" className="border-primary text-primary">
              <Bot className="w-3 h-3 mr-1" />
              {agentRole || "AI Agent"}
            </Badge>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
