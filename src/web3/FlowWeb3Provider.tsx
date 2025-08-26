import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { createENSService } from '../services/ENSService';
import { createLLMService, getDefaultLLMConfig } from '../ai/LLMService';
import { SUPPORTED_NETWORKS } from '../abis/constants';
import { CONTRACT_ABIS } from '../abis/contracts';
import { ActionBuilder } from '../ai/ActionBuilder';
import { ContractInteractor } from '../ai/ContractInteractor';
import { SmartContractAction } from '../ai/ActionBuilder';
import { IntentType } from '../ai/IntentRecognition';
import { TransactionResult } from '../ai/ContractInteractor';

interface FlowWeb3ContextType {
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  isConnected: boolean;
  network: any;
  ensService: any;
  llmService: any;
  flowContracts: any;
  actionBuilder: ActionBuilder | null;
  contractInteractor: ContractInteractor | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  executeFlowAction: (action: any) => Promise<string>;
  executeSmartContractAction: (action: SmartContractAction) => Promise<TransactionResult>;
  readContract: (contractName: string, functionName: string, args?: any[]) => Promise<any>;
  buildAction: (intent: { type: IntentType; parameters: any; confidence?: number; description?: string }) => SmartContractAction;
  checkAgentExists: (ensName: string) => Promise<boolean>;
}

const FlowWeb3Context = createContext<FlowWeb3ContextType | undefined>(undefined);

export const useFlowWeb3 = () => {
  const context = useContext(FlowWeb3Context);
  if (!context) {
    throw new Error('useFlowWeb3 must be used within a FlowWeb3Provider');
  }
  return context;
};

interface FlowWeb3ProviderProps {
  children: ReactNode;
}

