// Blockchain utility functions for Flow Platform

export interface NetworkInfo {
  chainId: number;
  name: string;
  explorer: string;
  explorerName: string;
}

export const SUPPORTED_NETWORKS: { [chainId: number]: NetworkInfo } = {
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    explorer: 'https://etherscan.io',
    explorerName: 'Etherscan'
  },
  11155111: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    explorer: 'https://sepolia.etherscan.io',
    explorerName: 'Sepolia Etherscan'
  },
  137: {
    chainId: 137,
    name: 'Polygon',
    explorer: 'https://polygonscan.com',
    explorerName: 'PolygonScan'
  },
  42161: {
    chainId: 42161,
    name: 'Arbitrum',
    explorer: 'https://arbiscan.io',
    explorerName: 'Arbiscan'
  },
  10: {
    chainId: 10,
    name: 'Optimism',
    explorer: 'https://optimistic.etherscan.io',
    explorerName: 'Optimistic Etherscan'
  },
  8453: {
    chainId: 8453,
    name: 'Base',
    explorer: 'https://basescan.org',
    explorerName: 'BaseScan'
  },
  31337: {
    chainId: 31337,
    name: 'Hardhat/Local',
    explorer: '#',
    explorerName: 'Local Network'
  }
};

export class BlockchainUtils {
  // Get blockchain explorer URL for transaction verification
  static getExplorerUrl(chainId: number, txHash: string): string {
    const network = SUPPORTED_NETWORKS[chainId];
    if (!network) {
      // Default to Etherscan for unknown networks
      return `https://etherscan.io/tx/${txHash}`;
    }
    
    if (chainId === 31337) {
      // Local network - no external explorer
      return '#';
    }
    
    return `${network.explorer}/tx/${txHash}`;
  }

  // Get blockchain explorer name for display
  static getExplorerName(chainId: number): string {
    const network = SUPPORTED_NETWORKS[chainId];
    return network ? network.explorerName : 'Etherscan';
  }

  // Get network information by chain ID
  static getNetworkInfo(chainId: number): NetworkInfo | null {
    return SUPPORTED_NETWORKS[chainId] || null;
  }

  // Check if a network is supported
  static isNetworkSupported(chainId: number): boolean {
    return chainId in SUPPORTED_NETWORKS;
  }

  // Check if a network is a testnet
  static isTestnet(chainId: number): boolean {
    return chainId === 11155111; // Sepolia
  }

  // Check if a network is local/development
  static isLocalNetwork(chainId: number): boolean {
    return chainId === 31337; // Hardhat/Local
  }

  // Format transaction hash for display
  static formatTxHash(txHash: string, length: number = 8): string {
    if (!txHash || txHash.length < length * 2) {
      return txHash;
    }
    return `${txHash.slice(0, length)}...${txHash.slice(-length)}`;
  }

  // Extract transaction hash from various formats
  static extractTxHash(text: string): string | null {
    const txPatterns = [
      /Tx: (0x[a-fA-F0-9]+)/,           // "Tx: 0x..."
      /Transaction: (0x[a-fA-F0-9]+)/,   // "Transaction: 0x..."
      /Hash: (0x[a-fA-F0-9]+)/,          // "Hash: 0x..."
      /0x[a-fA-F0-9]{64}/                // Any 64-character hex string
    ];
    
    for (const pattern of txPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    
    return null;
  }

  // Get transaction verification link text
  static getVerificationLinkText(chainId: number, txHash: string): string {
    if (this.isLocalNetwork(chainId)) {
      return '🔍 *Local transaction - cannot verify externally*';
    }
    
    const explorerName = this.getExplorerName(chainId);
    const explorerUrl = this.getExplorerUrl(chainId, txHash);
    
    return `🔍 [Verify on ${explorerName}](${explorerUrl})`;
  }

  // Format balance for display
  static formatBalance(balance: bigint, decimals: number = 18): string {
    const balanceInEth = Number(balance) / Math.pow(10, decimals);
    return balanceInEth.toFixed(6);
  }

  // Validate Ethereum address format
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Validate ENS name format
  static isValidENSName(name: string): boolean {
    return /^[a-zA-Z0-9-]+\.(eth|agent\.eth)$/.test(name);
  }
}
