import { ethers } from 'ethers';

export interface ENSOperation {
  type: string;
  ensName?: string;
  description: string;
  cost?: string;
  operation?: string;
  [key: string]: any;
}

export interface ENSProfile {
  ensName: string;
  textRecords: { [key: string]: string };
  description: string;
  url: string;
  avatar: string;
  email: string;
  github: string;
  twitter: string;
  discord: string;
  telegram: string;
}

export class ENSManager {
  private flowENSIntegration: any;
  private provider: any;

  constructor(flowENSIntegration: any, provider: any) {
    this.flowENSIntegration = flowENSIntegration;
    this.provider = provider;
  }

  // Detect ENS commands in user messages
  detectENSCommand(message: string) {
    const ensPatterns = {
      create: /create.*ens.*?([a-zA-Z0-9-]+\.agent\.eth)/i,
      resolve: /resolve.*ens.*?([a-zA-Z0-9-]+\.agent\.eth)/i,
      getText: /get.*text.*records.*?([a-zA-Z0-9-]+\.agent\.eth)/i,
      getTextSimple: /text.*records.*?([a-zA-Z0-9-]+\.agent\.eth)/i,
      setupProfile: /setup.*profile/i,
      setupProfileAlt: /set.*up.*profile/i,
      update: /update.*agent.*profile/i,
      check: /check.*ens.*availability.*?([a-zA-Z0-9-]+\.agent\.eth)/i,
      link: /link.*ens.*wallet/i,
      transfer: /transfer.*ens.*ownership/i
    };

    for (const [command, pattern] of Object.entries(ensPatterns)) {
      const match = message.match(pattern);
      if (match) {
        return { type: command, match, originalMessage: message };
      }
    }
    return null;
  }

  // Process ENS commands and return appropriate responses
  async processENSCommand(ensCommand: any): Promise<{ responseMessage: string; pendingAction: ENSOperation }> {
    const { type, match } = ensCommand;
    
    let responseMessage = '';
    let pendingAction: ENSOperation;

    switch (type) {
      case 'create':
        const cost = await this.getENSOperationCost(match[1], 1);
        const costDisplay = ethers.formatEther(cost) + ' ETH';
        responseMessage = `I'll create the ENS name "${match[1]}" for you. This will cost approximately ${costDisplay} for 1 year. Please confirm:`;
        pendingAction = {
          type: 'ens_create',
          ensName: match[1],
          description: `Create ENS name: ${match[1]}`,
          cost: cost.toString()
        };
        break;

      case 'resolve':
        responseMessage = `I'll resolve the ENS name "${match[1]}" to get the associated address and profile. Please confirm:`;
        pendingAction = {
          type: 'ens_resolve',
          ensName: match[1],
          description: `Resolve ENS name: ${match[1]}`,
          operation: 'resolve'
        };
        break;

      case 'getText':
      case 'getTextSimple':
        responseMessage = `I'll get the text records for the ENS name "${match[1]}". Please confirm:`;
        pendingAction = {
          type: 'ens_get_text',
          ensName: match[1],
          description: `Get text records for: ${match[1]}`,
          operation: 'get_text'
        };
        break;

      case 'setupProfile':
      case 'setupProfileAlt':
        responseMessage = `I'll help you set up your ENS profile! First, let me check what ENS names you own and then we can set up your text records.`;
        pendingAction = {
          type: 'ens_setup_profile',
          description: 'Setup ENS profile',
          operation: 'setup_profile'
        };
        break;

      case 'update':
        responseMessage = `I'll help you update your agent profile. What information would you like to update?`;
        pendingAction = {
          type: 'ens_update',
          description: 'Update agent profile'
        };
        break;

      case 'check':
        responseMessage = `I'll check if "${match[1]}" is available for registration. Please confirm:`;
        pendingAction = {
          type: 'ens_check',
          ensName: match[1],
          description: `Check ENS availability: ${match[1]}`
        };
        break;

      case 'link':
        responseMessage = `I'll link your current wallet address to your ENS name. Please confirm:`;
        pendingAction = {
          type: 'ens_link',
          description: 'Link ENS to wallet'
        };
        break;

      case 'transfer':
        responseMessage = `I'll help you transfer ENS ownership. Please provide the new owner's address.`;
        pendingAction = {
          type: 'ens_transfer',
          description: 'Transfer ENS ownership'
        };
        break;

      default:
        responseMessage = "I understand you want to perform an ENS operation. Please confirm:";
        pendingAction = { description: 'Execute ENS operation', type: 'ens_generic' };
    }

    return { responseMessage, pendingAction };
  }