export const FlowWeb3Provider: React.FC<FlowWeb3ProviderProps> = ({ children }) => {
  console.log('FlowWeb3Provider mounting...');
  
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [network, setNetwork] = useState(SUPPORTED_NETWORKS[1]); // Default to Ethereum Sepolia
  const [ensService, setEnsService] = useState<any>(null);
  const [llmService, setLlmService] = useState<any>(null);
  const [flowContracts, setFlowContracts] = useState<any>(null);
  const [actionBuilder, setActionBuilder] = useState<ActionBuilder | null>(null);
  const [contractInteractor, setContractInteractor] = useState<ContractInteractor | null>(null);

  console.log('FlowWeb3Provider state initialized');

  // Initialize LLM service
  useEffect(() => {
    console.log('Initializing LLM service...');
    try {
      const config = getDefaultLLMConfig();
      console.log('LLM config:', { ...config, apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'undefined' });
      
      const llm = createLLMService(config);
      console.log('LLM service created successfully');
      
      // Test OpenRouter connection if using OpenRouter
      if (config.provider === 'openrouter') {
        llm.testOpenRouterConnection().then(isConnected => {
          console.log('OpenRouter connection test result:', isConnected);
        }).catch(error => {
          console.error('OpenRouter connection test failed:', error);
        });
      }
      
      setLlmService(llm);
    } catch (error) {
      console.error('Failed to initialize LLM service:', error);
      // Fallback to local LLM if OpenRouter fails
      console.log('Falling back to local LLM...');
      const fallbackLlm = createLLMService({
        provider: 'local',
        baseUrl: 'http://localhost:11434/v1'
      });
      setLlmService(fallbackLlm);
    }
  }, []);

  // Initialize ActionBuilder and ContractInteractor
  useEffect(() => {
    const builder = new ActionBuilder();
    const interactor = new ContractInteractor();
    setActionBuilder(builder);
    setContractInteractor(interactor);
    console.log('ActionBuilder and ContractInteractor initialized');
  }, []);

  console.log('FlowWeb3Provider useEffect completed');

  // Initialize Flow contracts when provider/signer changes
  useEffect(() => {
    if (provider && signer) {
      initializeFlowContracts();
    }
  }, [provider, signer, network]);

  const initializeFlowContracts = () => {
    if (!provider || !signer) {
      console.log('Cannot initialize contracts: provider or signer missing');
      return;
    }

    console.log('Initializing Flow contracts for network:', network);
    console.log('Network contracts:', network.contracts);

    try {
      const contracts = {
        flow: new ethers.Contract(
          network.contracts.flow,
          CONTRACT_ABIS.flow,
          signer
        ),
        flowAgentRegistry: new ethers.Contract(
          network.contracts.flowAgentRegistry,
          CONTRACT_ABIS.flowAgentRegistry,
          signer
        ),
        flowCredentials: new ethers.Contract(
          network.contracts.flowCredentials,
          CONTRACT_ABIS.flowCredentials,
          signer
        ),
        flowPayments: new ethers.Contract(
          network.contracts.flowPayments,
          CONTRACT_ABIS.flowPayments,
          signer
        ),
        flowMultiSigWallet: new ethers.Contract(
          network.contracts.flowMultiSigWallet,
          CONTRACT_ABIS.flowMultiSigWallet,
          signer
        ),
        flowDAO: new ethers.Contract(
          network.contracts.flowDAO,
          CONTRACT_ABIS.flowDAO,
          signer
        ),
        flowENSIntegration: new ethers.Contract(
          network.contracts.flowENSIntegration,
          CONTRACT_ABIS.flowENSIntegration,
          signer
        ),
        flowAgentIntegration: new ethers.Contract(
          network.contracts.flowAgentIntegration,
          CONTRACT_ABIS.flowAgentIntegration,
          signer
        )
      };

      console.log('Contracts created successfully');
      console.log('flowENSIntegration address:', network.contracts.flowENSIntegration);
      console.log('flowENSIntegration contract instance:', contracts.flowENSIntegration);

      setFlowContracts(contracts);

      // Initialize ENS service with contracts
      const ens = createENSService(provider, signer);
      setEnsService(ens);

      console.log('Flow contracts initialized successfully');
    } catch (error) {
      console.error('Error initializing Flow contracts:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethProvider = new ethers.BrowserProvider((window as any).ethereum);
        const ethSigner = await ethProvider.getSigner();
        const address = await ethSigner.getAddress();
        
        setProvider(ethProvider);
        setSigner(ethSigner);
        setAccount(address);

        // Get network info
        const networkInfo = await ethProvider.getNetwork();
        console.log('Detected network chainId:', Number(networkInfo.chainId));
        console.log('Available networks:', SUPPORTED_NETWORKS.map(n => ({ chainId: n.chainId, name: n.name })));
        
        const currentNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === Number(networkInfo.chainId)) || SUPPORTED_NETWORKS[1];
        console.log('Selected network:', currentNetwork);
        setNetwork(currentNetwork);

        // Update ContractInteractor with new provider
        if (contractInteractor) {
          // Note: ContractInteractor will handle its own provider/signer management
          console.log('ContractInteractor provider updated');
        }

        // Listen for account changes
        (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            disconnectWallet();
          }
        });

        // Listen for network changes
        (window as any).ethereum.on('chainChanged', (chainId: string) => {
          const newNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === parseInt(chainId, 16)) || SUPPORTED_NETWORKS[1];
          setNetwork(newNetwork);
        });

      } else {
        throw new Error('No Web3 wallet detected');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setFlowContracts(null);
    setEnsService(null);
  };

  const switchNetwork = async (chainId: number) => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        console.log('Switching to network with chainId:', chainId);
        
        // First try to switch to the existing network
        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            console.log('Network not found, adding Sepolia testnet...');
            
            const networkParams = {
              chainId: `0x${chainId.toString(16)}`,
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'SEP',
                decimals: 18
              },
              rpcUrls: ['https://ethereum-sepolia.publicnode.com'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            };
            
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkParams],
            });
          } else {
            throw switchError;
          }
        }
        
        console.log('Network switch successful');
      }
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  };

  /**
   * @deprecated Use executeSmartContractAction instead for better error handling and validation
   */
  const executeFlowAction = async (action: any): Promise<string> => {
    if (!flowContracts || !signer) {
      throw new Error('Wallet not connected');
    }

    // Validate action parameters
    if (!action || !action.type) {
      throw new Error('Invalid action: missing type');
    }

    // Helper function to validate required parameters
    const validateRequiredParam = (param: any, name: string, type: 'string' | 'address' | 'number' | 'bytes32' = 'string') => {
      if (param === undefined || param === null || param === '') {
        throw new Error(`Required parameter '${name}' is missing`);
      }
      if (type === 'address' && param === '0') {
        throw new Error(`Parameter '${name}' cannot be zero address`);
      }
      if (type === 'bytes32' && param === '0') {
        throw new Error(`Parameter '${name}' cannot be zero bytes32`);
      }
      if (type === 'number' && (param === '0' || param === 0)) {
        throw new Error(`Parameter '${name}' must be greater than 0`);
      }
      return param;
    };

    try {
      let tx: any;

      switch (action.type) {
        case 'create_agent':
          // Validate required parameters with defaults
          const ensName = validateRequiredParam(
            action.parameters?.ensName || 'myagent.eth', 
            'ensName', 
            'string'
          );
          const description = validateRequiredParam(
            action.parameters?.description || 'AI Agent for automation and financial operations', 
            'description', 
            'string'
          );
          const agentType = validateRequiredParam(
            action.parameters?.agentType || 0, 
            'agentType', 
            'number'
          );
          const capabilities = action.parameters?.capabilities || ['AI', 'automation', 'financial'];
          
          tx = await flowContracts.flowAgentRegistry.registerAgent(
            ensName,
            description,
            agentType, // This should be a number (enum value)
            capabilities,
            action.parameters?.metadata || ''
          );
          break;

        case 'send_payment':
          // Validate required parameters
          const recipient = validateRequiredParam(action.parameters.recipient, 'recipient', 'string');
          const amount = validateRequiredParam(action.parameters.amount, 'amount', 'number');
          
          // Note: agentId is bytes32 in FlowPayments contract, not address
          tx = await flowContracts.flowPayments.sendPaymentToENS(
            recipient,
            amount,
            action.parameters.token || ethers.ZeroAddress,
            action.parameters.description || 'Payment',
            action.parameters.agentId || ethers.ZeroHash // Use ZeroHash for bytes32, not ZeroAddress
          );
          break;

        case 'create_wallet':
          tx = await flowContracts.flowMultiSigWallet.createWallet(
            action.parameters.ensName || 'wallet.eth',
            action.parameters.description || 'Multi-signature wallet',
            action.parameters.owners || [await signer.getAddress()],
            action.parameters.requiredApprovals || 1,
            action.parameters.walletType || 0 // 0 = Standard
          );
          break;

        case 'create_dao':
          tx = await flowContracts.flowDAO.createDAO(
            action.parameters.ensName || 'community.eth',
            action.parameters.name || 'Community DAO',
            action.parameters.description || 'Community governance',
            action.parameters.members || [await signer.getAddress()],
            action.parameters.proposalThreshold || 1,
            action.parameters.votingPeriod || 86400, // 1 day
            action.parameters.quorum || 1,
            action.parameters.daoType || 0, // 0 = Community
            action.parameters.governanceToken || ethers.ZeroAddress
          );
          break;

        case 'issue_credential':
          tx = await flowContracts.flowCredentials.issueCredential(
            action.parameters.recipient || await signer.getAddress(),
            action.parameters.name || 'Badge',
            action.parameters.description || 'Credential',
            action.parameters.credentialType || 0, // 0 = Badge
            action.parameters.score || 50, // Default score
            action.parameters.icon || '🏆',
            action.parameters.expiryDate || Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year expiry
            action.parameters.metadata || 'Credential'
          );
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error executing Flow action:', error);
      throw error;
    }
  };

  // New methods using our ContractInteractor system
  const executeSmartContractAction = async (action: SmartContractAction): Promise<TransactionResult> => {
    if (!contractInteractor) {
      throw new Error('ContractInteractor not initialized');
    }
    
    if (!signer) { // Changed from isConnected to signer
      throw new Error('Wallet not connected');
    }

    return await contractInteractor.executeAction(action);
  };

  const readContract = async (contractName: string, functionName: string, args: any[] = []): Promise<any> => {
    if (!contractInteractor) {
      throw new Error('ContractInteractor not initialized');
    }

    return await contractInteractor.readContract(contractName, functionName, args);
  };

  const buildAction = (intent: { type: IntentType; parameters: any; confidence?: number; description?: string }): SmartContractAction => {
    if (!actionBuilder) {
      throw new Error('ActionBuilder not initialized');
    }

    // Create a proper Intent object with required properties
    const fullIntent = {
      type: intent.type,
      confidence: intent.confidence || 0.8,
      parameters: intent.parameters,
      description: intent.description || `Action: ${intent.type}`
    };

    return actionBuilder.buildAction(fullIntent);
  };

  // Check if an agent exists by ENS name
  const checkAgentExists = async (ensName: string): Promise<boolean> => {
    if (!flowContracts) {
      throw new Error('Contracts not initialized');
    }

    try {
      // Get the agent ID from the registry
      const nameHash = ethers.keccak256(ethers.toUtf8Bytes(ensName));
      const agentId = await flowContracts.flowAgentRegistry.ensNameToAgentId(nameHash);
      return agentId > 0;
    } catch (error) {
      console.error('Error checking agent existence:', error);
      return false;
    }
  };

  const value: FlowWeb3ContextType = {
    provider,
    signer,
    account,
    isConnected: !!signer && !!account,
    network,
    ensService,
    llmService,
    flowContracts,
    actionBuilder,
    contractInteractor,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    executeFlowAction,
    executeSmartContractAction,
    readContract,
    buildAction,
    checkAgentExists
  };

  console.log('FlowWeb3Context value created:', {
    provider: !!provider,
    signer: !!signer,
    account: !!account,
    isConnected: !!signer && !!account,
    network: !!network,
    ensService: !!ensService,
    llmService: !!llmService,
    flowContracts: !!flowContracts,
    actionBuilder: !!actionBuilder,
    contractInteractor: !!contractInteractor,
    connectWallet: !!connectWallet,
    disconnectWallet: !!disconnectWallet,
    switchNetwork: !!switchNetwork,
    executeFlowAction: !!executeFlowAction,
    executeSmartContractAction: !!executeSmartContractAction,
    readContract: !!readContract,
    buildAction: !!buildAction
  });

  return (
    <FlowWeb3Context.Provider value={value}>
      {children}
    </FlowWeb3Context.Provider>
  );
};