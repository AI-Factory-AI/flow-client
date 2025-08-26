const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="flex items-start space-x-2 max-w-[85%] md:max-w-[70%]">
        <div className="space-y-2">
          <div className="rounded-2xl px-4 py-3 bg-muted">
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
