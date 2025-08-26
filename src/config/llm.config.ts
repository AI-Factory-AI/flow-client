import { LLMConfig, defaultLLMConfigs } from '../ai/LLMService';

// Environment variables for LLM configuration
const getEnvVar = (key: string, defaultValue?: string): string | undefined => {
  if (typeof window !== 'undefined') {
    // Browser environment
    return (window as any).__ENV__?.[key] || defaultValue;
  }
  // Node environment
  return process.env[key] || defaultValue;
};

// LLM Configuration
export const llmConfig: LLMConfig = {
  provider: (getEnvVar('LLM_PROVIDER') as any) || 'openai',
  apiKey: getEnvVar('LLM_API_KEY'),
  model: getEnvVar('LLM_MODEL') || defaultLLMConfigs.openai.model,
  baseUrl: getEnvVar('LLM_BASE_URL'),
  temperature: parseFloat(getEnvVar('LLM_TEMPERATURE') || '0.7'),
  maxTokens: parseInt(getEnvVar('LLM_MAX_TOKENS') || '1000'),
};

// Provider-specific configurations
export const providerConfigs = {
  openai: {
    ...defaultLLMConfigs.openai,
    apiKey: getEnvVar('OPENAI_API_KEY'),
    model: getEnvVar('OPENAI_MODEL') || 'gpt-4',
    baseUrl: getEnvVar('OPENAI_BASE_URL') || 'https://api.openai.com/v1',
  },
  anthropic: {
    ...defaultLLMConfigs.anthropic,
    apiKey: getEnvVar('ANTHROPIC_API_KEY'),
    model: getEnvVar('ANTHROPIC_MODEL') || 'claude-3-sonnet-20240229',
    baseUrl: getEnvVar('ANTHROPIC_BASE_URL') || 'https://api.anthropic.com/v1',
  },
  local: {
    ...defaultLLMConfigs.local,
    baseUrl: getEnvVar('LOCAL_LLM_BASE_URL') || 'http://localhost:11434/v1',
    model: getEnvVar('LOCAL_LLM_MODEL') || 'llama2',
  },
  custom: {
    provider: 'custom' as const,
    apiKey: getEnvVar('CUSTOM_LLM_API_KEY'),
    model: getEnvVar('CUSTOM_LLM_MODEL') || 'custom-model',
    baseUrl: getEnvVar('CUSTOM_LLM_BASE_URL'),
    temperature: parseFloat(getEnvVar('CUSTOM_LLM_TEMPERATURE') || '0.7'),
    maxTokens: parseInt(getEnvVar('CUSTOM_LLM_MAX_TOKENS') || '1000'),
  },
  openrouter: {
    ...defaultLLMConfigs.openrouter,
    apiKey: getEnvVar('OPENROUTER_API_KEY') || getEnvVar('LLM_API_KEY'),
    model: getEnvVar('OPENROUTER_MODEL') || 'openai/gpt-4o',
    baseUrl: getEnvVar('OPENROUTER_BASE_URL') || 'https://openrouter.ai/api/v1',
    siteUrl: getEnvVar('OPENROUTER_SITE_URL') || 'https://flow-platform.eth',
    siteName: getEnvVar('OPENROUTER_SITE_NAME') || 'Flow Platform',
  },
};

// Smart Contract Integration Configuration
export const contractConfig = {
  // Contract addresses (will be set after deployment)
  FlowAgentRegistry: getEnvVar('FLOW_AGENT_REGISTRY_ADDRESS'),
  FlowPayments: getEnvVar('FLOW_PAYMENTS_ADDRESS'),
  FlowMultiSigWallet: getEnvVar('FLOW_MULTISIG_WALLET_ADDRESS'),
  FlowDAO: getEnvVar('FLOW_DAO_ADDRESS'),
  FlowCredentials: getEnvVar('FLOW_CREDENTIALS_ADDRESS'),
  Flow: getEnvVar('FLOW_MAIN_ADDRESS'),
  
  // Network configuration
  network: getEnvVar('NETWORK') || 'ethereum',
  chainId: parseInt(getEnvVar('CHAIN_ID') || '1'),
  
  // Gas configuration
  defaultGasLimit: parseInt(getEnvVar('DEFAULT_GAS_LIMIT') || '300000'),
  maxGasPrice: getEnvVar('MAX_GAS_PRICE') || '100', // gwei
  
  // Transaction configuration
  confirmations: parseInt(getEnvVar('CONFIRMATIONS') || '3'),
  timeout: parseInt(getEnvVar('TIMEOUT') || '300000'), // 5 minutes
};

// ENS Configuration
export const ensConfig = {
  // ENS registry address
  registry: getEnvVar('ENS_REGISTRY_ADDRESS') || '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  
  // ENS resolver
  resolver: getEnvVar('ENS_RESOLVER_ADDRESS'),
  
  // Default ENS domain
  defaultDomain: getEnvVar('DEFAULT_ENS_DOMAIN') || 'agent.eth',
  
  // ENS subdomains
  subdomains: {
    agent: 'agent.eth',
    community: 'community.eth',
    business: 'business.eth',
    personal: 'personal.eth',
    defi: 'defi.eth',
    nft: 'nft.eth',
    dao: 'dao.eth',
  },
};

