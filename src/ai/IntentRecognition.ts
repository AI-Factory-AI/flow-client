export type IntentType = 
  | 'create_agent' 
  | 'send_payment' 
  | 'create_wallet' 
  | 'create_dao' 
  | 'issue_credential' 
  | 'register_ens' 
  | 'swap_tokens' 
  | 'stake_tokens'
  | 'unknown';

export interface Intent {
  type: IntentType;
  confidence: number;
  parameters: Record<string, any>;
  description: string;
}

export class IntentRecognition {
  
  // Simple pattern matching for fast intent recognition
  recognizeIntent(userMessage: string): Intent {
    const message = userMessage.toLowerCase();
    
    // Create Agent Intent
    if (this.matchesPattern(message, ['create', 'set up', 'make', 'build'], ['agent', 'ai agent', 'bot'])) {
      const agentType = this.extractAgentType(message);
      return {
        type: 'create_agent',
        confidence: 0.95,
        parameters: { agentType },
        description: `Create ${agentType} AI Agent`
      };
    }
    
    // Send Payment Intent
    if (this.matchesPattern(message, ['send', 'transfer', 'pay'], ['payment', 'money', 'tokens', 'eth', 'usdc'])) {
      const { amount, currency, recipient } = this.extractPaymentDetails(message);
      return {
        type: 'send_payment',
        confidence: 0.90,
        parameters: { amount, currency, recipient },
        description: `Send ${amount} ${currency} to ${recipient}`
      };
    }
    
    // Create Wallet Intent
    if (this.matchesPattern(message, ['create', 'set up', 'make'], ['wallet', 'multisig', 'multi-sig'])) {
      return {
        type: 'create_wallet',
        confidence: 0.85,
        parameters: {},
        description: 'Create Multi-Signature Wallet'
      };
    }
    
    // Create DAO Intent
    if (this.matchesPattern(message, ['create', 'set up', 'start'], ['dao', 'community', 'governance'])) {
      return {
        type: 'create_dao',
        confidence: 0.80,
        parameters: {},
        description: 'Create Community DAO'
      };
    }
    
    // Register ENS Intent
    if (this.matchesPattern(message, ['register', 'get', 'buy'], ['ens', 'domain', '.eth'])) {
      const ensName = this.extractENSName(message);
      return {
        type: 'register_ens',
        confidence: 0.85,
        parameters: { ensName },
        description: `Register ENS domain: ${ensName}`
      };
    }
    
    // Issue Credential Intent
    if (this.matchesPattern(message, ['issue', 'create', 'give'], ['credential', 'verification', 'trust'])) {
      return {
        type: 'issue_credential',
        confidence: 0.75,
        parameters: {},
        description: 'Issue Verifiable Credential'
      };
    }
    
    // Swap Tokens Intent
    if (this.matchesPattern(message, ['swap', 'exchange', 'trade'], ['tokens', 'eth', 'usdc'])) {
      return {
        type: 'swap_tokens',
        confidence: 0.80,
        parameters: {},
        description: 'Swap Tokens'
      };
    }
    
    // Unknown Intent
    return {
      type: 'unknown',
      confidence: 0.0,
      parameters: {},
      description: 'I\'m not sure what you want to do'
    };
  }
  
  private matchesPattern(message: string, actionWords: string[], targetWords: string[]): boolean {
    const hasAction = actionWords.some(word => message.includes(word));
    const hasTarget = targetWords.some(word => message.includes(word));
    return hasAction && hasTarget;
  }
  
  private extractAgentType(message: string): string {
    if (message.includes('business')) return 'Business';
    if (message.includes('personal')) return 'Personal';
    if (message.includes('defi')) return 'DeFi';
    if (message.includes('nft')) return 'NFT';
    if (message.includes('dao')) return 'DAO';
    return 'Personal';
  }
  
  private extractPaymentDetails(message: string): { amount: string; currency: string; recipient: string } {
    // Extract amount and currency
    const amountMatch = message.match(/(\d+(?:\.\d+)?)\s*(eth|usdc|usd)/i);
    const amount = amountMatch ? amountMatch[1] : '0';
    const currency = amountMatch ? amountMatch[2].toUpperCase() : 'USDC';
    
    // Extract recipient (look for .eth addresses)
    const recipientMatch = message.match(/([a-z0-9-]+\.eth)/i);
    const recipient = recipientMatch ? recipientMatch[1] : 'recipient.eth';
    
    return { amount, currency, recipient };
  }
  
  private extractENSName(message: string): string {
    const ensMatch = message.match(/([a-z0-9-]+\.eth)/i);
    return ensMatch ? ensMatch[1] : 'example.eth';
  }
}
