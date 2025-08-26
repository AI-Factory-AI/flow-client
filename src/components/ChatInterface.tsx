import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useFlowWeb3 } from "../web3";
import { ethers } from "ethers";

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
      if (isConnected && account && flowContracts?.flowENSIntegration) {
        try {
          console.log('Detecting user ENS profile for address:', account);
          
          // Check if the user owns any .agent.eth names
          // We'll try to find names that might be owned by the user
          const possibleNames = [
            'kwame.agent.eth', // Your specific ENS name
            'flow.agent.eth',
            'agent.eth'
          ];
          
          let foundENS = false;
          
          for (const ensName of possibleNames) {
            try {
              const isOwned = await flowContracts.flowENSIntegration.isENSNameOwnedBy(ensName, account);
              if (isOwned) {
                console.log('User owns ENS name:', ensName);
                foundENS = true;
                
                // Get the user's ENS profile
                const userProfile = await getUserENSProfile(ensName);
                
                // Update the welcome message to show user's profile
                if (userProfile) {
                  setMessages([
                    {
                      id: '1',
                      content: `Welcome back! 🎉\n\n**Your ENS Profile:**\n🌐 **Name:** ${ensName}\n📍 **Address:** ${account}\n📝 **Description:** ${userProfile.description || 'No description set'}\n🔗 **Website:** ${userProfile.url || 'No website set'}\n📧 **Email:** ${userProfile.email || 'No email set'}\n\nHow can I help you today?`,
                      sender: 'ai',
                      timestamp: new Date(),
                    }
                  ]);
                }
                break;
              }
            } catch (error) {
              console.log(`Error checking ownership of ${ensName}:`, error);
            }
          }
          
          // If no ENS found, show a helpful message
          if (!foundENS) {
            setMessages([
              {
                id: '1',
                content: `Welcome! 👋\n\nI notice you don't have an ENS name yet. Would you like me to help you:\n\n• Create a new ENS name (e.g., kwame.agent.eth)\n• Set up your profile with text records\n• Learn more about ENS integration\n\nJust let me know what you'd like to do!`,
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
  }, [isConnected, account, flowContracts]);

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
    if (!newMessage.trim() || isProcessing) return;

    console.log('Sending message:', newMessage);
    console.log('LLM Service available:', !!llmService);
    console.log('Wallet connected:', isConnected);
    console.log('Flow contracts available:', !!flowContracts);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsProcessing(true);

    // Check for ENS commands first
    const ensCommand = detectENSCommand(newMessage);
    if (ensCommand) {
      await handleENSCommand(ensCommand);
      return;
    }

    try {
      // Process message with LLM service if available
      if (llmService) {
        console.log('Processing message with LLM service...');
        try {
          const response = await llmService.processMessage(newMessage, { 
            network: network?.name || 'Local Anvil',
            userAddress: account,
            isConnected,
            agentName,
            agentRole
          });

          console.log('LLM response:', response);

          // Check if LLM suggests an action
          if (response.action && isConnected && flowContracts) {
            console.log('Executing action:', response.action);
            
            // Add AI response with action confirmation buttons
            const aiResponse: ChatMessage = {
              id: (Date.now() + 1).toString(),
              content: response.message || "I'm ready to execute this action. Please confirm:",
              timestamp: new Date(),
              sender: 'ai',
              pendingAction: response.action, // Store the pending action
              actions: [{
                type: 'confirmation',
                description: response.action.description || 'Execute action',
                status: 'pending'
              }]
            };
            
            setMessages(prev => [...prev, aiResponse]);
          } else if (response.message && response.message.toLowerCase().includes('confirm')) {
            // If the message mentions confirmation but no action, create a generic confirmation
            const aiResponse: ChatMessage = {
              id: (Date.now() + 1).toString(),
              content: response.message,
              timestamp: new Date(),
              sender: 'ai',
              pendingAction: { description: 'Confirm action', type: 'generic' },
              actions: [{
                type: 'confirmation',
                description: 'Confirm action',
                status: 'pending'
              }]
            };
            
            setMessages(prev => [...prev, aiResponse]);
          } else {
            console.log('No action suggested, showing regular response');
            // Regular AI response without action
            const aiResponse: ChatMessage = {
              id: (Date.now() + 1).toString(),
              content: response.message || "I understand your request. Let me process that for you...",
              timestamp: new Date(),
              sender: 'ai',
            };
            
            setMessages(prev => [...prev, aiResponse]);
          }
        } catch (error) {
          console.error('Error processing message with LLM:', error);
          // Fallback to simple response
          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: "I understand your request. Let me process that for you...",
            timestamp: new Date(),
            sender: 'ai',
          };
          setMessages(prev => [...prev, aiResponse]);
        }
      } else {
        console.log('LLM service not available, showing fallback response');
        
        // Check if the user message suggests an action that needs confirmation
        const actionKeywords = ['send', 'transfer', 'pay', 'confirm', 'execute', 'approve'];
        const needsConfirmation = actionKeywords.some(keyword => 
          newMessage.toLowerCase().includes(keyword)
        );
        
        if (needsConfirmation) {
          // Show confirmation buttons for action-like messages
          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: "I understand you want to perform an action. Please confirm below:",
            timestamp: new Date(),
            sender: 'ai',
            pendingAction: { description: newMessage, type: 'user_request' },
            actions: [{
              type: 'confirmation',
              description: newMessage,
              status: 'pending'
            }]
          };
          setMessages(prev => [...prev, aiResponse]);
        } else {
          // Regular fallback response
          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: "I understand your request. Let me process that for you...",
            timestamp: new Date(),
            sender: 'ai',
          };
          setMessages(prev => [...prev, aiResponse]);
        }
      }
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

  // ENS Command Detection and Processing
  const detectENSCommand = (message: string) => {
    const ensPatterns = {
      create: /create.*ens.*?([a-zA-Z0-9-]+\.agent\.eth)/i,
      resolve: /resolve.*ens.*?([a-zA-Z0-9-]+\.agent\.eth)/i,
      getText: /get.*text.*records.*?([a-zA-Z0-9-]+\.agent\.eth)/i,
      getTextSimple: /text.*records.*?([a-zA-Z0-9-]+\.agent\.eth)/i,
      setupProfile: /setup.*profile/i,
      setupProfileAlt: /set.*up.*profile/i,
      update: /update.*agent.*profile/i,
      check: /check.*ens.*availability.*?([a-zA-Z0-9-]+\.agent\.eth)/i,
      link: /link.*ens.*wallet/i,
      transfer: /transfer.*ens.*ownership/i
    };

    for (const [command, pattern] of Object.entries(ensPatterns)) {
      const match = message.match(pattern);
      if (match) {
        return { type: command, match, originalMessage: message };
      }
    }
    return null;
  };

  const handleENSCommand = async (ensCommand: any) => {
    const { type, match, originalMessage } = ensCommand;
    
    let responseMessage = '';
    let pendingAction = null;

    switch (type) {
      case 'create':
        const cost = await getENSOperationCost(match[1], 1);
        const costDisplay = ethers.formatEther(cost) + ' ETH';
        responseMessage = `I'll create the ENS name "${match[1]}" for you. This will cost approximately ${costDisplay} for 1 year. Please confirm:`;
        pendingAction = {
          type: 'ens_create',
          ensName: match[1],
          description: `Create ENS name: ${match[1]}`,
          cost: cost.toString() // Store as string for the action
        };
        break;

      case 'resolve':
        responseMessage = `I'll resolve the ENS name "${match[1]}" to get the associated address and profile. Please confirm:`;
        pendingAction = {
          type: 'ens_resolve',
          ensName: match[1],
          description: `Resolve ENS name: ${match[1]}`,
          operation: 'resolve'
        };
        break;

      case 'getText':
      case 'getTextSimple':
        responseMessage = `I'll get the text records for the ENS name "${match[1]}". Please confirm:`;
        pendingAction = {
          type: 'ens_get_text',
          ensName: match[1],
          description: `Get text records for: ${match[1]}`,
          operation: 'get_text'
        };
        break;

      case 'setupProfile':
      case 'setupProfileAlt':
        responseMessage = `I'll help you set up your ENS profile! First, let me check what ENS names you own and then we can set up your text records.`;
        pendingAction = {
          type: 'ens_setup_profile',
          description: 'Setup ENS profile',
          operation: 'setup_profile'
        };
        break;

      case 'update':
        responseMessage = `I'll help you update your agent profile. What information would you like to update?`;
        pendingAction = {
          type: 'ens_update',
          description: 'Update agent profile'
        };
        break;

      case 'check':
        responseMessage = `I'll check if "${match[1]}" is available for registration. Please confirm:`;
        pendingAction = {
          type: 'ens_check',
          ensName: match[1],
          description: `Check ENS availability: ${match[1]}`
        };
        break;

      case 'link':
        responseMessage = `I'll link your current wallet address to your ENS name. Please confirm:`;
        pendingAction = {
          type: 'ens_link',
          description: 'Link ENS to wallet'
        };
        break;

      case 'transfer':
        responseMessage = `I'll help you transfer ENS ownership. Please provide the new owner's address.`;
        pendingAction = {
          type: 'ens_transfer',
          description: 'Transfer ENS ownership'
        };
        break;

      default:
        responseMessage = "I understand you want to perform an ENS operation. Please confirm:";
        pendingAction = { description: 'Execute ENS operation', type: 'ens_generic' };
    }

    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: responseMessage,
      timestamp: new Date(),
      sender: 'ai',
      pendingAction,
      actions: [{
        type: 'confirmation',
        description: pendingAction.description,
        status: 'pending'
      }]
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsProcessing(false);
  };

  // Get blockchain explorer URL for transaction verification
  const getExplorerUrl = (chainId: number, txHash: string): string => {
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return `https://etherscan.io/tx/${txHash}`;
      case 11155111: // Sepolia Testnet
        return `https://sepolia.etherscan.io/tx/${txHash}`;
      case 137: // Polygon
        return `https://polygonscan.com/tx/${txHash}`;
      case 42161: // Arbitrum
        return `https://arbiscan.io/tx/${txHash}`;
      case 10: // Optimism
        return `https://optimistic.etherscan.io/tx/${txHash}`;
      case 8453: // Base
        return `https://basescan.org/tx/${txHash}`;
      case 31337: // Hardhat/Local
        return `#`; // Local transactions can't be verified on explorer
      default:
        return `https://etherscan.io/tx/${txHash}`; // Default to Etherscan
    }
  };

  // Get blockchain explorer name for display
  const getExplorerName = (chainId: number): string => {
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return 'Etherscan';
      case 11155111: // Sepolia Testnet
        return 'Sepolia Etherscan';
      case 137: // Polygon
        return 'PolygonScan';
      case 42161: // Arbitrum
        return 'Arbiscan';
      case 10: // Optimism
        return 'Optimistic Etherscan';
      case 8453: // Base
        return 'BaseScan';
      case 31337: // Hardhat/Local
        return 'Local Network';
      default:
        return 'Etherscan';
    }
  };

  // Get user's ENS profile with text records
  const getUserENSProfile = async (ensName: string) => {
    if (!flowContracts?.flowENSIntegration) {
      console.log('No ENS contract available');
      return null;
    }

    try {
      console.log('Getting ENS profile for:', ensName);
      
      // Get common text record keys
      const commonKeys = ['description', 'url', 'avatar', 'email', 'github', 'twitter', 'discord', 'telegram'];
      const textRecords: { [key: string]: string } = {};
      
      for (const key of commonKeys) {
        try {
          const value = await flowContracts.flowENSIntegration.getENSTextRecord(ensName, key);
          if (value && value.trim() !== '') {
            textRecords[key] = value;
          }
        } catch (error) {
          console.log(`No text record found for key: ${key}`);
        }
      }
      
      return {
        ensName,
        textRecords,
        description: textRecords.description || '',
        url: textRecords.url || '',
        avatar: textRecords.avatar || '',
        email: textRecords.email || '',
        github: textRecords.github || '',
        twitter: textRecords.twitter || '',
        discord: textRecords.discord || '',
        telegram: textRecords.telegram || ''
      };
    } catch (error) {
      console.error('Error getting ENS profile:', error);
      return null;
    }
  };

  // Get ENS operation cost
  const getENSOperationCost = async (ensName: string, duration: number = 1) => {
    if (!flowContracts?.flowENSIntegration) {
      console.log('No ENS contract available, using default cost');
      return ethers.parseEther('0.01'); // Return BigNumber for consistency
    }

    try {
      console.log('Getting ENS registration price for:', ensName, 'duration:', duration);
      const cost = await flowContracts.flowENSIntegration.getENSRegistrationPrice(ensName, duration);
      console.log('Raw cost from contract:', cost?.toString());
      
      if (cost && cost > 0) {
        // Validate the cost is reasonable (should be less than 1 ETH)
        const costInEth = ethers.formatEther(cost);
        console.log('Cost in ETH:', costInEth);
        
        if (parseFloat(costInEth) > 1) {
          console.warn('Cost seems too high, using default:', costInEth, 'ETH');
          return ethers.parseEther('0.01');
        }
        
        return cost; // Return the BigNumber directly
      }
    } catch (error) {
      console.error('Error getting ENS cost:', error);
      // If the contract method fails, use default pricing
      console.log('Using default ENS cost: 0.01 ETH');
    }
    
    console.log('Using default ENS cost: 0.01 ETH');
    return ethers.parseEther('0.01'); // Return BigNumber for consistency
  };

  // Execute ENS Operations
  const executeENSOperation = async (action: any): Promise<string> => {
    if (!flowContracts?.flowENSIntegration) {
      throw new Error('ENS integration contract not available');
    }

    // Ensure we're on the correct network
    if (network?.chainId !== 11155111) {
      throw new Error('Please switch to Ethereum Sepolia testnet to use ENS operations');
    }

    const { type, ensName, cost } = action;
    
    console.log('Executing ENS operation with action:', action);
    console.log('Action type:', type);
    console.log('ENS name:', ensName);
    console.log('Cost:', cost);

    try {
      let tx: any;
      
      console.log('Executing ENS operation:', type, 'for ENS name:', ensName);
      console.log('Current network:', network?.name, 'ChainId:', network?.chainId);
      console.log('ENS contract address:', flowContracts.flowENSIntegration.address);

      switch (type) {
        case 'ens_create':
          // Create ENS name with 1 year duration
          const duration = 1; // 1 year
          const secret = ethers.randomBytes(32); // Generate random secret
          
          // Get the actual cost from the contract to ensure accuracy
          let actualCost = cost;
          try {
            const contractCost = await flowContracts.flowENSIntegration.getENSRegistrationPrice(ensName, duration);
            if (contractCost && contractCost > 0) {
              // Validate the contract cost is reasonable
              const contractCostEth = ethers.formatEther(contractCost);
              if (parseFloat(contractCostEth) <= 1) {
                actualCost = contractCost.toString();
                console.log('Contract returned cost:', contractCostEth, 'ETH');
              } else {
                console.warn('Contract cost too high, using fallback:', contractCostEth, 'ETH');
                actualCost = '0.01'; // Use reasonable fallback
              }
            }
          } catch (error) {
            console.warn('Could not get contract cost, using fallback:', error);
            actualCost = '0.01'; // Use reasonable fallback
          }
          
          // Parse cost string back to BigNumber for transaction
          const costInWei = ethers.parseEther(actualCost || '0.01');
          
          // Validate cost is reasonable
          const costInEth = ethers.formatEther(costInWei);
          if (parseFloat(costInEth) > 1) {
            throw new Error(`ENS registration cost seems too high: ${costInEth} ETH. Please check the price oracle.`);
          }
          
          console.log('Registering ENS name:', ensName, 'with cost:', costInEth, 'ETH');
          console.log('Cost in wei:', costInWei.toString());
          
          // Check if user has enough balance
          if (account) {
            try {
              const balance = await flowContracts.provider.getBalance(account);
              const balanceEth = ethers.formatEther(balance);
              console.log('User balance:', balanceEth, 'ETH');
              
              if (balance < costInWei) {
                throw new Error(`Insufficient balance. You have ${balanceEth} ETH but need ${costInEth} ETH for registration.`);
              }
            } catch (error) {
              console.warn('Could not check balance:', error);
            }
          }
          
          // Call the contract directly - no more local testing fallbacks
          tx = await flowContracts.flowENSIntegration.registerENSName(
            ensName,
            duration,
            secret,
            { value: costInWei }
          );
          
          console.log('ENS registration transaction sent:', tx.hash);
          break;

        case 'ens_resolve':
          // Resolve ENS name to address
          try {
            console.log('Resolving ENS name:', ensName);
            const resolvedAddress = await flowContracts.flowENSIntegration.resolveENSName(ensName);
            console.log('ENS resolution result:', resolvedAddress);
            
            if (resolvedAddress === '0x0000000000000000000000000000000000000000' || resolvedAddress === ethers.ZeroAddress) {
              const result = `ENS name "${ensName}" is not registered or has no address record`;
              console.log('ENS resolution result:', result);
              return result;
            } else {
              // Return a cleaner result format
              const result = `ENS name "${ensName}" resolves to address: ${resolvedAddress}`;
              console.log('ENS resolution result:', result);
              console.log('Returning result type:', typeof result);
              console.log('Returning result value:', result);
              return result;
            }
          } catch (error) {
            console.error('ENS resolution failed:', error);
            throw new Error(`Failed to resolve ENS name: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }

        case 'ens_check':
          // Check ENS availability
          const isAvailable = await flowContracts.flowENSIntegration.isENSNameAvailable(ensName);
          const result = `ENS name "${ensName}" is ${isAvailable ? 'available' : 'not available'} for registration`;
          console.log('ENS availability result:', result);
          console.log('Returning result type:', typeof result);
          console.log('Returning result value:', result);
          return result;

        case 'ens_get_text':
          // Get ENS text records
          try {
            console.log('Getting text records for ENS name:', ensName);
            
            // Get common text record keys
            const commonKeys = ['description', 'url', 'avatar', 'email', 'github', 'twitter', 'discord', 'telegram'];
            const textRecords: { [key: string]: string } = {};
            
            for (const key of commonKeys) {
              try {
                const value = await flowContracts.flowENSIntegration.getENSTextRecord(ensName, key);
                if (value && value.trim() !== '') {
                  textRecords[key] = value;
                }
              } catch (error) {
                console.log(`No text record found for key: ${key}`);
              }
            }
            
            if (Object.keys(textRecords).length === 0) {
              const result = `No text records found for ENS name "${ensName}"`;
              console.log('Text records result:', result);
              return result;
            } else {
              const result = `Text records for "${ensName}":\n\n${Object.entries(textRecords).map(([key, value]) => `• ${key}: ${value}`).join('\n')}`;
              console.log('Text records result:', result);
              return result;
            }
          } catch (error) {
            console.error('Error getting text records:', error);
            throw new Error(`Failed to get text records: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }

        case 'ens_setup_profile':
          // Setup ENS profile - check what names user owns and help set up text records
          try {
            console.log('Setting up ENS profile for user');
            
            // Find ENS names owned by the user
            const possibleNames = ['kwame.agent.eth', 'flow.agent.eth', 'agent.eth'];
            let userENSName = '';
            
            for (const name of possibleNames) {
              try {
                const isOwned = await flowContracts.flowENSIntegration.isENSNameOwnedBy(name, account);
                if (isOwned) {
                  userENSName = name;
                  break;
                }
              } catch (error) {
                console.log(`Error checking ownership of ${name}:`, error);
              }
            }
            
            if (userENSName) {
              const result = `Great! I found your ENS name: **${userENSName}**\n\nNow let's set up your profile. You can use these commands:\n\n• **Set description:** "Set description for ${userENSName} to [your description]"\n• **Set website:** "Set website for ${userENSName} to [your URL]"\n• **Set email:** "Set email for ${userENSName} to [your email]"\n• **Set social:** "Set twitter for ${userENSName} to [your handle]"\n\nWhat would you like to set first?`;
              return result;
            } else {
              const result = `I couldn't find an ENS name owned by your wallet address (${account}).\n\nTo get started, you can:\n\n• **Create a new ENS name:** "Create agent ENS: kwame.agent.eth"\n• **Check availability:** "Check ENS availability: flow.agent.eth"\n\nWould you like me to help you create a new ENS name?`;
              return result;
            }
          } catch (error) {
            console.error('Error setting up ENS profile:', error);
            throw new Error(`Failed to setup ENS profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }

        case 'ens_update':
          // Update ENS text record (example: description)
          try {
            const nameHash = ethers.keccak256(ethers.toUtf8Bytes(ensName || 'myagent.eth'));
            tx = await flowContracts.flowENSIntegration.setENSTextRecord(
              ensName || 'myagent.eth',
              'description',
              'Updated via Flow platform'
            );
          } catch (error) {
            console.error('ENS update failed:', error);
            throw new Error(`Failed to update ENS record: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        case 'ens_link':
          // Link current wallet to ENS
          try {
            const walletName = ensName || 'myagent.eth';
            tx = await flowContracts.flowENSIntegration.setENSAddress(
              walletName,
              walletName,
              account
            );
          } catch (error) {
            console.error('ENS linking failed:', error);
            throw new Error(`Failed to link ENS to wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        case 'ens_transfer':
          // Transfer ENS ownership (placeholder - would need new owner address)
          throw new Error('Transfer ENS ownership requires new owner address. Please specify the recipient.');

        default:
          throw new Error(`Unknown ENS operation type: ${type}`);
      }

      // For read operations, we've already returned the result
      if (type === 'ens_check' || type === 'ens_resolve') {
        // These operations already returned their results above
        console.log('Read operation already returned result');
        return; // This should never be reached due to return statements above
      }

      // For write operations, handle the transaction
      if (tx && typeof tx === 'object' && 'wait' in tx) {
        const receipt = await tx.wait();
        return receipt.hash;
      } else if (typeof tx === 'string') {
        return tx; // For operations that return a string result
      } else {
        return 'Operation completed successfully';
      }
    } catch (error) {
      console.error(`ENS operation failed: ${type}`, error);
      throw error;
    }
  };



  // Handle action confirmation
  const handleActionConfirm = async (action: any, messageId: string) => {
    if (!isConnected || !flowContracts) {
      console.log('Action confirmation failed: not connected or no contracts');
      return;
    }

    console.log('Confirming action:', action);
    console.log('Current network:', network);
    console.log('Flow contracts available:', !!flowContracts);
    
    // Check if we're on the right network for ENS operations
    if (action.type?.startsWith('ens_') && network?.chainId !== 11155111) {
      console.error('Wrong network for ENS operations. Current:', network?.chainId, 'Expected: 11155111');
      alert('Please switch to Ethereum Sepolia testnet to use ENS operations');
      return;
    }

    try {
      let executionResult: string;
      
      // Check if this is an ENS operation
      if (action.type?.startsWith('ens_')) {
        console.log('Executing ENS operation:', action.type);
        executionResult = await executeENSOperation(action);
        console.log('ENS operation result:', executionResult);
        console.log('Result type:', typeof executionResult);
        console.log('Result stringified:', JSON.stringify(executionResult));
      } else {
        console.log('Executing regular Flow action:', action.type);
        executionResult = await executeFlowAction(action);
      }
      
      // Update the message to show completion
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          // For ENS operations, show the actual result content
          let displayContent = "✅ Action executed successfully!";
          
          if (action.type?.startsWith('ens_')) {
            // Check if this is a read operation that returns content
            if (action.type === 'ens_resolve' || action.type === 'ens_check' || action.type === 'ens_get_text' || action.type === 'ens_setup_profile') {
              // Just show the raw result text like ChatGPT would
              displayContent = String(executionResult);
            } else {
              displayContent = `✅ ENS operation completed successfully!\n\n${String(executionResult)}`;
            }
          }

          // Add simple transaction verification link for all transaction operations
          if (executionResult && typeof executionResult === 'string') {
            // Look for transaction hash patterns
            const txPatterns = [
              /Tx: (0x[a-fA-F0-9]+)/,           // "Tx: 0x..."
              /Transaction: (0x[a-fA-F0-9]+)/,   // "Transaction: 0x..."
              /Hash: (0x[a-fA-F0-9]+)/,          // "Hash: 0x..."
              /0x[a-fA-F0-9]{64}/                // Any 64-character hex string
            ];
            
            let txHash = null;
            for (const pattern of txPatterns) {
              const match = executionResult.match(pattern);
              if (match) {
                txHash = match[1] || match[0];
                break;
              }
            }
            
            if (txHash) {
              const networkId = chainId || 1;
              const explorerUrl = getExplorerUrl(networkId, txHash);
              const explorerName = getExplorerName(networkId);
              
              if (networkId === 31337) {
                // Local network - minimal info
                displayContent = `${executionResult}\n\n🔍 *Local transaction - cannot verify externally*`;
              } else {
                // Public network - just add the verification link
                displayContent = `${executionResult}\n\n🔍 [Verify on ${explorerName}](${explorerUrl})`;
              }
            }
          }
          
          return {
            ...msg,
            content: displayContent,
            pendingAction: undefined,
            actions: msg.actions?.map(act => ({
              ...act,
              type: 'transaction',
              status: 'completed',
              txHash: executionResult
            }))
          };
        }
        return msg;
      }));
    } catch (error) {
      console.error('Action execution failed:', error);
      
      // Update the message to show error
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          // For ENS operations, show better error formatting
          let errorContent = `❌ Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          
          if (action.type?.startsWith('ens_')) {
            errorContent = `❌ ENS operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
          
          return {
            ...msg,
            content: errorContent,
            pendingAction: undefined,
            actions: msg.actions?.map(act => ({
              ...act,
              type: 'transaction',
              status: 'failed'
            }))
          };
        }
        return msg;
      }));
    }
  };

  // Handle action rejection
  const handleActionReject = (messageId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          content: "❌ Action cancelled by user",
          pendingAction: undefined,
          actions: msg.actions?.map(act => ({
            ...act,
            status: 'failed'
          }))
        };
      }
      return msg;
    }));
  };

  const suggestedPrompts = [
    { text: "Setup my ENS profile", color: "bg-purple-100 text-purple-800" },
    { text: "Get text records: kwame.agent.eth", color: "bg-indigo-100 text-indigo-800" },
    { text: "Create agent ENS: kwame.agent.eth", color: "bg-blue-100 text-blue-800" },
    { text: "Check ENS availability: flow.agent.eth", color: "bg-yellow-100 text-yellow-800" },
    { text: "Create Multi-Signature Wallet", color: "bg-green-100 text-green-800" },
    { text: "Update my agent profile", color: "bg-emerald-100 text-emerald-800" },
  ];

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