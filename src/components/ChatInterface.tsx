import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useFlowWeb3 } from "../web3";
import { 
  createENSManager,
  createChatMessageHandler,
  createUserProfileManager,
  BlockchainUtils,
  ChatMessage,
  MessageContext
} from "../web3";

import Transactions from "./pages/Transactions";
import Identity from "./pages/Identity";
import NewAgent from "./pages/NewAgent";
import Credentials from "./pages/Credentials";
import SettingsPage from "./pages/Settings";

// Dashboard Components
import Sidebar from "./dashboard/Sidebar";
import Header from "./dashboard/Header";
import WelcomeSection from "./dashboard/WelcomeSection";
import ChatMessages from "./dashboard/ChatMessages";
import ChatInput from "./dashboard/ChatInput";
import RightPanel from "./dashboard/RightPanel";
import TypingIndicator from "./dashboard/TypingIndicator";

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  type: 'transaction' | 'credential' | 'payment';
  timestamp: Date;
}

const ChatInterface = () => {
  const [searchParams] = useSearchParams();
  const agentName = searchParams.get('agent');
  const agentEns = searchParams.get('ens');
  const agentRole = searchParams.get('role');

  // Web3 integration
  const { 
    isConnected, 
    account, 
    network, 
    llmService, 
    executeFlowAction,
    flowContracts,
    switchNetwork
  } = useFlowWeb3();

  // Get chainId from network object
  const chainId = network?.chainId;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      title: 'Payment to kwame.agent.eth',
      description: 'Successfully sent 5 USDC to kwame.agent.eth',
      type: 'payment',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Credential verification',
      description: 'Checked ama.agent.eth credentials',
      type: 'credential',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Flow record update',
      description: 'Updated payment preferences',
      type: 'transaction',
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
    },
  ]);

  // Initialize managers
  const [ensManager, setEnsManager] = useState<any>(null);
  const [chatMessageHandler, setChatMessageHandler] = useState<any>(null);
  const [userProfileManager, setUserProfileManager] = useState<any>(null);

  // Initialize managers when contracts are available
  useEffect(() => {
    if (flowContracts?.flowENSIntegration && flowContracts.provider) {
      const ens = createENSManager(flowContracts.flowENSIntegration, flowContracts.provider);
      const chat = createChatMessageHandler(ens, llmService, flowContracts, executeFlowAction);
      const profile = createUserProfileManager(ens);
      
      setEnsManager(ens);
      setChatMessageHandler(chat);
      setUserProfileManager(profile);
    }
  }, [flowContracts, llmService, executeFlowAction]);

  // Initialize messages based on whether we're chatting with a specific agent
  useEffect(() => {
    if (agentName && agentEns && agentRole) {
      // Agent-specific conversation
      setMessages([
        {
          id: '1',
          content: `Hello! I'm ${agentName} (${agentEns}). I'm your ${agentRole.toLowerCase()} and I'm here to help you with specialized services. How can I assist you today?`,
          sender: 'ai',
          timestamp: new Date(),
        }
      ]);
    } else {
      // Default Flow AI Agent conversation - no initial messages
      setMessages([]);
    }
  }, [agentName, agentEns, agentRole]);

  // Auto-detect user's ENS profile when wallet connects
  useEffect(() => {
    const detectUserENS = async () => {
      if (isConnected && account && userProfileManager) {
        try {
          const userProfile = await userProfileManager.detectUserENSProfile(account);
          
          if (userProfile) {
            // Update the welcome message to show user's profile
            const welcomeMessage = userProfileManager.generateWelcomeMessage(userProfile, account);
            setMessages([
              {
                id: '1',
                content: welcomeMessage,
                sender: 'ai',
                timestamp: new Date(),
              }
            ]);
          } else {
            // If no ENS found, show a helpful message
            const welcomeMessage = userProfileManager.generateWelcomeMessage(null, account);
            setMessages([
              {
                id: '1',
                content: welcomeMessage,
                sender: 'ai',
                timestamp: new Date(),
              }
            ]);
          }
        } catch (error) {
          console.error('Error detecting user ENS profile:', error);
        }
      }
    };

    detectUserENS();
  }, [isConnected, account, userProfileManager]);

  const [newMessage, setNewMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState<'chat' | 'transactions' | 'identity' | 'newAgent' | 'credentials' | 'settings'>('chat');

  // Initialize theme on component mount and listen for theme changes
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    // Listen for theme changes from other components
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || isProcessing || !chatMessageHandler) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsProcessing(true);

    try {
      const context: MessageContext = {
        network: network?.name || 'Local Anvil',
        userAddress: account || '',
        isConnected,
        agentName,
        agentRole
      };

      const aiResponse = await chatMessageHandler.processMessage(newMessage, context);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Error response
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        sender: 'ai',
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle action confirmation
  const handleActionConfirm = async (action: any, messageId: string) => {
    if (!isConnected || !chatMessageHandler) {
      console.log('Action confirmation failed: not connected or no chat handler');
      return;
    }

    console.log('Confirming action:', action);
    console.log('Current network:', network);
    
    // Check if we're on the right network for ENS operations
    if (action.type?.startsWith('ens_') && network?.chainId !== 11155111) {
      console.error('Wrong network for ENS operations. Current:', network?.chainId, 'Expected: 11155111');
      alert('Please switch to Ethereum Sepolia testnet to use ENS operations');
      return;
    }

    try {
      const executionResult = await chatMessageHandler.executeAction(action, account || '');
      
      // Update the message to show completion
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return chatMessageHandler.updateMessageForCompletion(msg, executionResult, chainId);
        }
        return msg;
      }));
    } catch (error) {
      console.error('Action execution failed:', error);
      
      // Update the message to show error
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return chatMessageHandler.updateMessageForError(msg, error, action.type);
        }
        return msg;
      }));
    }
  };

  // Handle action rejection
  const handleActionReject = (messageId: string) => {
    if (!chatMessageHandler) return;

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return chatMessageHandler.updateMessageForCancellation(msg);
      }
      return msg;
    }));
  };

  // Get suggested prompts based on user profile
  const getSuggestedPrompts = () => {
    if (!userProfileManager) {
      return [
        { text: "Setup my ENS profile", color: "bg-purple-100 text-purple-800" },
        { text: "Get text records: kwame.agent.eth", color: "bg-indigo-100 text-indigo-800" },
        { text: "Create agent ENS: kwame.agent.eth", color: "bg-blue-100 text-blue-800" },
        { text: "Check ENS availability: flow.agent.eth", color: "bg-yellow-100 text-yellow-800" },
        { text: "Create Multi-Signature Wallet", color: "bg-green-100 text-green-800" },
        { text: "Update my agent profile", color: "bg-emerald-100 text-emerald-800" },
      ];
    }

    // This would need to be implemented with actual user profile data
    // For now, return default prompts
    return [
      { text: "Setup my ENS profile", color: "bg-purple-100 text-purple-800" },
      { text: "Get text records: kwame.agent.eth", color: "bg-indigo-100 text-indigo-800" },
      { text: "Create agent ENS: kwame.agent.eth", color: "bg-blue-100 text-blue-800" },
      { text: "Check ENS availability: flow.agent.eth", color: "bg-yellow-100 text-yellow-800" },
      { text: "Create Multi-Signature Wallet", color: "bg-green-100 text-green-800" },
      { text: "Update my agent profile", color: "bg-emerald-100 text-emerald-800" },
    ];
  };

  const suggestedPrompts = getSuggestedPrompts();

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <Sidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isConnected={isConnected}
        account={account}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          agentName={agentName}
          agentEns={agentEns}
          agentRole={agentRole}
          currentPage={currentPage}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
        
        {/* Page Content */}
        {currentPage === 'chat' && (
          <>
            {/* Welcome Section */}
            {messages.length === 0 && (
              <WelcomeSection
                isDarkMode={isDarkMode}
                suggestedPrompts={suggestedPrompts}
                setNewMessage={setNewMessage}
              />
            )}

            {/* Chat Messages */}
            <ChatMessages
              messages={messages}
              handleActionConfirm={handleActionConfirm}
              handleActionReject={handleActionReject}
              formatTime={formatTime}
            />

            {/* AI Typing Indicator */}
            {isProcessing && <TypingIndicator />}

            {/* Chat Input */}
            {currentPage === 'chat' && (
              <ChatInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                sendMessage={sendMessage}
                isProcessing={isProcessing}
              />
            )}
          </>
        )}

        {/* Other Pages */}
        {currentPage === 'transactions' && (
          <div className="flex-1 overflow-hidden">
            <Transactions />
          </div>
        )}
        {currentPage === 'identity' && (
          <div className="flex-1 overflow-hidden">
            <Identity />
          </div>
        )}
        {currentPage === 'newAgent' && (
          <div className="flex-1 overflow-hidden">
            <NewAgent />
          </div>
        )}
        {currentPage === 'credentials' && (
          <div className="flex-1 overflow-hidden">
            <Credentials />
          </div>
        )}
        {currentPage === 'settings' && (
          <div className="flex-1 overflow-hidden">
            <SettingsPage />
          </div>
        )}
      </div>
      
      {/* Right Panel */}
      <RightPanel
        isRightPanelCollapsed={isRightPanelCollapsed}
        setIsRightPanelCollapsed={setIsRightPanelCollapsed}
        recentActivities={recentActivities}
        formatTime={formatTime}
      />
    </div>
  );
};

export default ChatInterface;