// Security Configuration
export const securityConfig = {
  // Approval requirements
  requireApproval: getEnvVar('REQUIRE_APPROVAL') !== 'false',
  autoApprove: getEnvVar('AUTO_APPROVE') === 'true',
  
  // Spending limits
  defaultDailyLimit: getEnvVar('DEFAULT_DAILY_LIMIT') || '1000', // USDC
  defaultTransactionLimit: getEnvVar('DEFAULT_TRANSACTION_LIMIT') || '500', // USDC
  
  // Time restrictions
  defaultActiveHours: {
    start: getEnvVar('DEFAULT_ACTIVE_START') || '900', // 9 AM
    end: getEnvVar('DEFAULT_ACTIVE_END') || '1800', // 6 PM
  },
  
  // Emergency controls
  emergencyPauseEnabled: getEnvVar('EMERGENCY_PAUSE_ENABLED') !== 'false',
  emergencyRecoveryEnabled: getEnvVar('EMERGENCY_RECOVERY_ENABLED') !== 'false',
};

// UI Configuration
export const uiConfig = {
  // Chat interface
  maxMessages: parseInt(getEnvVar('MAX_MESSAGES') || '100'),
  messageTimeout: parseInt(getEnvVar('MESSAGE_TIMEOUT') || '30000'), // 30 seconds
  
  // Notifications
  showNotifications: getEnvVar('SHOW_NOTIFICATIONS') !== 'false',
  notificationSound: getEnvVar('NOTIFICATION_SOUND') !== 'false',
  
  // Themes
  defaultTheme: getEnvVar('DEFAULT_THEME') || 'light',
  allowThemeSwitch: getEnvVar('ALLOW_THEME_SWITCH') !== 'false',
  
  // Language
  defaultLanguage: getEnvVar('DEFAULT_LANGUAGE') || 'en',
  supportedLanguages: (getEnvVar('SUPPORTED_LANGUAGES') || 'en,fr,es,ar,zh').split(','),
};

// Feature Flags
export const featureFlags = {
  // LLM features
  llmEnabled: getEnvVar('LLM_ENABLED') !== 'false',
  naturalLanguageInterface: getEnvVar('NATURAL_LANGUAGE_INTERFACE') !== 'false',
  aiSuggestions: getEnvVar('AI_SUGGESTIONS') !== 'false',
  
  // Smart contract features
  agentCreation: getEnvVar('AGENT_CREATION_ENABLED') !== 'false',
  paymentProcessing: getEnvVar('PAYMENT_PROCESSING_ENABLED') !== 'false',
  walletManagement: getEnvVar('WALLET_MANAGEMENT_ENABLED') !== 'false',
  daoGovernance: getEnvVar('DAO_GOVERNANCE_ENABLED') !== 'false',
  credentialSystem: getEnvVar('CREDENTIAL_SYSTEM_ENABLED') !== 'false',
  
  // Advanced features
  crossChainOperations: getEnvVar('CROSS_CHAIN_OPERATIONS') === 'true',
  privacyFeatures: getEnvVar('PRIVACY_FEATURES') !== 'false',
  analytics: getEnvVar('ANALYTICS_ENABLED') !== 'false',
};

// Development Configuration
export const devConfig = {
  // Development mode
  isDevelopment: getEnvVar('NODE_ENV') === 'development',
  isTestnet: getEnvVar('IS_TESTNET') === 'true',
  
  // Debug options
  debugMode: getEnvVar('DEBUG_MODE') === 'true',
  logLevel: getEnvVar('LOG_LEVEL') || 'info',
  
  // Mock services
  useMockLLM: getEnvVar('USE_MOCK_LLM') === 'true',
  useMockContracts: getEnvVar('USE_MOCK_CONTRACTS') === 'true',
  
  // Testing
  testMode: getEnvVar('TEST_MODE') === 'true',
  testWallet: getEnvVar('TEST_WALLET_ADDRESS'),
};

// Configuration validation
export const validateConfig = (): string[] => {
  const errors: string[] = [];
  
  // Check required LLM configuration
  if (featureFlags.llmEnabled) {
    if (!llmConfig.provider) {
      errors.push('LLM provider is required when LLM is enabled');
    }
    
    if (llmConfig.provider === 'openai' && !providerConfigs.openai.apiKey) {
      errors.push('OpenAI API key is required for OpenAI provider');
    }
    
    if (llmConfig.provider === 'anthropic' && !providerConfigs.anthropic.apiKey) {
      errors.push('Anthropic API key is required for Anthropic provider');
    }
    
    if (llmConfig.provider === 'custom' && !providerConfigs.custom.baseUrl) {
      errors.push('Base URL is required for custom LLM provider');
    }
  }
  
  // Check contract configuration
  if (featureFlags.agentCreation && !contractConfig.FlowAgentRegistry) {
    errors.push('FlowAgentRegistry address is required for agent creation');
  }
  
  if (featureFlags.paymentProcessing && !contractConfig.FlowPayments) {
    errors.push('FlowPayments address is required for payment processing');
  }
  
  return errors;
};

// Get configuration for specific provider
export const getProviderConfig = (provider: string): LLMConfig => {
  switch (provider) {
    case 'openai':
      return providerConfigs.openai;
    case 'anthropic':
      return providerConfigs.anthropic;
    case 'local':
      return providerConfigs.local;
    case 'custom':
      return providerConfigs.custom;
    case 'openrouter':
      return providerConfigs.openrouter;
    default:
      return providerConfigs.openai;
  }
};

// Export all configurations
export default {
  llm: llmConfig,
  providers: providerConfigs,
  contracts: contractConfig,
  ens: ensConfig,
  security: securityConfig,
  ui: uiConfig,
  features: featureFlags,
  dev: devConfig,
  validate: validateConfig,
  getProviderConfig,
};
