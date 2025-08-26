import { ethers } from 'ethers';
import { CONTRACT_ABIS } from '../abis/contracts';

export interface FlowAgent {
  id: string;
  ensName: string;
  description: string;
  agentType: string;
  capabilities: string[];
  metadata: string;
  owner: string;
  createdAt: number;
  isActive: boolean;
}

export interface FlowCredential {
  id: string;
  ensName: string;
  credentialType: string;
  issuer: string;
  metadata: string;
  issuedAt: number;
  expiresAt: number;
  isRevoked: boolean;
}

export interface FlowTransaction {
  id: string;
  type: 'payment' | 'agent_creation' | 'credential_issuance' | 'wallet_creation' | 'dao_creation';
  description: string;
  txHash: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  gasUsed?: string;
  value?: string;
}

export interface FlowWallet {
  id: string;
  address: string;
  owners: string[];
  requiredSignatures: number;
  description: string;
  createdAt: number;
  balance: string;
}

export interface FlowDAO {
  id: string;
  name: string;
  description: string;
  members: string[];
  votingPeriod: number;
  createdAt: number;
  proposalCount: number;
}

export class FlowDataManager {
  private contracts: any;
  private provider: ethers.Provider;

  constructor(contracts: any, provider: ethers.Provider) {
    this.contracts = contracts;
    this.provider = provider;
  }

  // Load user's agents
  async getUserAgents(userAddress: string): Promise<FlowAgent[]> {
    try {
      if (!this.contracts.flowAgentRegistry) {
        throw new Error('Agent Registry contract not available');
      }

      // Get agent count for the user
      const agentCount = await this.contracts.flowAgentRegistry.getUserAgentCount(userAddress);
      const agents: FlowAgent[] = [];

      for (let i = 0; i < agentCount; i++) {
        try {
          const agentId = await this.contracts.flowAgentRegistry.getUserAgentByIndex(userAddress, i);
          const agent = await this.contracts.flowAgentRegistry.getAgent(agentId);
          
          agents.push({
            id: agentId.toString(),
            ensName: agent.ensName,
            description: agent.description,
            agentType: agent.agentType,
            capabilities: agent.capabilities,
            metadata: agent.metadata,
            owner: agent.owner,
            createdAt: Number(agent.createdAt),
            isActive: agent.isActive
          });
        } catch (error) {
          console.warn(`Error loading agent ${i}:`, error);
        }
      }

      return agents;
    } catch (error) {
      console.error('Error loading user agents:', error);
      return [];
    }
  }

  // Load user's credentials
  async getUserCredentials(userAddress: string): Promise<FlowCredential[]> {
    try {
      if (!this.contracts.flowCredentials) {
        throw new Error('Credentials contract not available');
      }

      // Get credential count for the user
      const credentialCount = await this.contracts.flowCredentials.getUserCredentialCount(userAddress);
      const credentials: FlowCredential[] = [];

      for (let i = 0; i < credentialCount; i++) {
        try {
          const credentialId = await this.contracts.flowCredentials.getUserCredentialByIndex(userAddress, i);
          const credential = await this.contracts.flowCredentials.getCredential(credentialId);
          
          credentials.push({
            id: credentialId.toString(),
            ensName: credential.ensName,
            credentialType: credential.credentialType,
            issuer: credential.issuer,
            metadata: credential.metadata,
            issuedAt: Number(credential.issuedAt),
            expiresAt: Number(credential.expiresAt),
            isRevoked: credential.isRevoked
          });
        } catch (error) {
          console.warn(`Error loading credential ${i}:`, error);
        }
      }

      return credentials;
    } catch (error) {
      console.error('Error loading user credentials:', error);
      return [];
    }
  }

