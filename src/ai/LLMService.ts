import { ethers } from 'ethers';
import { CONTRACT_ABIS } from '../abis/contracts';
import { SUPPORTED_NETWORKS } from '../abis/constants';

// LLM Provider Types
export type LLMProvider = 'openai' | 'anthropic' | 'local' | 'custom' | 'openrouter';

// LLM Configuration
export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  siteUrl?: string;
  siteName?: string;
}

// Action Types that LLM can generate
export interface LLMAction {
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

// LLM Response
export interface LLMResponse {
  message: string;
  action?: LLMAction;
  suggestions?: string[];
  confidence: number;
}

// Smart Contract Integration
export interface SmartContractCall {
  contractAddress: string;
  functionName: string;
  functionArgs: any[];
  value?: string;
  gasEstimate?: string;
}

export class LLMService {
  private config: LLMConfig;
  private provider: any;
  private contractAddresses: any;

  constructor(config: LLMConfig) {
    this.config = config;
    this.initializeProvider();
    this.contractAddresses = this.getContractAddresses();
  }

  private initializeProvider() {
    switch (this.config.provider) {
      case 'openai':
        this.initializeOpenAI();
        break;
      case 'anthropic':
        this.initializeAnthropic();
        break;
      case 'local':
        this.initializeLocal();
        break;
      case 'custom':
        this.initializeCustom();
        break;
      case 'openrouter':
        this.initializeOpenRouter();
        break;
    }
  }

