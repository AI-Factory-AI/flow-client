import { ethers } from 'ethers';
import { CONTRACT_ABIS } from '../abis/contracts';

export interface FlowAction {
  type: 'create_agent' | 'send_payment' | 'create_wallet' | 'create_dao' | 'issue_credential' | 'swap_tokens' | 'stake_tokens';
  description: string;
  parameters: Record<string, any>;
  requiresApproval: boolean;
  estimatedGas?: string;
  smartContractCall?: {
    contract: string;
    function: string;
    args: any[];
    value?: string;
  };
}

export interface ExecutionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: string;
  status: 'pending' | 'completed' | 'failed';
}

export class FlowActionExecutor {
  private contracts: any;
  private signer: ethers.Signer;

  constructor(contracts: any, signer: ethers.Signer) {
    this.contracts = contracts;
    this.signer = signer;
  }

  async executeAction(action: FlowAction): Promise<ExecutionResult> {
    try {
      console.log(`Executing Flow action: ${action.type}`, action);

      let tx: any;
      let result: ExecutionResult = {
        success: false,
        status: 'pending'
      };

      switch (action.type) {
        case 'create_agent':
          tx = await this.createAgent(action.parameters);
          break;

        case 'send_payment':
          tx = await this.sendPayment(action.parameters);
          break;

        case 'create_wallet':
          tx = await this.createWallet(action.parameters);
          break;

        case 'create_dao':
          tx = await this.createDAO(action.parameters);
          break;

        case 'issue_credential':
          tx = await this.issueCredential(action.parameters);
          break;

        default:
          throw new Error(`Unsupported action type: ${action.type}`);
      }

      if (tx) {
        result.txHash = tx.hash;
        result.status = 'pending';

        // Wait for confirmation
        const receipt = await tx.wait();
        result.status = 'completed';
        result.success = true;
        result.gasUsed = ethers.formatEther(receipt.gasUsed * receipt.gasPrice);

        console.log(`Action executed successfully: ${action.type}`, result);
      }

      return result;

    } catch (error) {
      console.error(`Error executing action ${action.type}:`, error);
      
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async createAgent(parameters: any) {
    const {
      ensName = 'agent.eth',
      description = 'AI Agent',
      agentType = 'Personal',
      capabilities = ['AI', 'automation'],
      metadata = ''
    } = parameters;

    return await this.contracts.flowAgentRegistry.registerAgent(
      ensName,
      description,
      agentType,
      capabilities,
      metadata
    );
  }

  private async sendPayment(parameters: any) {
    const {
      recipient = 'recipient.eth',
      amount = '0',
      token = ethers.ZeroAddress,
      description = 'Payment',
      agentId = '0'
    } = parameters;

    // Convert amount to wei if it's ETH
    let paymentAmount = amount;
    if (token === ethers.ZeroAddress) {
      paymentAmount = ethers.parseEther(amount);
    }

    return await this.contracts.flowPayments.sendPaymentToENS(
      recipient,
      paymentAmount,
      token,
      description,
      agentId
    );
  }

  private async createWallet(parameters: any) {
    const {
      owners = [await this.signer.getAddress()],
      requiredSignatures = 1,
      description = 'Multi-sig wallet'
    } = parameters;

    return await this.contracts.flowMultiSigWallet.createWallet(
      owners,
      requiredSignatures,
      description
    );
  }

  private async createDAO(parameters: any) {
    const {
      name = 'Community DAO',
      description = 'Community governance',
      members = [await this.signer.getAddress()],
      votingPeriod = 86400 // 1 day
    } = parameters;

    return await this.contracts.flowDAO.createDAO(
      name,
      description,
      members,
      votingPeriod
    );
  }

  private async issueCredential(parameters: any) {
    const {
      ensName = 'recipient.eth',
      credentialType = 'Badge',
      issuer = await this.signer.getAddress(),
      metadata = 'Credential',
      expiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60 // 1 year
    } = parameters;

    return await this.contracts.flowCredentials.issueCredential(
      ensName,
      credentialType,
      issuer,
      metadata,
      expiry
    );
  }

  // Estimate gas for an action
  async estimateGas(action: FlowAction): Promise<string> {
    try {
      const gasEstimates: Record<string, number> = {
        create_agent: 150000,
        send_payment: 65000,
        create_wallet: 200000,
        create_dao: 300000,
        issue_credential: 45000,
      };

      const gasLimit = gasEstimates[action.type] || 100000;
      const gasPrice = await this.signer.provider?.getFeeData();
      
      if (gasPrice?.gasPrice) {
        const totalCost = gasLimit * Number(gasPrice.gasPrice);
        return ethers.formatEther(totalCost);
      }

      return `${gasLimit} gas units`;
    } catch (error) {
      console.error('Error estimating gas:', error);
      return 'Unknown';
    }
  }

  // Get transaction status
  async getTransactionStatus(txHash: string): Promise<'pending' | 'completed' | 'failed'> {
    try {
      const receipt = await this.signer.provider?.getTransactionReceipt(txHash);
      
      if (!receipt) return 'pending';
      if (receipt.status === 1) return 'completed';
      return 'failed';
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return 'failed';
    }
  }

  // Batch execute multiple actions
  async executeBatch(actions: FlowAction[]): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    
    for (const action of actions) {
      const result = await this.executeAction(action);
      results.push(result);
      
      // Wait a bit between actions to avoid nonce issues
      if (action !== actions[actions.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

// Factory function
export function createFlowActionExecutor(contracts: any, signer: ethers.Signer): FlowActionExecutor {
  return new FlowActionExecutor(contracts, signer);
}
