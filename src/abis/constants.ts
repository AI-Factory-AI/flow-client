// Network configurations
export const SUPPORTED_NETWORKS = [
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
    blockExplorer: 'https://etherscan.io',
    contracts: {
      flow: '',
      flowPayments: '',
      flowMultiSigWallet: '',
      flowDAO: '',
      flowENSIntegration: '',
      flowCredentials: '',
      flowAgentRegistry: '',
      flowAgentIntegration: ''
    }
  },
  {
    chainId: 11155111,
    name: 'Ethereum Sepolia Testnet',
    rpcUrl: 'https://ethereum-sepolia.publicnode.com',
    blockExplorer: 'https://sepolia.etherscan.io',
    contracts: {
      flow: '0x91F455A6E2ae7458F20bE3ef4c50602281be3A67',
      flowPayments: '0x89Db2f3428a07d9354fA1915414F2F581Da80188',
      flowMultiSigWallet: '0x72AF2f41FD7B5C32CCC1Cf4b55098377bf467645',
      flowDAO: '0xe96e696A770F9c87503D379B8953d1dFda0402Fc',
      flowENSIntegration: '0x5B9b14c0D1743a63E9D5bb4267B6C1B585420136',
      flowCredentials: '0x1718df6b9C8BfC821aFdA1249C44eA5a2D8e527b',
      flowAgentRegistry: '0xc7b84E03054aCC854e866bD86eCb8D4C1B544f4e',
      flowAgentIntegration: '0x6cA6283a4bcbDBfDEc152F0E12F35788830a54F6'
    }
  },
  {
    chainId: 31337,
    name: 'Local Anvil Network',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
    contracts: {
      flow: '0x50EEf481cae4250d252Ae577A09bF514f224C6C4',
      flowPayments: '0x34A1D3fff3958843C43aD80F30b94c510645C316',
      flowMultiSigWallet: '0x90193C961A926261B756D1E5bb255e67ff9498A1',
      flowDAO: '0xA8452Ec99ce0C64f20701dB7dD3abDb607c00496',
      flowENSIntegration: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      flowCredentials: '0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496',
      flowAgentRegistry: '0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519',
      flowAgentIntegration: '0xDB8cFf278adCCF9E9b5da745B44E754fC4EE3C76'
    }
  }
];

// Default network (Ethereum Sepolia for testing)
export const DEFAULT_NETWORK = SUPPORTED_NETWORKS[1]; // Ethereum Sepolia

// Platform configuration
export const PLATFORM_CONFIG = {
  name: 'Flow Platform',
  version: '1.0.0',
  description: 'AI Agent Financial Operations Platform',
  initialPlatformId: 1,
  maxAgentsPerUser: 10,
  maxCredentialsPerAgent: 50,
  maxProposalsPerDAO: 100
};

// Gas settings
export const GAS_SETTINGS = {
  defaultGasLimit: 3000000,
  maxGasPrice: '100000000000', // 100 gwei
  gasMultiplier: 1.2
};

// Fee settings
export const FEE_SETTINGS = {
  platformFee: 250, // 2.5% in basis points
  maxFee: 1000, // 10% in basis points
  minFee: 50 // 0.5% in basis points
};

// ENS settings
export const ENS_SETTINGS = {
  defaultResolver: '0xe24DF601F19e18843a7bA1766E42a0a432D7324C',
  supportedTLDs: ['.eth', '.test', '.xyz'],
  maxNameLength: 50
};

// Error messages
export const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: 'Insufficient balance for transaction',
  TRANSACTION_FAILED: 'Transaction failed',
  NETWORK_ERROR: 'Network connection error',
  CONTRACT_ERROR: 'Smart contract error',
  USER_REJECTED: 'User rejected transaction',
  INVALID_ADDRESS: 'Invalid address format',
  INVALID_AMOUNT: 'Invalid amount'
};

// Success messages
export const SUCCESS_MESSAGES = {
  TRANSACTION_SUCCESS: 'Transaction completed successfully',
  AGENT_CREATED: 'AI Agent created successfully',
  CREDENTIAL_ISSUED: 'Credential issued successfully',
  PAYMENT_SENT: 'Payment sent successfully',
  PROPOSAL_CREATED: 'Proposal created successfully',
  VOTE_CAST: 'Vote cast successfully'
};
