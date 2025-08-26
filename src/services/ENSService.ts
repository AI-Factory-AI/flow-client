import { ethers } from 'ethers';
import { CONTRACT_ABIS } from '../abis/contracts';
import { SUPPORTED_NETWORKS } from '../abis/constants';

// ENS Registry ABI (simplified)
const ENS_REGISTRY_ABI = [
  'function owner(bytes32 node) external view returns (address)',
  'function setSubnodeRecord(bytes32 parent, bytes32 label, address owner, address resolver, uint64 ttl) external',
  'function setRecord(bytes32 node, address owner, address resolver, uint64 ttl) external'
];

// ENS Resolver ABI (simplified)
const ENS_RESOLVER_ABI = [
  'function setAddr(bytes32 node, address addr) external',
  'function setText(bytes32 node, string calldata key, string calldata value) external',
  'function addr(bytes32 node) external view returns (address)',
  'function text(bytes32 node, string calldata key) external view returns (string memory)'
];

// ENS Base Registrar ABI (for .eth domains)
const ENS_BASE_REGISTRAR_ABI = [
  'function available(uint256 id) external view returns (bool)',
  'function register(uint256 id, address owner, uint256 duration) external payable',
  'function nameExpires(uint256 id) external view returns (uint256)',
  'function ownerOf(uint256 id) external view returns (address)'
];

export interface ENSName {
  name: string;
  owner: string;
  resolver: string;
  expiryDate?: number;
  isAvailable: boolean;
  price?: string;
}

export interface ENSRegistration {
  name: string;
  duration: number; // in years
  owner: string;
  resolver: string;
  records: Record<string, string>; // key-value pairs for text records
}

export class ENSService {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private ensRegistry: ethers.Contract;
  private ensBaseRegistrar: ethers.Contract;
  private flowENSIntegration: ethers.Contract;
  private flowAgentRegistry: ethers.Contract;
  private flowCredentials: ethers.Contract;
  
  // Real deployed contract addresses from your deployment
  private readonly ENS_REGISTRY_ADDRESS = '0x1234567890123456789012345678901234567890'; // Mock for local testing
  private readonly ENS_BASE_REGISTRAR_ADDRESS = '0x1234567890123456789012345678901234567890'; // Mock for local testing
  private readonly ENS_PUBLIC_RESOLVER_ADDRESS = '0xe24DF601F19e18843a7bA1766E42a0a432D7324C'; // Real address from deployment
  
  // Flow platform contract addresses
  private readonly FLOW_ENS_INTEGRATION_ADDRESS = '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1';
  private readonly FLOW_AGENT_REGISTRAR_ADDRESS = '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e';
  private readonly FLOW_CREDENTIALS_ADDRESS = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';

  constructor(provider: ethers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    
    // Initialize ENS contracts
    this.ensRegistry = new ethers.Contract(this.ENS_REGISTRY_ADDRESS, ENS_REGISTRY_ABI, signer);
    this.ensBaseRegistrar = new ethers.Contract(this.ENS_BASE_REGISTRAR_ADDRESS, ENS_BASE_REGISTRAR_ABI, signer);
    
    // Initialize Flow platform contracts
    this.flowENSIntegration = new ethers.Contract(
      this.FLOW_ENS_INTEGRATION_ADDRESS, 
      CONTRACT_ABIS.flowENSIntegration, 
      signer
    );
    this.flowAgentRegistry = new ethers.Contract(
      this.FLOW_AGENT_REGISTRAR_ADDRESS, 
      CONTRACT_ABIS.flowAgentRegistry, 
      signer
    );
    this.flowCredentials = new ethers.Contract(
      this.FLOW_CREDENTIALS_ADDRESS, 
      CONTRACT_ABIS.flowCredentials, 
      signer
    );
  }

  // Check if an ENS name is available
  async isNameAvailable(name: string): Promise<boolean> {
    try {
      const nameHash = ethers.namehash(name);
      const owner = await this.ensRegistry.owner(nameHash);
      return owner === ethers.ZeroAddress;
    } catch (error) {
      console.error('Error checking ENS name availability:', error);
      return false;
    }
  }

