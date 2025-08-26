import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, X } from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  pendingAction?: {
    type: string;
    description: string;
    ensName?: string;
    cost?: string;
    [key: string]: any;
  };
  actions?: {
    type: 'transaction' | 'update' | 'confirmation' | 'ens_operation';
    description: string;
    txHash?: string;
    status: 'pending' | 'completed' | 'failed';
  }[];
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  handleActionConfirm: (action: any, messageId: string) => void;
  handleActionReject: (messageId: string) => void;
  formatTime: (date: Date) => string;
}

const ChatMessages = ({ 
  messages, 
  handleActionConfirm, 
  handleActionReject, 
  formatTime 
}: ChatMessagesProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-[85%] md:max-w-[70%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className="space-y-2">
                <div className="rounded-2xl px-4 py-3 bg-muted">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                {message.actions && message.actions.map((action, index) => (
                  <div key={index} className="bg-card border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{action.description}</span>
                      <Badge variant={action.status === 'completed' ? 'default' : action.status === 'pending' ? 'secondary' : 'destructive'} className="text-xs" >
                        {action.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {action.status}
                      </Badge>
                    </div>
                    
                    {/* Show confirmation symbols for pending actions */}
                    {action.status === 'pending' && message.pendingAction && (
                      <div className="flex items-center space-x-4 pt-3">
                        <div 
                          onClick={() => handleActionConfirm(message.pendingAction, message.id)}
                          className="cursor-pointer hover:scale-110 transition-transform select-none"
                          title="Confirm Action"
                        >
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div 
                          onClick={() => handleActionReject(message.id)}
                          className="cursor-pointer hover:scale-110 transition-transform select-none"
                          title="Cancel Action"
                        >
                          <X className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                    )}
                    
                    {action.txHash && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Tx: {action.txHash.slice(0, 10)}...{action.txHash.slice(-8)}</span>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-primary">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatMessages;
