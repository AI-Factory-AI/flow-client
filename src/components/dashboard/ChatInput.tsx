import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Mic, FileText } from "lucide-react";

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  isProcessing: boolean;
}

const ChatInput = ({ newMessage, setNewMessage, sendMessage, isProcessing }: ChatInputProps) => {
  return (
    <div className="border-t border-border p-2 md:p-4 bg-card">
      <div className="max-w-2xl mx-auto w-full">
        <div className="relative">
          <Input
            placeholder="Ask your agent anything..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="w-full pr-20 md:pr-24 h-10 md:h-12 text-sm md:text-base"
            disabled={isProcessing}
          />
          
          {/* Action Icons Inside Input */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 md:h-8 md:w-8 p-0 hover:bg-muted/50 max-sm:hidden">
              <Paperclip className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 md:h-8 md:w-8 p-0 hover:bg-muted/50 max-sm:hidden">
              <Mic className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 md:h-8 md:w-8 p-0 hover:bg-muted/50 max-sm:hidden">
              <FileText className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || isProcessing}
              className="h-6 w-6 md:h-8 md:w-8 p-0 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-3 h-3 md:w-4 md:h-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Character Count and Disclaimer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 md:mt-3 space-y-1 sm:space-y-0">
          <span className="text-xs text-muted-foreground">
            {newMessage.length}/3,000
          </span>
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Flow Agent may generate inaccurate information about blockchain transactions, addresses, or facts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