  // Get ENS name information
  async getNameInfo(name: string): Promise<ENSName> {
    try {
      const nameHash = ethers.namehash(name);
      const owner = await this.ensRegistry.owner(nameHash);
      const isAvailable = owner === ethers.ZeroAddress;
      
      let expiryDate: number | undefined;
      let price: string | undefined;
      
      if (!isAvailable) {
        // Check if it's a .eth domain and get expiry
        const labelHash = ethers.keccak256(ethers.toUtf8Bytes(name.split('.')[0]));
        try {
          expiryDate = Number(await this.ensBaseRegistrar.nameExpires(labelHash));
        } catch (e) {
          // Not a .eth domain or other error
        }
      } else {
        // Calculate registration price for available names
        price = await this.calculateRegistrationPrice(name);
      }

      return {
        name,
        owner,
        resolver: ethers.ZeroAddress, // Will be set during registration
        expiryDate,
        isAvailable,
        price
      };
    } catch (error) {
      console.error('Error getting ENS name info:', error);
      throw error;
    }
  }

  // Calculate registration price for a .eth domain
  private async calculateRegistrationPrice(name: string): Promise<string> {
    // ENS pricing is based on name length and demand
    // This is a simplified calculation
    const nameLength = name.split('.')[0].length;
    
    if (nameLength <= 3) {
      return '0.1 ETH'; // Premium short names
    } else if (nameLength <= 5) {
      return '0.05 ETH'; // Short names
    } else if (nameLength <= 10) {
      return '0.02 ETH'; // Medium names
    } else {
      return '0.01 ETH'; // Long names
    }
  }

