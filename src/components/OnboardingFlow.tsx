import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Wallet, Bot, Users, Globe, DollarSign, Shield, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFlowWeb3 } from "../web3";
import { ethers } from "ethers";

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [ensName, setEnsName] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  // Web3 integration
  const { 
    isConnected, 
    account, 
    network, 
    connectWallet, 
    disconnectWallet,
    switchNetwork,
    flowContracts,
    executeFlowAction
  } = useFlowWeb3();

  // Get agent info from URL if activating a specific agent
  const agentName = searchParams.get('agent');
  const agentEns = searchParams.get('ens');
  const agentRole = searchParams.get('role');

  // Customize onboarding based on agent being activated
  const isActivatingAgent = Boolean(agentName && agentEns && agentRole);

  const steps = [
    { id: 1, title: "Connect Wallet", description: "Connect your Web3 wallet" },
    { id: 2, title: "Choose ENS Name", description: "Select your agent's ENS subname" },
    { id: 3, title: "Select Agent", description: "Choose which agent to activate" },
    { id: 4, title: "Deploy", description: "Launch your AI agent" },
  ];

  // Check if this is a general activation (from header/hero buttons) or specific agent activation
  const isGeneralActivation = !agentName && !agentEns && !agentRole;
  const isSpecificAgentActivation = Boolean(agentName && agentEns && agentRole);

  // Pre-select role if activating specific agent
  useEffect(() => {
    if (agentRole && !isGeneralActivation) {
      // Map the agent role to the internal role ID
      const roleMapping: { [key: string]: string } = {
        "Payment Agent": "payment",
        "Identity Agent": "identity", 
        "Community Agent": "community",
        "AI Assistant": "ai"
      };
      setSelectedRole(roleMapping[agentRole] || "ai");
    }
  }, [agentRole, isGeneralActivation]);

  // Auto-advance to next step when wallet is connected
  useEffect(() => {
    if (isConnected && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [isConnected, currentStep]);

  const agentRoles = [
    {
      id: "payment",
      title: "Payment Agent",
      icon: DollarSign,
      description: "Handle payments, routing, and financial transactions with smart automation.",
      features: ["Split payments", "Privacy controls", "Rotating addresses", "Cross-chain support"],
      color: "from-green-500 to-emerald-600"
    },
    {
      id: "identity",
      title: "Identity Agent",
      icon: Shield,
      description: "Manage credentials, attestations, and verifiable identity records.",
      features: ["Credential storage", "Identity verification", "Privacy protection", "Attestation management"],
      color: "from-blue-500 to-cyan-600"
    },
    {
      id: "community",
      title: "Community Agent",
      icon: Users,
      description: "Coordinate groups, DAOs, and community activities seamlessly.",
      features: ["DAO coordination", "Group messaging", "Voting automation", "Savings circles"],
      color: "from-purple-500 to-indigo-600"
    },
    {
      id: "ai",
      title: "AI Assistant",
      icon: Bot,
      description: "General-purpose AI assistant for blockchain and Web3 interactions.",
      features: ["Smart contracts", "DeFi automation", "24/7 availability", "Multi-language support"],
      color: "from-orange-500 to-red-600"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setCurrentStep(1);
  };

  const handleNetworkSwitch = async (chainId: number) => {
    try {
      await switchNetwork(chainId);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  // Handle agent deployment
  const handleDeployAgent = async () => {
    if (!flowContracts || !ensName || !selectedRole) {
      console.error('Missing required data for agent deployment');
      return;
    }

    // Verify contract initialization
    if (!flowContracts.flowAgentRegistry) {
      console.error('FlowAgentRegistry contract not initialized');
      alert('Smart contracts not properly initialized. Please refresh the page and try again.');
      return;
    }

    setIsDeploying(true);

    try {
      console.log('Deploying agent:', { ensName, selectedRole, account });
      
      // Map role to agent type enum - these must match the smart contract enum values
      const roleToAgentType: { [key: string]: number } = {
        'payment': 5,      // Payment (enum value 5)
        'identity': 6,     // Identity (enum value 6)  
        'community': 7,    // Community (enum value 7)
        'ai': 0            // Personal (enum value 0)
      };

      // Validate that the selected role has a valid agent type
      if (roleToAgentType[selectedRole] === undefined) {
        throw new Error(`Invalid role selected: ${selectedRole}`);
      }

      // Get capabilities based on role
      const getCapabilitiesForRole = (role: string): string[] => {
        switch (role) {
          case 'payment':
            return ['payments', 'routing', 'financial_transactions'];
          case 'identity':
            return ['credentials', 'verification', 'attestations'];
          case 'community':
            return ['dao_coordination', 'group_messaging', 'voting'];
          case 'ai':
            return ['ai_assistant', 'smart_contracts', 'defi_automation'];
          default:
            return ['general_purpose'];
        }
      };

      // Create the agent registration action
      const agentAction = {
        type: 'create_agent',
        parameters: {
          ensName: ensName,
          description: `${agentRoles.find(r => r.id === selectedRole)?.title} for ${account?.slice(0, 6)}...${account?.slice(-4)}`,
          agentType: roleToAgentType[selectedRole] || 0,
          capabilities: getCapabilitiesForRole(selectedRole),
          metadata: JSON.stringify({ 
            role: selectedRole, 
            createdAt: Date.now(),
            owner: account 
          })
        }
      };

      console.log('Agent action parameters:', agentAction.parameters);
      
      // Validate parameters before sending
      if (!ensName || ensName.length < 3) {
        throw new Error('ENS name must be at least 3 characters long');
      }
      
      if (!account) {
        throw new Error('Wallet not connected');
      }

      // Check if ENS name already exists (basic validation)
      if (ensName.includes(' ')) {
        throw new Error('ENS name cannot contain spaces');
      }
      
      // Ensure ENS name ends with .eth
      if (!ensName.endsWith('.eth')) {
        throw new Error('ENS name must end with .eth');
      }

      console.log('Executing agent creation:', agentAction);
      
      // Check wallet balance before proceeding
      if (network?.chainId === 31337) { // Local Anvil network
        console.log('Local network detected, proceeding with agent creation...');
        
        // For local network, check if user has some ETH for gas
        try {
          const balance = await flowContracts.provider.getBalance(account);
          console.log('Wallet balance:', ethers.formatEther(balance), 'ETH');
          
          if (balance < ethers.parseEther('0.01')) {
            console.warn('Low balance detected, but proceeding on local network...');
          }
        } catch (error) {
          console.warn('Could not check balance:', error);
        }
      }
      
      // Execute the agent creation with retry logic
      let txHash: string;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          console.log(`Attempt ${retryCount + 1} to create agent...`);
          txHash = await executeFlowAction(agentAction);
          console.log('Agent created successfully! TX Hash:', txHash);
          break;
        } catch (error) {
          retryCount++;
          console.error(`Attempt ${retryCount} failed:`, error);
          
          if (retryCount > maxRetries) {
            throw error; // Re-throw if we've exhausted retries
          }
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Navigate to chat after successful creation
      navigate('/chat');
      
    } catch (error) {
      console.error('Failed to deploy agent:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes('Internal JSON-RPC error')) {
          errorMessage = 'Transaction failed on the blockchain. This could be due to:\n\n' +
            '• Insufficient gas or incorrect gas estimation\n' +
            '• Contract validation failure\n' +
            '• Network congestion\n' +
            '• Insufficient funds for gas fees\n\n' +
            'Please check your wallet balance and try again.';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was cancelled by the user.';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds to complete the transaction. Please check your wallet balance.';
        } else if (error.message.includes('nonce')) {
          errorMessage = 'Transaction nonce error. Please refresh and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Show detailed error in console for debugging
      console.error('Detailed error info:', {
        error,
        message: error instanceof Error ? error.message : 'No message',
        stack: error instanceof Error ? error.stack : 'No stack',
        parameters: { ensName, selectedRole, account, network }
      });
      
      alert(`Failed to deploy agent:\n\n${errorMessage}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="h-6 w-6" />
                <span>Connect Your Wallet</span>
              </CardTitle>
              <CardDescription>
                Connect your Web3 wallet to start using the Flow platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <div className="space-y-4">
                  <Button 
                    onClick={handleConnectWallet}
                    className="w-full h-12 text-lg"
                    size="lg"
                  >
                    <Wallet className="h-5 w-5 mr-2" />
                    Connect MetaMask
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Don't have a wallet?</p>
                    <a 
                      href="https://metamask.io/download/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Download MetaMask
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Wallet Connected!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Address: {account?.slice(0, 6)}...{account?.slice(-4)}
                    </p>
                    <p className="text-sm text-green-700">
                      Network: {network?.name}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleDisconnectWallet}
                    variant="outline"
                    className="w-full"
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-6 w-6" />
                <span>Choose ENS Name</span>
              </CardTitle>
              <CardDescription>
                Select a unique ENS name for your agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ENS Name</label>
                <Input
                  placeholder="myagent.eth"
                  value={ensName}
                  onChange={(e) => setEnsName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This will be your agent's unique identifier on the blockchain
                </p>
              </div>
              
              {ensName && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Preview:</p>
                  <p className="text-sm text-muted-foreground">
                    Your agent will be accessible at: <code className="bg-background px-1 rounded">{ensName}</code>
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={nextStep}
                disabled={!ensName.trim()}
                className="w-full"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-6 w-6" />
                <span>Select Agent Type</span>
              </CardTitle>
              <CardDescription>
                Choose the type of agent you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {agentRoles.map((role) => (
                  <div
                    key={role.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedRole === role.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${role.color} text-white`}>
                        <role.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{role.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {role.description}
                        </p>
                        <div className="mt-2">
                          {role.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="mr-1 mb-1 text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex space-x-2">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={nextStep}
                disabled={!selectedRole}
                className="flex-1"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6" />
                <span>Ready to Deploy</span>
              </CardTitle>
              <CardDescription>
                Review your agent configuration and deploy to the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">ENS Name:</span>
                  <span className="text-sm text-muted-foreground">{ensName}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Agent Type:</span>
                  <span className="text-sm text-muted-foreground">
                    {agentRoles.find(r => r.id === selectedRole)?.title}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Network:</span>
                  <span className="text-sm text-muted-foreground">{network?.name}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Wallet:</span>
                  <span className="text-sm text-muted-foreground">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex space-x-2">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleDeployAgent}
                className="flex-1"
                disabled={!flowContracts || isDeploying}
              >
                {isDeploying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deploying...
                  </>
                ) : (
                  <>
                    Deploy Agent
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isActivatingAgent ? `Activate ${agentName}` : 'Welcome to Flow'}
          </h1>
          <p className="text-muted-foreground">
            {isActivatingAgent 
              ? `Set up your ${agentRole?.toLowerCase()} agent to start using the Flow platform`
              : 'Create your first AI agent and start exploring the decentralized future'
            }
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-border text-muted-foreground'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Network Selection */}
        {isConnected && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">Current Network: {network?.name}</p>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNetworkSwitch(11155111)} // Ethereum Sepolia
                className={network?.chainId === 11155111 ? 'border-primary' : ''}
              >
                Ethereum Sepolia
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNetworkSwitch(31337)} // Local Anvil
                className={network?.chainId === 31337 ? 'border-primary' : ''}
              >
                Local Anvil
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNetworkSwitch(1)} // Mainnet
                className={network?.chainId === 1 ? 'border-primary' : ''}
              >
                Ethereum Mainnet
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;