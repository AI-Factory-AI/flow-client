// Common types and interfaces for Flow platform contracts

export interface Transaction {
  id: number;
  from: string;
  to: string;
  amount: string;
  token: string;
  txType: TransactionType;
  status: TransactionStatus;
  gasFee: string;
  blockNumber: number;
  timestamp: number;
  description: string;
  agentId: string;
  isAgentTransaction: boolean;
}

export enum TransactionType {
  Send = 0,
  Receive = 1,
  Swap = 2,
  Stake = 3,
  Unstake = 4,
  Yield = 5,
  Bridge = 6,
  MultiSig = 7
}

export enum TransactionStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  Cancelled = 3,
  Processing = 4
}

export interface SupportedToken {
  tokenAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  isStablecoin: boolean;
  isActive: boolean;
  minAmount: string;
  maxAmount: string;
}

export interface PaymentRoute {
  routeId: number;
  path: string[];
  tokens: string[];
  amounts: string[];
  totalFee: string;
  isActive: boolean;
}

export interface MultiSigWallet {
  id: number;
  ensName: string;
  description: string;
  owners: string[];
  requiredApprovals: number;
  balance: string;
  isActive: boolean;
  createdAt: number;
  lastActivity: number;
  walletType: WalletType;
}

export enum WalletType {
  Personal = 0,
  Business = 1,
  DAO = 2,
  Community = 3,
  Treasury = 4,
  Investment = 5,
  Escrow = 6,
  Foundation = 7
}

export interface Proposal {
  id: number;
  walletId: number;
  proposer: string;
  recipient: string;
  amount: string;
  token: string;
  description: string;
  approvalCount: number;
  executed: boolean;
  createdAt: number;
  expiryTime: number;
  proposalType: ProposalType;
}

export enum ProposalType {
  Payment = 0,
  TokenTransfer = 1,
  ContractCall = 2,
  OwnerChange = 3,
  ThresholdChange = 4,
  Emergency = 5
}

export interface DAOProposal {
  id: number;
  daoId: number;
  title: string;
  description: string;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  startTime: number;
  endTime: number;
  executed: boolean;
  cancelled: boolean;
  proposer: string;
  proposalType: DAOProposalType;
  requiredQuorum: number;
}

export enum DAOProposalType {
  General = 0,
  Treasury = 1,
  Governance = 2,
  Emergency = 3
}

export enum Vote {
  Against = 0,
  For = 1,
  Abstain = 2
}

export interface Credential {
  id: number;
  recipient: string;
  name: string;
  description: string;
  credentialType: CredentialType;
  score: number;
  icon: string;
  expiryDate: number;
  metadata: string;
  issuer: string;
  createdAt: number;
}

export enum CredentialType {
  Skill = 0,
  Badge = 1,
  Certification = 2,
  Reputation = 3,
  Identity = 4
}

export interface Agent {
  id: number;
  name: string;
  description: string;
  owner: string;
  agentType: AgentType;
  capabilities: string[];
  isActive: boolean;
  createdAt: number;
  lastActivity: number;
}

export enum AgentType {
  Personal = 0,
  Business = 1,
  Financial = 2,
  Governance = 3,
  Community = 4
}

export interface AgentAction {
  actionId: number;
  agentId: number;
  actionType: AgentActionType;
  target: string;
  amount: string;
  token: string;
  description: string;
  isApproved: boolean;
  isExecuted: boolean;
  createdAt: number;
  approvedAt: number;
  executedAt: number;
}

export enum AgentActionType {
  Payment = 0,
  Swap = 1,
  Stake = 2,
  Credential = 3,
  Governance = 4
}

export enum ActionStatus {
  Pending = 0,
  Approved = 1,
  Executed = 2,
  Rejected = 3,
  Expired = 4
}

// Contract addresses interface
export interface ContractAddresses {
  flow: string;
  flowPayments: string;
  flowMultiSigWallet: string;
  flowDAO: string;
  flowENSIntegration: string;
  flowCredentials: string;
  flowAgentRegistry: string;
  flowAgentIntegration: string;
}

// Network configuration
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  contracts: ContractAddresses;
}
