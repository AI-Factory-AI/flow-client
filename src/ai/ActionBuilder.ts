import { ethers } from 'ethers';
import { Intent, IntentType } from './IntentRecognition';
import { CONTRACT_ABIS } from '../abis/contracts';
import { SUPPORTED_NETWORKS } from '../abis/constants';
import { ContractInteractor, TransactionResult } from './ContractInteractor';

export interface SmartContractAction {
  type: IntentType;
  description: string;
  contractAddress: string;
  functionName: string;
  functionArgs: any[];
  value: string; // ETH value to send
  estimatedGas: string;
  requiresApproval: boolean;
  userFriendlyDescription: string;
}

export class ActionBuilder {
  private contractAddresses: any;
  private contractInteractor: ContractInteractor;
  
  constructor() {
    // Get contract addresses for current network (default to Local Anvil)
    this.contractAddresses = SUPPORTED_NETWORKS[2].contracts;
    
    // Initialize contract interactor
    this.contractInteractor = new ContractInteractor();
  }
  
  // Get the contract interactor instance
  getContractInteractor(): ContractInteractor {
    return this.contractInteractor;
  }
  
  // Execute an action on the blockchain
  async executeAction(action: SmartContractAction): Promise<TransactionResult> {
    return await this.contractInteractor.executeAction(action);
  }
  
  // Read data from a contract
  async readContract(contractName: string, functionName: string, args: any[] = []): Promise<any> {
    return await this.contractInteractor.readContract(contractName, functionName, args);
  }
  
  // Connect wallet
  async connectWallet(): Promise<boolean> {
    return await this.contractInteractor.connectWallet();
  }
  
  // Check if wallet is connected
  isWalletConnected(): boolean {
    return this.contractInteractor.isWalletConnected();
  }
  
  // Get connected address
  async getConnectedAddress(): Promise<string | null> {
    return await this.contractInteractor.getConnectedAddress();
  }
  
  buildAction(intent: Intent): SmartContractAction {
    switch (intent.type) {
      case 'create_agent':
        return this.buildCreateAgentAction(intent);
      case 'send_payment':
        return this.buildSendPaymentAction(intent);
      case 'create_wallet':
        return this.buildCreateWalletAction(intent);
      case 'create_dao':
        return this.buildCreateDAOAction(intent);
      case 'register_ens':
        return this.buildRegisterENSAction(intent);
      case 'issue_credential':
        return this.buildIssueCredentialAction(intent);
      case 'swap_tokens':
        return this.buildSwapTokensAction(intent);
      default:
        throw new Error(`Unknown intent type: ${intent.type}`);
    }
  }
  
  private buildCreateAgentAction(intent: Intent): SmartContractAction {
    const { agentType } = intent.parameters;
    const ensName = intent.parameters.ensName || `${agentType.toLowerCase()}.agent.eth`;
    
    return {
      type: 'create_agent',
      description: `Create ${agentType} AI Agent`,
      contractAddress: this.contractAddresses.flowAgentRegistry,
      functionName: 'registerAgent',
      functionArgs: [
        ensName,                                    // ensName
        `AI Agent for ${agentType} operations`,     // description
        agentType,                                  // agentType
        ['AI', 'automation', 'blockchain'],         // capabilities
        `Qm${ensName}Metadata`                      // metadata IPFS hash
      ],
      value: '0', // No ETH value needed
      estimatedGas: '150000',
      requiresApproval: true,
      userFriendlyDescription: `I'll create a ${agentType} AI agent for you. This will register the agent on the blockchain and set up its basic configuration.`
    };
  }
  
  private buildSendPaymentAction(intent: Intent): SmartContractAction {
    const { amount, currency, recipient } = intent.parameters;
    
    // Convert amount to wei if it's ETH
    const value = currency === 'ETH' ? ethers.parseEther(amount).toString() : '0';
    
    return {
      type: 'send_payment',
      description: `Send ${amount} ${currency} to ${recipient}`,
      contractAddress: this.contractAddresses.flowPayments,
      functionName: 'sendPaymentToENS',
      functionArgs: [
        recipient,                                   // recipient ENS name
        ethers.parseUnits(amount, currency === 'USDC' ? 6 : 18).toString(), // amount
        this.getTokenAddress(currency),              // token address
        `Payment to ${recipient}`,                  // description
        '0'                                         // agentId (0 for direct payment)
      ],
      value,
      estimatedGas: '65000',
      requiresApproval: true,
      userFriendlyDescription: `I'll send ${amount} ${currency} to ${recipient}. This will execute the payment transaction on the blockchain.`
    };
  }
  