  // Load user's wallets
  async getUserWallets(userAddress: string): Promise<FlowWallet[]> {
    try {
      if (!this.contracts.flowMultiSigWallet) {
        throw new Error('Multi-Sig Wallet contract not available');
      }

      // Get wallet count for the user
      const walletCount = await this.contracts.flowMultiSigWallet.getUserWalletCount(userAddress);
      const wallets: FlowWallet[] = [];

      for (let i = 0; i < walletCount; i++) {
        try {
          const walletId = await this.contracts.flowMultiSigWallet.getUserWalletByIndex(userAddress, i);
          const wallet = await this.contracts.flowMultiSigWallet.getWallet(walletId);
          
          // Get wallet balance
          const balance = await this.provider.getBalance(wallet.address);
          
          wallets.push({
            id: walletId.toString(),
            address: wallet.address,
            owners: wallet.owners,
            requiredSignatures: Number(wallet.requiredSignatures),
            description: wallet.description,
            createdAt: Number(wallet.createdAt),
            balance: ethers.formatEther(balance)
          });
        } catch (error) {
          console.warn(`Error loading wallet ${i}:`, error);
        }
      }

      return wallets;
    } catch (error) {
      console.error('Error loading user wallets:', error);
      return [];
    }
  }

  // Load user's DAOs
  async getUserDAOs(userAddress: string): Promise<FlowDAO[]> {
    try {
      if (!this.contracts.flowDAO) {
        throw new Error('DAO contract not available');
      }

      // Get DAO count for the user
      const daoCount = await this.contracts.flowDAO.getUserDAOCount(userAddress);
      const daos: FlowDAO[] = [];

      for (let i = 0; i < daoCount; i++) {
        try {
          const daoId = await this.contracts.flowDAO.getUserDAOByIndex(userAddress, i);
          const dao = await this.contracts.flowDAO.getDAO(daoId);
          
          // Get proposal count
          const proposalCount = await this.contracts.flowDAO.getDAOProposalCount(daoId);
          
          daos.push({
            id: daoId.toString(),
            name: dao.name,
            description: dao.description,
            members: dao.members,
            votingPeriod: Number(dao.votingPeriod),
            createdAt: Number(dao.createdAt),
            proposalCount: Number(proposalCount)
          });
        } catch (error) {
          console.warn(`Error loading DAO ${i}:`, error);
        }
      }

      return daos;
    } catch (error) {
      console.error('Error loading user DAOs:', error);
      return [];
    }
  }

  // Load platform statistics
  async getPlatformStats(): Promise<any> {
    try {
      if (!this.contracts.flow) {
        throw new Error('Flow contract not available');
      }

      const stats = await this.contracts.flow.getPlatformStats();
      
      return {
        totalAgents: Number(stats.totalAgents),
        totalCredentials: Number(stats.totalCredentials),
        totalTransactions: Number(stats.totalTransactions),
        totalPlatforms: Number(stats.totalPlatforms),
        totalUsers: Number(stats.totalUsers)
      };
    } catch (error) {
      console.error('Error loading platform stats:', error);
      return {
        totalAgents: 0,
        totalCredentials: 0,
        totalTransactions: 0,
        totalPlatforms: 0,
        totalUsers: 0
      };
    }
  }

  // Search agents by ENS name
  async searchAgentsByENS(ensName: string): Promise<FlowAgent[]> {
    try {
      if (!this.contracts.flowAgentRegistry) {
        throw new Error('Agent Registry contract not available');
      }

      // This would need to be implemented in the smart contract
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error searching agents by ENS:', error);
      return [];
    }
  }

  // Get agent by ENS name
  async getAgentByENS(ensName: string): Promise<FlowAgent | null> {
    try {
      if (!this.contracts.flowAgentRegistry) {
        throw new Error('Agent Registry contract not available');
      }

      // This would need to be implemented in the smart contract
      // For now, return null
      return null;
    } catch (error) {
      console.error('Error getting agent by ENS:', error);
      return null;
    }
  }

  // Load recent transactions
  async getRecentTransactions(userAddress: string, limit: number = 10): Promise<FlowTransaction[]> {
    try {
      // This would need to be implemented with event filtering
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error loading recent transactions:', error);
      return [];
    }
  }

  // Subscribe to real-time updates
  subscribeToUpdates(callback: (data: any) => void): () => void {
    // This would set up event listeners for real-time updates
    // For now, return a no-op unsubscribe function
    return () => {};
  }
}

// Factory function
export function createFlowDataManager(contracts: any, provider: ethers.Provider): FlowDataManager {
  return new FlowDataManager(contracts, provider);
}
