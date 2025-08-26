import { useState, useEffect, useCallback } from 'react';
import { ActionBuilder } from '../ai/ActionBuilder';
import { SmartContractAction } from '../ai/ActionBuilder';
import { IntentType } from '../ai/IntentRecognition';
import { TransactionResult } from '../ai/ContractInteractor';

export const useContractInteraction = () => {
  const [actionBuilder, setActionBuilder] = useState<ActionBuilder | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const builder = new ActionBuilder();
    setActionBuilder(builder);
    
    // Check if wallet is already connected
    if (builder.isWalletConnected()) {
      setIsConnected(true);
      builder.getConnectedAddress().then(address => setConnectedAddress(address || ''));
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!actionBuilder) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const success = await actionBuilder.connectWallet();
      if (success) {
        setIsConnected(true);
        const address = await actionBuilder.getConnectedAddress();
        setConnectedAddress(address || '');
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [actionBuilder]);

  const executeAction = useCallback(async (action: SmartContractAction): Promise<TransactionResult> => {
    if (!actionBuilder) {
      throw new Error('ActionBuilder not initialized');
    }
    
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await actionBuilder.executeAction(action);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [actionBuilder, isConnected]);

  const readContract = useCallback(async (
    contractName: string, 
    functionName: string, 
    args: any[] = []
  ): Promise<any> => {
    if (!actionBuilder) {
      throw new Error('ActionBuilder not initialized');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await actionBuilder.readContract(contractName, functionName, args);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to read contract';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [actionBuilder]);

  const buildAction = useCallback((intent: { type: IntentType; parameters: any; confidence?: number; description?: string }): SmartContractAction => {
    if (!actionBuilder) {
      throw new Error('ActionBuilder not initialized');
    }
    
    // Create a proper Intent object with required properties
    const fullIntent = {
      type: intent.type,
      confidence: intent.confidence || 0.8,
      parameters: intent.parameters,
      description: intent.description || `Action: ${intent.type}`
    };
    
    return actionBuilder.buildAction(fullIntent);
  }, [actionBuilder]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setConnectedAddress('');
    setError(null);
  }, []);

  return {
    // State
    isConnected,
    connectedAddress,
    loading,
    error,
    
    // Actions
    connectWallet,
    executeAction,
    readContract,
    buildAction,
    disconnect,
    
    // Utilities
    actionBuilder
  };
};