  // Register a new .eth domain
  async registerDomain(name: string, duration: number = 1): Promise<string> {
    try {
      // Validate name format
      if (!this.isValidENSName(name)) {
        throw new Error('Invalid ENS name format');
      }

      // Check availability
      if (!(await this.isNameAvailable(name))) {
        throw new Error('ENS name is not available');
      }

      // Extract label (part before .eth)
      const label = name.split('.')[0];
      const labelHash = ethers.keccak256(ethers.toUtf8Bytes(label));

      // Calculate cost
      const cost = await this.calculateRegistrationCost(name, duration);

      // Register the domain
      const tx = await this.ensBaseRegistrar.register(labelHash, await this.signer.getAddress(), duration, {
        value: cost
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Set up resolver and records
      await this.setupDomainRecords(name);

      return receipt.hash;
    } catch (error) {
      console.error('Error registering ENS domain:', error);
      throw error;
    }
  }

  // Calculate registration cost
  private async calculateRegistrationCost(name: string, duration: number): Promise<bigint> {
    // This would integrate with ENS price oracle in production
    // For now, using simplified pricing
    const basePrice = ethers.parseEther('0.01'); // Base price per year
    return basePrice * BigInt(duration);
  }

  // Set up domain records (resolver, address, text records)
  private async setupDomainRecords(name: string): Promise<void> {
    try {
      const nameHash = ethers.namehash(name);
      const signerAddress = await this.signer.getAddress();

      // Set resolver
      await this.ensRegistry.setRecord(
        nameHash,
        signerAddress,
        this.ENS_PUBLIC_RESOLVER_ADDRESS,
        0 // TTL = 0 (no caching)
      );

      // Set address record
      const resolver = new ethers.Contract(this.ENS_PUBLIC_RESOLVER_ADDRESS, ENS_RESOLVER_ABI, this.signer);
      await resolver.setAddr(nameHash, signerAddress);

      // Set basic text records
      await resolver.setText(nameHash, 'description', 'ENS domain registered via Flow platform');
      await resolver.setText(nameHash, 'created', new Date().toISOString());
      await resolver.setText(nameHash, 'platform', 'Flow');

    } catch (error) {
      console.error('Error setting up domain records:', error);
      throw error;
    }
  }

  // Create a subdomain
  async createSubdomain(parentDomain: string, subdomain: string, owner: string): Promise<string> {
    try {
      const parentHash = ethers.namehash(parentDomain);
      const labelHash = ethers.keccak256(ethers.toUtf8Bytes(subdomain));
      const fullName = `${subdomain}.${parentDomain}`;

      // Check if subdomain is available
      if (!(await this.isNameAvailable(fullName))) {
        throw new Error('Subdomain is not available');
      }

      // Create subdomain
      const tx = await this.ensRegistry.setSubnodeRecord(
        parentHash,
        labelHash,
        owner,
        this.ENS_PUBLIC_RESOLVER_ADDRESS,
        0
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error creating subdomain:', error);
      throw error;
    }
  }

  // Transfer ENS name ownership
  async transferOwnership(name: string, newOwner: string): Promise<string> {
    try {
      const nameHash = ethers.namehash(name);
      
      // Check if caller is current owner
      const currentOwner = await this.ensRegistry.owner(nameHash);
      const signerAddress = await this.signer.getAddress();
      
      if (currentOwner !== signerAddress) {
        throw new Error('Only the current owner can transfer ownership');
      }

      // Transfer ownership
      const tx = await this.ensRegistry.setRecord(
        nameHash,
        newOwner,
        this.ENS_PUBLIC_RESOLVER_ADDRESS,
        0
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error transferring ENS ownership:', error);
      throw error;
    }
  }

  // Set text record for ENS name
  async setTextRecord(name: string, key: string, value: string): Promise<string> {
    try {
      const nameHash = ethers.namehash(name);
      const resolver = new ethers.Contract(this.ENS_PUBLIC_RESOLVER_ADDRESS, ENS_RESOLVER_ABI, this.signer);
      
      const tx = await resolver.setText(nameHash, key, value);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error setting text record:', error);
      throw error;
    }
  }

  // Get text record from ENS name
  async getTextRecord(name: string, key: string): Promise<string> {
    try {
      const nameHash = ethers.namehash(name);
      const resolver = new ethers.Contract(this.ENS_PUBLIC_RESOLVER_ADDRESS, ENS_RESOLVER_ABI, this.provider);
      
      return await resolver.text(nameHash, key);
    } catch (error) {
      console.error('Error getting text record:', error);
      return '';
    }
  }

  // Resolve ENS name to address
  async resolveName(name: string): Promise<string> {
    try {
      const nameHash = ethers.namehash(name);
      const resolver = new ethers.Contract(this.ENS_PUBLIC_RESOLVER_ADDRESS, ENS_RESOLVER_ABI, this.provider);
      
      return await resolver.addr(nameHash);
      } catch (error) {
      console.error('Error resolving ENS name:', error);
      return ethers.ZeroAddress;
    }
  }

  // Get all text records for an ENS name
  async getAllTextRecords(name: string): Promise<Record<string, string>> {
    try {
      const nameHash = ethers.namehash(name);
      const resolver = new ethers.Contract(this.ENS_PUBLIC_RESOLVER_ADDRESS, ENS_RESOLVER_ABI, this.provider);
      
      // Common text record keys
      const commonKeys = [
        'description', 'email', 'url', 'avatar', 'notice', 'keywords',
        'com.twitter', 'com.github', 'com.discord', 'com.telegram',
        'created', 'updated', 'platform', 'version'
      ];

      const records: Record<string, string> = {};
      
      for (const key of commonKeys) {
        try {
          const value = await resolver.text(nameHash, key);
          if (value && value !== '') {
            records[key] = value;
          }
        } catch (e) {
          // Skip if record doesn't exist
        }
      }

      return records;
    } catch (error) {
      console.error('Error getting all text records:', error);
      return {};
    }
  }

  // Validate ENS name format
  private isValidENSName(name: string): boolean {
    // Basic validation: lowercase letters, numbers, hyphens, ends with .eth
    const ensPattern = /^[a-z0-9-]+\.eth$/;
    return ensPattern.test(name) && name.length >= 3 && name.length <= 64;
  }

  // Get suggested ENS names based on input
  getSuggestedNames(input: string): string[] {
    const suggestions: string[] = [];
    const cleanInput = input.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (cleanInput.length > 0) {
      // Direct match
      suggestions.push(`${cleanInput}.eth`);
      
      // With common suffixes
      const suffixes = ['business', 'personal', 'defi', 'nft', 'dao', 'agent', 'community'];
      suffixes.forEach(suffix => {
        suggestions.push(`${cleanInput}.${suffix}.eth`);
      });
      
      // With common prefixes
      const prefixes = ['my', 'the', 'our', 'best', 'top'];
      prefixes.forEach(prefix => {
        suggestions.push(`${prefix}.${cleanInput}.eth`);
      });
    }
    
    return suggestions.slice(0, 10); // Limit to 10 suggestions
  }

  // Check if user owns an ENS name
  async isNameOwnedByUser(name: string, userAddress: string): Promise<boolean> {
    try {
      const nameHash = ethers.namehash(name);
      const owner = await this.ensRegistry.owner(nameHash);
      return owner.toLowerCase() === userAddress.toLowerCase();
    } catch (error) {
      console.error('Error checking name ownership:', error);
      return false;
    }
  }

  // Get user's owned ENS names
  async getUserOwnedNames(userAddress: string): Promise<string[]> {
    // Note: This would require indexing or scanning events
    // In production, you'd use a service like The Graph
    try {
      // For now, return empty array
      // In production, this would query indexed ENS events
      return [];
    } catch (error) {
      console.error('Error getting user owned names:', error);
      return [];
    }
  }

  // Renew ENS domain
  async renewDomain(name: string, additionalYears: number = 1): Promise<string> {
    try {
      const label = name.split('.')[0];
      const labelHash = ethers.keccak256(ethers.toUtf8Bytes(label));
      
      // Calculate renewal cost
      const cost = await this.calculateRegistrationCost(name, additionalYears);
      
      // Renew the domain
      const tx = await this.ensBaseRegistrar.register(labelHash, await this.signer.getAddress(), additionalYears, {
        value: cost
      });
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error renewing ENS domain:', error);
      throw error;
    }
  }

  // ===== FLOW PLATFORM INTEGRATION METHODS =====

  // Create an AI agent with ENS name
  async createAgentWithENS(ensName: string, description: string, agentType: string, capabilities: string[]): Promise<string> {
    try {
      // First check if ENS name is available
      if (!(await this.isNameAvailable(ensName))) {
        throw new Error('ENS name is not available');
      }

      // Register the ENS name first
      await this.registerDomain(ensName);

      // Create the agent using Flow platform
      const tx = await this.flowAgentRegistry.registerAgent(
        ensName,
        description,
        agentType,
        capabilities,
        `Qm${ensName}Metadata` // IPFS hash placeholder
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error creating agent with ENS:', error);
      throw error;
    }
  }

  // Issue credential for an ENS name
  async issueCredentialForENS(ensName: string, credentialType: string, issuer: string, metadata: string): Promise<string> {
    try {
      // Issue credential using Flow platform
      const tx = await this.flowCredentials.issueCredential(
        ensName,
        credentialType,
        issuer,
        metadata,
        Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60 // 1 year expiry
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error issuing credential for ENS:', error);
      throw error;
    }
  }

  // Get agent information by ENS name
  async getAgentByENS(ensName: string): Promise<any> {
    try {
      // This would integrate with your agent registry
      // For now, return basic info
      const nameHash = ethers.namehash(ensName);
      const owner = await this.ensRegistry.owner(nameHash);
      
      return {
        ensName,
        owner,
        isRegistered: owner !== ethers.ZeroAddress,
        platform: 'Flow'
      };
    } catch (error) {
      console.error('Error getting agent by ENS:', error);
      throw error;
    }
  }

  // Get network configuration
  getCurrentNetwork(): any {
    // Get current network from provider
    try {
      // Access network safely
      const network = (this.provider as any).network;
      if (network && network.chainId) {
        return SUPPORTED_NETWORKS.find(n => n.chainId === network.chainId) || SUPPORTED_NETWORKS[1]; // Default to Ethereum Sepolia
      }
    } catch (error) {
      console.log('Could not determine network, using default');
    }
    return SUPPORTED_NETWORKS[1]; // Default to Ethereum Sepolia
  }

  // Get contract addresses for current network
  getContractAddresses(): any {
    const network = this.getCurrentNetwork();
    return network.contracts;
  }
}

// Factory function to create ENS service
export function createENSService(provider: ethers.Provider, signer: ethers.Signer): ENSService {
  return new ENSService(provider, signer);
}
