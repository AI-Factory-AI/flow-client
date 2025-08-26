import { ethers } from 'ethers';
import { CONTRACT_ABIS } from '../abis/contracts';
import { SUPPORTED_NETWORKS, DEFAULT_NETWORK } from '../abis/constants';
import { SmartContractAction } from './ActionBuilder';

export interface ContractInstance {
  contract: ethers.Contract;
  address: string;
  abi: any;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
  gasUsed?: string;
  blockNumber?: number;
}

export class ContractInteractor {
  private provider: ethers.Provider;
  private signer: ethers.Signer | null = null;
  private contractInstances: Map<string, ContractInstance> = new Map();
  private network: any;
  
  constructor(rpcUrl?: string) {
    this.network = DEFAULT_NETWORK;
    
    if (rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    } else {
      this.provider = new ethers.JsonRpcProvider(this.network.rpcUrl);
    }
  }
  
  async connectWallet(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await web3Provider.getSigner();
        this.provider = web3Provider;
        console.log('Wallet connected:', await this.signer.getAddress());
        return true;
      } else {
        throw new Error('No Web3 provider detected');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }
  
  private getContractInstance(contractName: string): ContractInstance {
    if (this.contractInstances.has(contractName)) {
      return this.contractInstances.get(contractName)!;
    }
    
    const contractAddress = this.network.contracts[contractName];
    const contractABI = CONTRACT_ABIS[contractName];
    
    if (!contractAddress || !contractABI) {
      throw new Error(`Contract ${contractName} not found in network configuration`);
    }
    
    const contract = new ethers.Contract(contractAddress, contractABI, this.provider);
    
    const instance: ContractInstance = {
      contract,
      address: contractAddress,
      abi: contractABI
    };
    
    this.contractInstances.set(contractName, instance);
    return instance;
  }
  
  async executeAction(action: SmartContractAction): Promise<TransactionResult> {
    if (!this.signer) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }
    
    try {
      const contractInstance = this.getContractInstance(this.getContractNameFromAction(action));
      const contractWithSigner = contractInstance.contract.connect(this.signer);
      
      const txParams: any = {
        gasLimit: ethers.parseUnits(action.estimatedGas, 'wei'),
        value: action.value !== '0' ? ethers.parseUnits(action.value, 'wei') : 0
      };
      
      const tx = await contractWithSigner[action.functionName](
        ...action.functionArgs,
        txParams
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        hash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber
      };
      
    } catch (error: any) {
      console.error('Transaction failed:', error);
      return {
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }
  
  async readContract(contractName: string, functionName: string, args: any[] = []): Promise<any> {
    try {
      const contractInstance = this.getContractInstance(contractName);
      const result = await contractInstance.contract[functionName](...args);
      return result;
    } catch (error: any) {
      console.error(`Failed to read from ${contractName}.${functionName}:`, error);
      throw error;
    }
  }
  
  private getContractNameFromAction(action: SmartContractAction): string {
    const contractMap: Record<string, string> = {
      'create_agent': 'flowAgentRegistry',
      'send_payment': 'flowPayments',
      'create_wallet': 'flowMultiSigWallet',
      'create_dao': 'flowDAO',
      'register_ens': 'flowENSIntegration',
      'issue_credential': 'flowCredentials',
      'swap_tokens': 'flow'
    };
    
    return contractMap[action.type] || 'flow';
  }
  
  getCurrentNetwork() {
    return this.network;
  }
  
  isWalletConnected(): boolean {
    return this.signer !== null;
  }
  
  async getConnectedAddress(): Promise<string | null> {
    try {
      return await this.signer?.getAddress() || null;
    } catch {
      return null;
    }
  }
}
