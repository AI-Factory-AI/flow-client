import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  type: 'transaction' | 'credential' | 'payment';
  timestamp: Date;
}

interface RightPanelProps {
  isRightPanelCollapsed: boolean;
  setIsRightPanelCollapsed: (collapsed: boolean) => void;
  recentActivities: RecentActivity[];
  formatTime: (date: Date) => string;
}

const RightPanel = ({ 
  isRightPanelCollapsed, 
  setIsRightPanelCollapsed, 
  recentActivities, 
  formatTime 
}: RightPanelProps) => {
  if (!isRightPanelCollapsed) {
    return (
      <div className="w-80 bg-card border-l border-border p-4 transition-all duration-300 ease-in-out max-lg:hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Activities ({recentActivities.length})</h3>
          <Button
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted/50"
            onClick={() => setIsRightPanelCollapsed(true)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'payment' ? 'bg-green-500' :
                  activity.type === 'credential' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-16 bg-card border-l border-border p-4 transition-all duration-300 ease-in-out max-lg:hidden">
      <div className="flex flex-col items-center space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-muted/50"
          onClick={() => setIsRightPanelCollapsed(false)}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mb-2"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