  // Execute ENS operations
  async executeENSOperation(action: ENSOperation, account: string): Promise<string> {
    if (!this.flowENSIntegration) {
      throw new Error('ENS integration contract not available');
    }

    const { type, ensName, cost } = action;
    
    console.log('Executing ENS operation:', type, 'for ENS name:', ensName);

    try {
      let tx: any;
      
      switch (type) {
        case 'ens_create':
          const duration = 1; // 1 year
          const secret = ethers.randomBytes(32);
          
          let actualCost = cost;
          try {
            const contractCost = await this.flowENSIntegration.getENSRegistrationPrice(ensName, duration);
            if (contractCost && contractCost > 0) {
              const contractCostEth = ethers.formatEther(contractCost);
              if (parseFloat(contractCostEth) <= 1) {
                actualCost = contractCost.toString();
              } else {
                actualCost = '0.01';
              }
            }
          } catch (error) {
            actualCost = '0.01';
          }
          
          const costInWei = ethers.parseEther(actualCost || '0.01');
          
          if (parseFloat(ethers.formatEther(costInWei)) > 1) {
            throw new Error(`ENS registration cost seems too high: ${ethers.formatEther(costInWei)} ETH. Please check the price oracle.`);
          }
          
          if (account) {
            try {
              const balance = await this.provider.getBalance(account);
              if (balance < costInWei) {
                throw new Error(`Insufficient balance. You have ${ethers.formatEther(balance)} ETH but need ${ethers.formatEther(costInWei)} ETH for registration.`);
              }
            } catch (error) {
              console.warn('Could not check balance:', error);
            }
          }
          
          tx = await this.flowENSIntegration.registerENSName(
            ensName,
            duration,
            secret,
            { value: costInWei }
          );
          
          console.log('ENS registration transaction sent:', tx.hash);
          break;

        case 'ens_resolve':
          try {
            const resolvedAddress = await this.flowENSIntegration.resolveENSName(ensName);
            
            if (resolvedAddress === '0x0000000000000000000000000000000000000000' || resolvedAddress === ethers.ZeroAddress) {
              return `ENS name "${ensName}" is not registered or has no address record`;
            } else {
              return `ENS name "${ensName}" resolves to address: ${resolvedAddress}`;
            }
          } catch (error) {
            throw new Error(`Failed to resolve ENS name: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }

        case 'ens_check':
          const isAvailable = await this.flowENSIntegration.isENSNameAvailable(ensName);
          return `ENS name "${ensName}" is ${isAvailable ? 'available' : 'not available'} for registration`;

        case 'ens_get_text':
          try {
            const commonKeys = ['description', 'url', 'avatar', 'email', 'github', 'twitter', 'discord', 'telegram'];
            const textRecords: { [key: string]: string } = {};
            
            for (const key of commonKeys) {
              try {
                const value = await this.flowENSIntegration.getENSTextRecord(ensName, key);
                if (value && value.trim() !== '') {
                  textRecords[key] = value;
                }
              } catch (error) {
                console.log(`No text record found for key: ${key}`);
              }
            }
            
            if (Object.keys(textRecords).length === 0) {
              return `No text records found for ENS name "${ensName}"`;
            } else {
              return `Text records for "${ensName}":\n\n${Object.entries(textRecords).map(([key, value]) => `• ${key}: ${value}`).join('\n')}`;
            }
          } catch (error) {
            throw new Error(`Failed to get text records: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }

        case 'ens_setup_profile':
          try {
            const possibleNames = ['kwame.agent.eth', 'flow.agent.eth', 'agent.eth'];
            let userENSName = '';
            
            for (const name of possibleNames) {
              try {
                const isOwned = await this.flowENSIntegration.isENSNameOwnedBy(name, account);
                if (isOwned) {
                  userENSName = name;
                  break;
                }
              } catch (error) {
                console.log(`Error checking ownership of ${name}:`, error);
              }
            }
            
            if (userENSName) {
              return `Great! I found your ENS name: **${userENSName}**\n\nNow let's set up your profile. You can use these commands:\n\n• **Set description:** "Set description for ${userENSName} to [your description]"\n• **Set website:** "Set website for ${userENSName} to [your URL]"\n• **Set email:** "Set email for ${userENSName} to [your email]"\n• **Set social:** "Set twitter for ${userENSName} to [your handle]"\n\nWhat would you like to set first?`;
            } else {
              return `I couldn't find an ENS name owned by your wallet address (${account}).\n\nTo get started, you can:\n\n• **Create a new ENS name:** "Create agent ENS: kwame.agent.eth"\n• **Check availability:** "Check ENS availability: flow.agent.eth"\n\nWould you like me to help you create a new ENS name?`;
            }
          } catch (error) {
            throw new Error(`Failed to setup ENS profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }

        case 'ens_update':
          try {
            tx = await this.flowENSIntegration.setENSTextRecord(
              ensName || 'myagent.eth',
              'description',
              'Updated via Flow platform'
            );
          } catch (error) {
            throw new Error(`Failed to update ENS record: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        case 'ens_link':
          try {
            const walletName = ensName || 'myagent.eth';
            tx = await this.flowENSIntegration.setENSAddress(
              walletName,
              walletName,
              account
            );
          } catch (error) {
            throw new Error(`Failed to link ENS to wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        case 'ens_transfer':
          throw new Error('Transfer ENS ownership requires new owner address. Please specify the recipient.');

        default:
          throw new Error(`Unknown ENS operation type: ${type}`);
      }

      // For read operations, we've already returned the result
      if (type === 'ens_check' || type === 'ens_resolve' || type === 'ens_get_text' || type === 'ens_setup_profile') {
        return; // This should never be reached due to return statements above
      }

      // For write operations, handle the transaction
      if (tx && typeof tx === 'object' && 'wait' in tx) {
        const receipt = await tx.wait();
        return receipt.hash;
      } else if (typeof tx === 'string') {
        return tx;
      } else {
        return 'Operation completed successfully';
      }
    } catch (error) {
      console.error(`ENS operation failed: ${type}`, error);
      throw error;
    }
  }

  // Get user's ENS profile with text records
  async getUserENSProfile(ensName: string): Promise<ENSProfile | null> {
    if (!this.flowENSIntegration) {
      console.log('No ENS contract available');
      return null;
    }

    try {
      console.log('Getting ENS profile for:', ensName);
      
      const commonKeys = ['description', 'url', 'avatar', 'email', 'github', 'twitter', 'discord', 'telegram'];
      const textRecords: { [key: string]: string } = {};
      
      for (const key of commonKeys) {
        try {
          const value = await this.flowENSIntegration.getENSTextRecord(ensName, key);
          if (value && value.trim() !== '') {
            textRecords[key] = value;
          }
        } catch (error) {
          console.log(`No text record found for key: ${key}`);
        }
      }
      
      return {
        ensName,
        textRecords,
        description: textRecords.description || '',
        url: textRecords.url || '',
        avatar: textRecords.avatar || '',
        email: textRecords.email || '',
        github: textRecords.github || '',
        twitter: textRecords.twitter || '',
        discord: textRecords.discord || '',
        telegram: textRecords.telegram || ''
      };
    } catch (error) {
      console.error('Error getting ENS profile:', error);
      return null;
    }
  }

  // Get ENS operation cost
  async getENSOperationCost(ensName: string, duration: number = 1) {
    if (!this.flowENSIntegration) {
      console.log('No ENS contract available, using default cost');
      return ethers.parseEther('0.01');
    }

    try {
      console.log('Getting ENS registration price for:', ensName, 'duration:', duration);
      const cost = await this.flowENSIntegration.getENSRegistrationPrice(ensName, duration);
      console.log('Raw cost from contract:', cost?.toString());
      
      if (cost && cost > 0) {
        const costInEth = ethers.formatEther(cost);
        console.log('Cost in ETH:', costInEth);
        
        if (parseFloat(costInEth) > 1) {
          console.warn('Cost seems too high, using default:', costInEth, 'ETH');
          return ethers.parseEther('0.01');
        }
        
        return cost;
      }
    } catch (error) {
      console.error('Error getting ENS cost:', error);
      console.log('Using default ENS cost: 0.01 ETH');
    }
    
    console.log('Using default ENS cost: 0.01 ETH');
    return ethers.parseEther('0.01');
  }

  // Check if user owns an ENS name
  async isENSNameOwnedBy(ensName: string, account: string): Promise<boolean> {
    if (!this.flowENSIntegration) {
      return false;
    }

    try {
      return await this.flowENSIntegration.isENSNameOwnedBy(ensName, account);
    } catch (error) {
      console.error('Error checking ENS ownership:', error);
      return false;
    }
  }
}

export const createENSManager = (flowENSIntegration: any, provider: any) => {
  return new ENSManager(flowENSIntegration, provider);
};