  private buildCreateWalletAction(intent: Intent): SmartContractAction {
    return {
      type: 'create_wallet',
      description: 'Create Multi-Signature Wallet',
      contractAddress: this.contractAddresses.flowMultiSigWallet,
      functionName: 'createWallet',
      functionArgs: [
        2,                                          // requiredSignatures
        [                                           // signatories
          '0x1234567890123456789012345678901234567890', // placeholder addresses
          '0x0987654321098765432109876543210987654321'
        ],
        'Multi-signature wallet for community',      // description
        86400                                       // approvalTimeout (24 hours)
      ],
      value: '0',
      estimatedGas: '200000',
      requiresApproval: true,
      userFriendlyDescription: 'I\'ll create a multi-signature wallet for you. This will deploy a new smart contract wallet that requires multiple signatures for transactions.'
    };
  }
  
  private buildCreateDAOAction(intent: Intent): SmartContractAction {
    return {
      type: 'create_dao',
      description: 'Create Community DAO',
      contractAddress: this.contractAddresses.flowDAO,
      functionName: 'createDAO',
      functionArgs: [
        'Community DAO',                            // name
        'Decentralized community governance',        // description
        'QmDAOGovernance',                          // governance IPFS hash
        'QmDAOTreasury',                            // treasury IPFS hash
        1000                                        // initialTokenSupply
      ],
      value: '0',
      estimatedGas: '300000',
      requiresApproval: true,
      userFriendlyDescription: 'I\'ll create a DAO for your community. This will deploy a new governance contract with voting mechanisms and treasury management.'
    };
  }
  
  private buildRegisterENSAction(intent: Intent): SmartContractAction {
    const { ensName } = intent.parameters;
    
    return {
      type: 'register_ens',
      description: `Register ENS domain: ${ensName}`,
      contractAddress: this.contractAddresses.flowENSIntegration,
      functionName: 'registerDomain',
      functionArgs: [
        ensName,                                    // domain name
        1,                                          // duration in years
        'QmENSMetadata'                             // metadata IPFS hash
      ],
      value: ethers.parseEther('0.01').toString(), // ENS registration cost
      estimatedGas: '100000',
      requiresApproval: true,
      userFriendlyDescription: `I'll register the ENS domain ${ensName} for you. This will secure your blockchain identity on the Ethereum Name Service.`
    };
  }
  
  private buildIssueCredentialAction(intent: Intent): SmartContractAction {
    return {
      type: 'issue_credential',
      description: 'Issue Verifiable Credential',
      contractAddress: this.contractAddresses.flowCredentials,
      functionName: 'issueCredential',
      functionArgs: [
        'user.eth',                                 // subject ENS name
        'KYC_VERIFIED',                             // credential type
        '0x1234567890123456789012345678901234567890', // issuer address
        'QmCredentialMetadata',                      // metadata IPFS hash
        Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60 // expiry (1 year)
      ],
      value: '0',
      estimatedGas: '45000',
      requiresApproval: true,
      userFriendlyDescription: 'I\'ll issue a verifiable credential for you. This will create a tamper-proof credential on the blockchain that can be used for verification.'
    };
  }
  
  private buildSwapTokensAction(intent: Intent): SmartContractAction {
    return {
      type: 'swap_tokens',
      description: 'Swap Tokens',
      contractAddress: this.contractAddresses.flow, // Using main Flow contract for swaps
      functionName: 'swapTokens',
      functionArgs: [
        this.getTokenAddress('USDC'),               // from token
        this.getTokenAddress('ETH'),                // to token
        ethers.parseUnits('100', 6).toString(),     // amount to swap
        0                                           // minimum amount out (0 for now)
      ],
      value: '0',
      estimatedGas: '120000',
      requiresApproval: true,
      userFriendlyDescription: 'I\'ll execute a token swap for you. This will exchange your tokens at the best available rate on the blockchain.'
    };
  }
  
  private getTokenAddress(currency: string): string {
    const tokenAddresses: Record<string, string> = {
      'ETH': '0x0000000000000000000000000000000000000000', // Native ETH
      'USDC': '0xA0b86a33E6441b8c4C8C1C0b0b8c4C8C1C0b0b8', // USDC address
      'USD': '0xA0b86a33E6441b8c4C8C1C0b0b8c4C8C1C0b0b8'  // Same as USDC
    };
    
    return tokenAddresses[currency] || tokenAddresses['USDC'];
  }
}
