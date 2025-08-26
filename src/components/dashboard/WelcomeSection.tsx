import { Button } from "@/components/ui/button";

interface WelcomeSectionProps {
  isDarkMode: boolean;
  suggestedPrompts: Array<{ text: string; color: string }>;
  setNewMessage: (message: string) => void;
}

const WelcomeSection = ({ isDarkMode, suggestedPrompts, setNewMessage }: WelcomeSectionProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
      <h1 className={`text-3xl font-bold font-serif ${isDarkMode ? 'text-white' : 'text-black'}`}>
        Welcome to Flow
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl">
        Get started by asking your agent to perform blockchain tasks. Not sure where to start?
      </p>
      
      {/* Suggested Prompts */}
      <div className="grid grid-cols-3 gap-3 max-w-xl">
        {suggestedPrompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            className={`h-auto p-4 flex flex-col items-center justify-center ${prompt.color} border-0 hover:scale-105 transition-transform`}
            onClick={() => setNewMessage(prompt.text)}
          >
            <span className="text-sm font-medium">{prompt.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeSection;