  private initializeOpenAI() {
    // Initialize OpenAI client
    if (typeof window !== 'undefined') {
      console.log('Initializing OpenAI provider...');
      console.log('API Key available:', !!this.config.apiKey);
      console.log('API Key length:', this.config.apiKey?.length);
      
      if (!this.config.apiKey) {
        console.error('OpenAI API key is required but not provided');
        this.provider = null;
        return;
      }
      
      this.provider = {
        chat: {
          completions: {
            create: async (params: any) => {
              console.log('Making OpenAI API call with params:', params);
              const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${this.config.apiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: this.config.model || 'gpt-4',
                  messages: params.messages,
                  temperature: this.config.temperature || 0.7,
                  max_tokens: this.config.maxTokens || 1000,
                }),
              });
              
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('OpenAI API error:', response.status, errorData);
                throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
              }
              
              const result = await response.json();
              console.log('OpenAI API response:', result);
              return result;
            }
          }
        }
      };
      console.log('OpenAI provider initialized successfully');
    }
  }

  private initializeAnthropic() {
    // Initialize Anthropic client
    if (typeof window !== 'undefined') {
      this.provider = {
        messages: {
          create: async (params: any) => {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'x-api-key': this.config.apiKey!,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: this.config.model || 'claude-3-sonnet-20240229',
                max_tokens: this.config.maxTokens || 1000,
                messages: params.messages,
                temperature: this.config.temperature || 0.7,
              }),
            });
            
            if (!response.ok) {
              throw new Error(`Anthropic API error: ${response.statusText}`);
            }
            
            return await response.json();
          }
        }
      };
    }
  }

  private initializeLocal() {
    // Initialize local LLM (e.g., Ollama, LM Studio)
    if (typeof window !== 'undefined') {
      this.provider = {
        chat: {
          completions: {
            create: async (params: any) => {
              const response = await fetch(this.config.baseUrl || 'http://localhost:11434/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: this.config.model || 'llama2',
                  messages: params.messages,
                  temperature: this.config.temperature || 0.7,
                  max_tokens: this.config.maxTokens || 1000,
                }),
              });
              
              if (!response.ok) {
                throw new Error(`Local LLM API error: ${response.statusText}`);
              }
              
              return await response.json();
            }
          }
        }
      };
    }
  }

  private initializeCustom() {
    // Initialize custom LLM provider
    if (typeof window !== 'undefined') {
      this.provider = {
        chat: {
          completions: {
            create: async (params: any) => {
              const response = await fetch(this.config.baseUrl!, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
                },
                body: JSON.stringify({
                  model: this.config.model,
                  messages: params.messages,
                  temperature: this.config.temperature || 0.7,
                  max_tokens: this.config.maxTokens || 1000,
                }),
              });
              
              if (!response.ok) {
                throw new Error(`Custom LLM API error: ${response.statusText}`);
              }
              
              return await response.json();
            }
          }
        }
      };
    }
  }

  private initializeOpenRouter() {
    // Initialize OpenRouter client
    if (typeof window !== 'undefined') {
      console.log('Initializing OpenRouter provider...');
      console.log('API Key available:', !!this.config.apiKey);
      console.log('Base URL:', this.config.baseUrl);
      
      if (!this.config.apiKey) {
        console.error('OpenRouter API key is required but not provided');
        this.provider = null;
        return;
      }
      
      this.provider = {
        chat: {
          completions: {
            create: async (params: any) => {
              console.log('Making OpenRouter API call with params:', params);
              
              const requestBody = {
                model: params.model || this.config.model || 'openai/gpt-4o',
                messages: params.messages,
                temperature: params.temperature || this.config.temperature || 0.7,
                max_tokens: params.max_tokens || this.config.maxTokens || 1000,
              };
              
              console.log('Request body:', requestBody);
              console.log('Request headers:', {
                'Authorization': `Bearer ${this.config.apiKey?.substring(0, 10)}...`,
                'Content-Type': 'application/json',
                'HTTP-Referer': this.config.siteUrl || 'https://flow-platform.eth',
                'X-Title': this.config.siteName || 'Flow Platform',
              });
              
              const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${this.config.apiKey}`,
                  'Content-Type': 'application/json',
                  'HTTP-Referer': this.config.siteUrl || 'https://flow-platform.eth',
                  'X-Title': this.config.siteName || 'Flow Platform',
                },
                body: JSON.stringify(requestBody),
              });
              
              console.log('Response status:', response.status);
              console.log('Response headers:', Object.fromEntries(response.headers.entries()));
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error('OpenRouter API error response:', errorText);
                
                try {
                  const errorData = JSON.parse(errorText);
                  throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || errorData.message || response.statusText}`);
                } catch (parseError) {
                  throw new Error(`OpenRouter API error: ${response.status} - ${errorText.substring(0, 200)}`);
                }
              }
              
              const result = await response.json();
              console.log('OpenRouter API response:', result);
              return result;
            }
          }
        }
      };
      console.log('OpenRouter provider initialized successfully');
    }
  }

  // Test OpenRouter API connection
  async testOpenRouterConnection(): Promise<boolean> {
    try {
      console.log('Testing OpenRouter API connection...');
      
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': this.config.siteUrl || 'https://flow-platform.eth',
          'X-Title': this.config.siteName || 'Flow Platform',
        },
      });
      
      if (response.ok) {
        const models = await response.json();
        console.log('Available OpenRouter models:', models.data?.slice(0, 5)?.map((m: any) => m.id));
        return true;
      } else {
        const errorText = await response.text();
        console.error('OpenRouter models API error:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }

  // Get contract addresses for current network
  private getContractAddresses(): any {
    // Default to Local Anvil network for now
    return SUPPORTED_NETWORKS[2].contracts;
  }

  // Main method to process user messages and generate responses
  async processMessage(userMessage: string, context?: any): Promise<LLMResponse> {
    try {
      if (!this.provider) {
        return {
          message: "I'm sorry, the AI service is not properly configured. Please check your OpenAI API key configuration.",
          confidence: 0,
          suggestions: ['Check API key configuration', 'Restart the application', 'Contact support']
        };
      }

      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(userMessage, context);
      
      const response = await this.callLLM(systemPrompt, userPrompt);
      const parsedResponse = this.parseLLMResponse(response);
      
      return parsedResponse;
    } catch (error) {
      console.error('Error processing message with LLM:', error);
      
      // Provide helpful error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return {
            message: "I'm sorry, there's an issue with the API configuration. Please check your OpenAI API key.",
            confidence: 0,
            suggestions: ['Verify API key in .env file', 'Check API key permissions', 'Restart the application']
          };
        } else if (error.message.includes('rate limit')) {
          return {
            message: "I'm experiencing high demand right now. Please try again in a moment.",
            confidence: 0,
            suggestions: ['Wait a few minutes', 'Try again later', 'Check API usage limits']
          };
        }
      }
      
      return {
        message: "I'm sorry, I encountered an error processing your request. Please try again or contact support.",
        confidence: 0,
        suggestions: ['Try again', 'Check your connection', 'Contact support']
      };
    }
  }

  private buildSystemPrompt(): string {
    return `You are Flow, an AI agent specialized in blockchain and DeFi operations. You help users interact with the Flow platform for payments, identity management, and smart contract operations.

CRITICAL FORMATTING RULES:
- NEVER use asterisks (*) or markdown formatting
- NEVER use bold, italic, or special text formatting
- Use clean, professional text with proper spacing
- Use dashes (-) and bullet points (•) for lists
- Keep responses well-structured and easy to read
- Be CONCISE and direct - avoid verbose explanations
- Don't repeat information unnecessarily

Your responses should be:
- Professional and clear
- Well-structured with proper spacing
- Easy to read without special characters
- Actionable and specific
- Concise and to the point

When you identify a user wants to perform a blockchain action, structure your response like this:

1. Provide a brief, clear explanation (1-2 sentences max)
2. Include the action JSON object at the end

Example response format:
"I'll help you create a multi-signature wallet. This will require setting up signatories and approval rules."

IMPORTANT: Keep your explanation brief and professional. Avoid phrases like "follow these steps", "you can follow these steps", or numbered lists. Be direct and concise.

{
  "type": "action_type",
  "description": "Clear description of the action",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  },
  "requiresApproval": true,
  "estimatedGas": 50000,
  "smartContractCall": {
    "function": "functionName",
    "parameters": {
      "param1": "value1"
    },
    "network": "network_name"
  }
}

Available action types:
- send_payment: For sending tokens or payments
- create_wallet: For creating new wallets
- verify_identity: For identity verification
- issue_credential: For issuing credentials
- create_dao: For creating DAOs
- join_savings_group: For joining savings groups

Remember: Clean, professional formatting without asterisks or markdown. Be concise and direct.`;
  }

  private buildUserPrompt(userMessage: string, context?: any): string {
    let prompt = `User request: "${userMessage}"\n\n`;
    
    if (context) {
      prompt += `Context:\n`;
      if (context.userBalance) prompt += `- User balance: ${context.userBalance}\n`;
      if (context.existingAgents) prompt += `- Existing agents: ${context.existingAgents.join(', ')}\n`;
      if (context.network) prompt += `- Network: ${context.network}\n`;
      if (context.gasPrice) prompt += `- Current gas price: ${context.gasPrice}\n`;
    }
    
    prompt += `\nPlease analyze this request and provide an appropriate response with action details if applicable.`;
    
    return prompt;
  }

  private formatActionResponse(action: any, message: string): string {
    if (!action) return message;

    const { type, description, parameters, requiresApproval, estimatedGas, smartContractCall } = action;
    
    // Clean up the message - remove repetitive text and keep only the essential explanation
    let cleanMessage = message;
    
    // Remove common repetitive phrases and verbose explanations
    const repetitivePhrases = [
      /To .* on the Local Anvil Network, follow these steps:/i,
      /For .*, please find the action details below:/i,
      /Certainly! To .* on the Local Anvil Network, you can follow these steps:/i,
      /1\. .*\n2\. .*\n3\. .*/g, // Remove numbered lists
      /--━━-- Action Details:/i,
      /To create a new multi-signature wallet on the Local Anvil Network, follow these steps:/i,
      /Choose the number of required signatories for transactions\./i,
      /Select the public keys of the signatories who will have access to the wallet\./i,
      /Define the rules for executing transactions \(e\.g\., unanimous approval\)\./i,
      /For the creation of a new multi-signature wallet, please find the action details below:/i
    ];
    
    repetitivePhrases.forEach(phrase => {
      cleanMessage = cleanMessage.replace(phrase, '');
    });
    
    // Clean up extra whitespace and newlines
    cleanMessage = cleanMessage.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    
    // Simplify the response to be more conversational
    if (cleanMessage.length > 200 || cleanMessage.includes('follow these steps')) {
      cleanMessage = `I'll help you ${description.toLowerCase()}.`;
    }
    
    let formattedResponse = cleanMessage;
    
    // Add a simple action summary instead of verbose details
    if (parameters && Object.keys(parameters).length > 0) {
      const summary = Object.entries(parameters)
        .map(([key, value]) => {
          if (key === 'amount') return `${value} USDC`;
          if (key === 'recipient') return `to ${value}`;
          return value;
        })
        .join(' ');
      
      formattedResponse += `\n\nI'm ready to execute: **${summary}**`;
    }
    
    // Simple confirmation prompt
    formattedResponse += '\n\nPlease confirm this action below.';
    
    return formattedResponse;
  }

  private async callLLM(systemPrompt: string, userPrompt: string): Promise<any> {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    if (this.config.provider === 'anthropic') {
      const response = await this.provider.messages.create({
        messages,
        max_tokens: this.config.maxTokens || 1000,
        temperature: this.config.temperature || 0.7,
      });
      return response;
    } else if (this.config.provider === 'openrouter') {
      // Try different models if the primary one fails
      const modelsToTry = [
        this.config.model || 'openai/gpt-3.5-turbo',
        'openai/gpt-3.5-turbo',
        'meta-llama/llama-2-7b-chat',
        'anthropic/claude-3-haiku'
      ];

      for (const model of modelsToTry) {
        try {
          console.log(`Trying OpenRouter model: ${model}`);
          const response = await this.provider.chat.completions.create({
            messages,
            model: model,
            temperature: this.config.temperature || 0.7,
            max_tokens: this.config.maxTokens || 1000,
          });
          console.log(`Successfully used model: ${model}`);
          return response;
        } catch (error) {
          console.log(`Model ${model} failed:`, error);
          if (model === modelsToTry[modelsToTry.length - 1]) {
            // Last model failed, re-throw the error
            throw error;
          }
          // Try next model
          continue;
        }
      }
    } else {
      const response = await this.provider.chat.completions.create({
        messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000,
      });
      return response;
    }
  }

  private parseLLMResponse(response: any): LLMResponse {
    let content = '';
    
    if (this.config.provider === 'anthropic') {
      content = response.content[0]?.text || '';
    } else {
      content = response.choices[0]?.message?.content || '';
    }

    // Try to extract action from response
    const action = this.extractActionFromResponse(content);
    
    // Format the response if there's an action
    let formattedMessage = content;
    if (action && action.type) {
      // Extract the text before any JSON action object
      const textBeforeAction = content.split('{')[0].trim();
      formattedMessage = this.formatActionResponse(action, textBeforeAction);
    }
    
    return {
      message: formattedMessage,
      action,
      confidence: action ? 0.9 : 0.7,
      suggestions: this.generateSuggestions(content),
    };
  }

  private extractActionFromResponse(content: string): LLMAction | undefined {
    // Look for action indicators in the response
    const actionPatterns = {
      create_agent: /create.*agent|set up.*agent|new.*agent|deploy.*agent|make.*agent/i,
      send_payment: /send.*payment|transfer.*money|pay.*to|send.*to/i,
      create_wallet: /create.*wallet|set up.*wallet|multi.*sig/i,
      create_dao: /create.*dao|set up.*dao|community.*governance/i,
      issue_credential: /issue.*credential|verify.*identity|trust.*score/i,
    };

    for (const [actionType, pattern] of Object.entries(actionPatterns)) {
      if (pattern.test(content)) {
        return this.buildActionFromType(actionType as any, content);
      }
    }

    return undefined;
  }

  private buildActionFromType(type: string, content: string): LLMAction {
    // Extract parameters from content
    const parameters: Record<string, any> = {};
    
    // Extract amount if present
    const amountMatch = content.match(/(\d+)\s*(USDC|ETH|USD)/i);
    if (amountMatch) {
      parameters.amount = amountMatch[1];
      parameters.currency = amountMatch[2];
    }
    
    // Extract recipient if present
    const recipientMatch = content.match(/to\s+([^\s,]+\.eth)/i);
    if (recipientMatch) {
      parameters.recipient = recipientMatch[1];
    }
    
    // Extract ENS name for agent creation
    const ensNameMatch = content.match(/([a-z0-9-]+\.eth)/i);
    if (ensNameMatch) {
      parameters.ensName = ensNameMatch[1];
    }
    
    // Extract agent type if present
    const agentTypeMatch = content.match(/(personal|business|defi|nft|dao|community|payment|trading|staking)\s*agent/i);
    if (agentTypeMatch) {
      parameters.agentType = agentTypeMatch[1];
    }

    // Set default values for create_agent
    if (type === 'create_agent') {
      parameters.ensName = parameters.ensName || 'myagent.eth';
      parameters.description = 'AI Agent for automation and financial operations';
      parameters.agentType = parameters.agentType || 'personal';
      parameters.capabilities = ['AI', 'automation', 'financial'];
      parameters.metadata = '';
    }
    
    // Set default values for create_dao
    if (type === 'create_dao') {
      parameters.ensName = parameters.ensName || 'community.eth';
      parameters.name = parameters.name || 'Community DAO';
      parameters.description = parameters.description || 'Community governance and decision making';
      parameters.members = parameters.members || ['0xe24DF601F19e18843a7bA1766E42a0a432D7324C']; // Default member
      parameters.proposalThreshold = parameters.proposalThreshold || 1;
      parameters.votingPeriod = parameters.votingPeriod || 86400; // 1 day
      parameters.quorum = parameters.quorum || 1;
      parameters.daoType = parameters.daoType || 0; // 0 = Community
      parameters.governanceToken = parameters.governanceToken || '0x0000000000000000000000000000000000000000'; // No token
    }
    
    // Set default values for create_wallet
    if (type === 'create_wallet') {
      parameters.ensName = parameters.ensName || 'wallet.eth';
      parameters.description = parameters.description || 'Multi-signature wallet for secure transactions';
      parameters.owners = parameters.owners || ['0xe24DF601F19e18843a7bA1766E42a0a432D7324C']; // Default owner
      parameters.requiredApprovals = parameters.requiredApprovals || 1;
      parameters.walletType = parameters.walletType || 0; // 0 = Standard
    }
    
    // Set default values for issue_credential
    if (type === 'issue_credential') {
      parameters.recipient = parameters.recipient || '0xe24DF601F19e18843a7bA1766E42a0a432D7324C';
      parameters.name = parameters.name || 'Badge';
      parameters.description = parameters.description || 'Verifiable credential';
      parameters.credentialType = parameters.credentialType || 0; // 0 = Badge
      parameters.score = parameters.score || 50; // Default score
      parameters.icon = parameters.icon || '🏆';
      parameters.expiryDate = parameters.expiryDate || Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year
      parameters.metadata = parameters.metadata || 'Credential';
    }

    return {
      type: type as any,
      description: this.generateDescription(type, parameters),
      parameters,
      requiresApproval: true,
      estimatedGas: this.estimateGas(type, parameters),
      smartContractCall: this.generateSmartContractCall(type, parameters),
    };
  }

  private generateDescription(type: string, parameters: any): string {
    switch (type) {
      case 'create_agent':
        return `Create ${parameters.agentType || 'Personal'} AI Agent`;
      case 'send_payment':
        return `Send ${parameters.amount || '0'} ${parameters.currency || 'USDC'} to ${parameters.recipient || 'recipient'}`;
      case 'create_wallet':
        return 'Create Multi-Signature Wallet';
      case 'create_dao':
        return `Create ${parameters.name || 'Community'} DAO`;
      case 'issue_credential':
        return 'Issue Verifiable Credential';
      default:
        return 'Execute Action';
    }
  }

  private estimateGas(type: string, parameters: any): string {
    const gasEstimates: Record<string, string> = {
      create_agent: '0.001 ETH',
      send_payment: '0.0005 ETH',
      create_wallet: '0.002 ETH',
      create_dao: '0.003 ETH',
      issue_credential: '0.0003 ETH',
    };
    
    return gasEstimates[type] || '0.001 ETH';
  }

  private generateSmartContractCall(type: string, parameters: any): any {
    // This would generate the actual smart contract call parameters
    // In production, this would be more sophisticated
    return {
      contract: this.getContractAddress(type),
      function: this.getFunctionName(type),
      args: this.getFunctionArgs(type, parameters),
    };
  }

  private getContractAddress(type: string): string {
    const contractAddresses: Record<string, string> = {
      create_agent: this.contractAddresses.flowAgentRegistry,
      send_payment: this.contractAddresses.flowPayments,
      create_wallet: this.contractAddresses.flowMultiSigWallet,
      create_dao: this.contractAddresses.flowDAO,
      issue_credential: this.contractAddresses.flowCredentials,
    };
    
    return contractAddresses[type] || this.contractAddresses.flow;
  }

  private getFunctionName(type: string): string {
    const functionNames: Record<string, string> = {
      create_agent: 'registerAgent',
      send_payment: 'sendPaymentToENS',
      create_wallet: 'createWallet',
      create_dao: 'createDAO',
      issue_credential: 'issueCredential',
    };
    
    return functionNames[type] || 'execute';
  }

  private getFunctionArgs(type: string, parameters: any): any[] {
    switch (type) {
      case 'create_agent':
        // Convert agent type string to enum value
        const agentTypeMap: Record<string, number> = {
          'personal': 0,
          'business': 1,
          'defi': 2,
          'nft': 3,
          'dao': 4,
          'payment': 5,
          'trading': 6,
          'staking': 7,
          'community': 8
        };
        const agentTypeValue = agentTypeMap[parameters.agentType?.toLowerCase()] || 0;
        
        return [
          parameters.ensName || 'agent.eth',
          parameters.description || 'AI Agent',
          agentTypeValue,
          parameters.capabilities || ['AI', 'automation'],
          parameters.metadata || ''
        ];
      case 'send_payment':
        return [
          parameters.recipient || 'recipient.eth',
          parameters.amount || '0',
          parameters.token || '0x0000000000000000000000000000000000000000', // ETH
          parameters.description || 'Payment',
          parameters.agentId || '0x0000000000000000000000000000000000000000000000000000000000000000' // bytes32 zero value
        ];
      case 'create_dao':
        return [
          parameters.ensName || 'community.eth',
          parameters.name || 'Community DAO',
          parameters.description || 'Community governance',
          parameters.members || ['0xe24DF601F19e18843a7bA1766E42a0a432D7324C'],
          parameters.proposalThreshold || 1,
          parameters.votingPeriod || 86400,
          parameters.quorum || 1,
          parameters.daoType || 0,
          parameters.governanceToken || '0x0000000000000000000000000000000000000000'
        ];
      case 'create_wallet':
        return [
          parameters.ensName || 'wallet.eth',
          parameters.description || 'Multi-signature wallet',
          parameters.owners || ['0xe24DF601F19e18843a7bA1766E42a0a432D7324C'],
          parameters.requiredApprovals || 1,
          parameters.walletType || 0
        ];
      case 'issue_credential':
        return [
          parameters.recipient || '0xe24DF601F19e18843a7bA1766E42a0a432D7324C',
          parameters.name || 'Badge',
          parameters.description || 'Credential',
          parameters.credentialType || 0,
          parameters.score || 50,
          parameters.icon || '🏆',
          parameters.expiryDate || Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
          parameters.metadata || 'Credential'
        ];
      default:
        return [];
    }
  }

  private generateSuggestions(content: string): string[] {
    const suggestions = [
      'Create a business agent for my company',
      'Send 100 USDC to vendor.ghana.eth',
      'Create a multi-signature wallet for our community',
      'Set up a DAO for community governance',
      'Issue a credential for verified vendor',
      'What can you help me with?'
    ];
    
    // Return 3 random suggestions
    return suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);
  }

  // Method to validate ENS names
  validateENSName(ensName: string): boolean {
    // Basic ENS validation
    const ensPattern = /^[a-z0-9-]+\.eth$/;
    return ensPattern.test(ensName);
  }

  // Method to estimate transaction costs
  estimateTransactionCost(action: LLMAction, gasPrice: string): string {
    const gasEstimates: Record<string, number> = {
      create_agent: 150000,
      send_payment: 65000,
      create_wallet: 200000,
      create_dao: 300000,
      issue_credential: 45000,
    };
    
    const gasLimit = gasEstimates[action.type] || 100000;
    const gasPriceWei = ethers.parseUnits(gasPrice, 'gwei');
    const totalCost = gasLimit * Number(gasPriceWei);
    
    return ethers.formatEther(totalCost);
  }

  // Get current network information
  getCurrentNetwork(): any {
    return SUPPORTED_NETWORKS[2]; // Default to Local Anvil
  }

}

