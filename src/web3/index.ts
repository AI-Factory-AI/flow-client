// Web3 Integration Services for Flow Platform

// Core Web3 Provider
export { FlowWeb3Provider, useFlowWeb3 } from './FlowWeb3Provider';

// Action Execution
export { FlowActionExecutor, createFlowActionExecutor } from './FlowActionExecutor';
export type { FlowAction, ExecutionResult } from './FlowActionExecutor';

// Data Management
export { FlowDataManager, createFlowDataManager } from './FlowDataManager';
export type { 
  FlowAgent, 
  FlowCredential, 
  FlowTransaction, 
  FlowWallet, 
  FlowDAO 
} from './FlowDataManager';

// ENS Management
export { ENSManager, createENSManager } from './ENSManager';
export type { ENSOperation, ENSProfile } from './ENSManager';

// Blockchain Utilities
export { BlockchainUtils, SUPPORTED_NETWORKS } from './BlockchainUtils';
export type { NetworkInfo } from './BlockchainUtils';

// Chat Message Handling
export { ChatMessageHandler, createChatMessageHandler } from './ChatMessageHandler';
export type { ChatMessage, MessageContext } from './ChatMessageHandler';

// User Profile Management
export { UserProfileManager, createUserProfileManager } from './UserProfileManager';
export type { UserProfile } from './UserProfileManager';

// Re-export ethers for convenience
export { ethers } from 'ethers';

// Re-export contract ABIs and constants
export { CONTRACT_ABIS } from '../abis/contracts';
