// Direct imports for contract ABIs - works with Vite bundler
import FlowABI from './Flow.json';
import FlowPaymentsABI from './FlowPayments.json';
import FlowMultiSigWalletABI from './FlowMultiSigWallet.json';
import FlowDAOABI from './FlowDAO.json';
import FlowENSIntegrationABI from './FlowENSIntegration.json';
import FlowCredentialsABI from './FlowCredentials.json';
import FlowAgentRegistryABI from './FlowAgentRegistry.json';
import FlowAgentIntegrationABI from './FlowAgentIntegration.json';

export const CONTRACT_ABIS = {
  flow: FlowABI.abi,
  flowPayments: FlowPaymentsABI.abi,
  flowMultiSigWallet: FlowMultiSigWalletABI.abi,
  flowDAO: FlowDAOABI.abi,
  flowENSIntegration: FlowENSIntegrationABI.abi,
  flowCredentials: FlowCredentialsABI.abi,
  flowAgentRegistry: FlowAgentRegistryABI.abi,
  flowAgentIntegration: FlowAgentIntegrationABI.abi
};