// Factory function to create LLM service
export function createLLMService(config: LLMConfig): LLMService {
  return new LLMService(config);
}

// Default configurations
export const defaultLLMConfigs = {
  openrouter: {
    provider: 'openrouter' as LLMProvider,
    model: 'openai/gpt-4o',
    temperature: 0.7,
    maxTokens: 1000,
    baseUrl: 'https://openrouter.ai/api/v1',
    siteUrl: 'https://flow-platform.eth',
    siteName: 'Flow Platform'
  },
  openai: {
    provider: 'openai' as LLMProvider,
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
  },
  anthropic: {
    provider: 'anthropic' as LLMProvider,
    model: 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 1000,
  },
  local: {
    provider: 'local' as LLMProvider,
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama2',
    temperature: 0.7,
    maxTokens: 1000,
  },
};

// Get default OpenRouter config with API key
export function getDefaultLLMConfig(): LLMConfig {
  // Get API key from environment variables
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY;
  
  if (!apiKey) {
    console.warn('No OpenRouter API key found in environment variables. Please set OPENROUTER_API_KEY or LLM_API_KEY.');
  }
  
  return {
    provider: 'openrouter',
    model: 'openai/gpt-3.5-turbo', // Start with a more reliable model
    temperature: 0.7,
    maxTokens: 1000,
    apiKey: apiKey,
    baseUrl: 'https://openrouter.ai/api/v1',
    siteUrl: 'https://flow-platform.eth',
    siteName: 'Flow Platform'
  };
}
