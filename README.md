# 🌊 Flow Platform Frontend

A React-based frontend for the Flow platform - a decentralized AI agent financial operations platform built on Ethereum with ENS integration.

## 🚀 Features

### **Smart Contract Integration**
- **Flow (Main)**: Platform orchestrator contract
- **Agent Registry**: AI agent management and registration
- **Credentials**: Trust credential issuance and verification
- **Payments**: Payment processing and routing
- **Multi-Sig Wallet**: Multi-signature wallet creation and management
- **DAO**: Community governance and proposal management
- **ENS Integration**: ENS name resolution and registration
- **Agent Integration**: Secure AI agent operations

### **ENS (Ethereum Name Service) Integration**
- Human-readable addresses (e.g., `kwame.agent.eth`)
- Cross-border coordination through named addresses
- Portable digital identity across the platform
- Subdomain management and text records

### **AI Agent Management**
- Create AI agents with ENS identities
- Manage agent capabilities and permissions
- Track agent performance and reputation
- Secure workflow execution

### **Financial Operations**
- Send payments via ENS names
- Create multi-signature wallets
- Manage DAO treasury and proposals
- Token swaps and staking (planned)

## 🏗️ Architecture

```
flow/
├── src/
│   ├── abis/                 # Contract ABIs and constants
│   │   ├── contracts/        # JSON ABI files
│   │   ├── constants.ts      # Network configs and addresses
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── index.ts          # Main exports
│   ├── ai/                   # AI/LLM integration
│   │   └── LLMService.ts     # LLM service for agent interactions
│   ├── services/             # Core services
│   │   └── ENSService.ts     # ENS integration service
│   ├── components/           # React components
│   │   └── FlowPlatformDemo.tsx  # Main demo component
│   └── test/                 # Test files
│       └── ENSService.test.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- MetaMask or other Web3 wallet
- Local Anvil blockchain running (for development)
- OpenAI API key for AI chat functionality

### OpenAI API Setup

To enable AI chat functionality, you'll need an OpenAI API key:

1. **Get API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys) and create a new secret key
2. **Create Environment File**: Create a `.env` file in the `flow` directory:
   ```bash
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
3. **Restart Server**: Restart your development server after adding the API key

For detailed setup instructions, see [OPENAI_SETUP.md](./OPENAI_SETUP.md).

### Installation

1. **Install dependencies:**
   ```bash
   cd flow
   npm install
   ```

2. **Start local blockchain (Anvil):**
   ```bash
   cd ../blockchain
   anvil
   ```

3. **Deploy contracts (if not already deployed):**
   ```bash
   forge script script/DeployFlow.s.sol --rpc-url "http://127.0.0.1:8545" --private-key "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" --broadcast
   ```

4. **Start frontend development server:**
   ```bash
   cd ../flow
   npm run dev
   ```

## 🔧 Configuration

### Network Configuration
The platform supports multiple networks with automatic contract address detection:

```typescript
// Local Anvil (Development)
{
  chainId: 31337,
  name: 'Local Anvil Network',
  rpcUrl: 'http://127.0.0.1:8545',
  contracts: {
    flow: '0x68B1D87F95878fE05B998F19b66F4baba5De1aed',
    flowAgentRegistry: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
    // ... other contracts
  }
}
```

### Contract Addresses
All contract addresses are automatically loaded from the deployed contracts:

- **Flow (Main)**: `0x68B1D87F95878fE05B998F19b66F4baba5De1aed`
- **Agent Registry**: `0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e`
- **Credentials**: `0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0`
- **Payments**: `0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82`
- **Multi-Sig Wallet**: `0x9A676e781A523b5d0C0e43731313A708CB607508`
- **DAO**: `0x0B306BF915C4d645ff596e518fAf3F9669b97016`
- **ENS Integration**: `0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1`
- **Agent Integration**: `0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE`

## 📱 Usage

### ENS Service
```typescript
import { createENSService } from './services/ENSService';

const ensService = createENSService(provider, signer);

// Check ENS name availability
const isAvailable = await ensService.isNameAvailable('test.eth');

// Register ENS domain
const txHash = await ensService.registerDomain('myagent.eth');

// Create AI agent with ENS
const agentTx = await ensSercvice.createAgentWithENS(
  'myagent.eth',
  'Business AI Agent',
  'Business',
  ['AI', 'automation', 'analysis']
);
```

### LLM Service
```typescript
import { createLLMService } from './ai/LLMService';

const llmService = createLLMService({
  provider: 'local',
  baseUrl: 'http://localhost:11434/v1'
});

// Process user message and get AI response
const response = await llmService.processMessage(
  'Create a business agent for my company',
  { network: 'Local Anvil' }
);
```

### Demo Component
The `FlowPlatformDemo` component provides a complete interface for testing all platform features:

- Network selection and configuration
- Contract address display
- ENS service testing
- LLM service testing
- Platform feature overview

## 🧪 Testing

Run the test suite to verify integration:

```bash
npm test
```

Tests cover:
- ENS service initialization
- Contract address loading
- ENS name validation
- LLM service integration

## 🔒 Security Features

- **Multi-signature Requirements**: Financial operations require multiple approvals
- **Permission-based Access**: Agent capabilities are restricted by credentials
- **Complete Audit Trail**: All actions are recorded on the blockchain
- **ENS Identity Verification**: Human-readable addresses for secure coordination

## 🌐 Supported Networks

1. **Ethereum Mainnet** (Chain ID: 1)
2. **Goerli Testnet** (Chain ID: 5)
3. **Local Anvil** (Chain ID: 31337) - **Default for Development**

## 🚧 Development Roadmap

- [ ] **Phase 1**: Basic contract integration ✅
- [ ] **Phase 2**: ENS service implementation ✅
- [ ] **Phase 3**: LLM service integration ✅
- [ ] **Phase 4**: UI components and demo ✅
- [ ] **Phase 5**: Advanced agent workflows
- [ ] **Phase 6**: Cross-chain integration
- [ ] **Phase 7**: Mobile app development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: This README and inline code comments
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for questions and ideas

## 🔗 Links

- **Smart Contracts**: `blockchain/` directory
- **Frontend**: `flow/` directory
- **Deployment Scripts**: `blockchain/script/`
- **Tests**: `blockchain/test/` and `flow/src/test/`

---

**🌊 Flow Platform** - Building the future of decentralized AI agent coordination
