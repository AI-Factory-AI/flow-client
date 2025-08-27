import { ENSManager, ENSOperation } from './ENSManager';
import { BlockchainUtils } from './BlockchainUtils';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  pendingAction?: {
    type: string;
    description: string;
    ensName?: string;
    cost?: string;
    [key: string]: any;
  };
  actions?: {
    type: 'transaction' | 'update' | 'confirmation' | 'ens_operation';
    description: string;
    txHash?: string;
    status: 'pending' | 'completed' | 'failed';
  }[];
}

export interface MessageContext {
  network: string;
  userAddress: string;
  isConnected: boolean;
  agentName?: string;
  agentRole?: string;
}

export class ChatMessageHandler {
  private ensManager: ENSManager;
  private llmService: any;
  private flowContracts: any;
  private executeFlowAction: any;

  constructor(
    ensManager: ENSManager,
    llmService: any,
    flowContracts: any,
    executeFlowAction: any
  ) {
    this.ensManager = ensManager;
    this.llmService = llmService;
    this.flowContracts = flowContracts;
    this.executeFlowAction = executeFlowAction;
  }

  // Process user message and return AI response
  async processMessage(
    userMessage: string,
    context: MessageContext
  ): Promise<ChatMessage> {
    console.log('Processing message:', userMessage);
    console.log('LLM Service available:', !!this.llmService);
    console.log('Wallet connected:', context.isConnected);
    console.log('Flow contracts available:', !!this.flowContracts);

    // Check for ENS commands first
    const ensCommand = this.ensManager.detectENSCommand(userMessage);
    if (ensCommand) {
      return await this.handleENSCommand(ensCommand);
    }

    try {
      // Process message with LLM service if available
      if (this.llmService) {
        console.log('Processing message with LLM service...');
        try {
          const response = await this.llmService.processMessage(userMessage, context);
          console.log('LLM response:', response);

          // Check if LLM suggests an action
          if (response.action && context.isConnected && this.flowContracts) {
            console.log('Executing action:', response.action);
            
            return this.createAIResponse(
              response.message || "I'm ready to execute this action. Please confirm:",
              response.action
            );
          } else if (response.message && response.message.toLowerCase().includes('confirm')) {
            // If the message mentions confirmation but no action, create a generic confirmation
            return this.createAIResponse(
              response.message,
              { description: 'Confirm action', type: 'generic' }
            );
          } else {
            console.log('No action suggested, showing regular response');
            return this.createAIResponse(
              response.message || "I understand your request. Let me process that for you...",
              undefined
            );
          }
        } catch (error) {
          console.error('Error processing message with LLM:', error);
          // Fallback to simple response
          return this.createAIResponse(
            "I understand your request. Let me process that for you...",
            undefined
          );
        }
      } else {
        console.log('LLM service not available, showing fallback response');
        
        // Check if the user message suggests an action that needs confirmation
        const actionKeywords = ['send', 'transfer', 'pay', 'confirm', 'execute', 'approve'];
        const needsConfirmation = actionKeywords.some(keyword => 
          userMessage.toLowerCase().includes(keyword)
        );
        
        if (needsConfirmation) {
          // Show confirmation buttons for action-like messages
          return this.createAIResponse(
            "I understand you want to perform an action. Please confirm below:",
            { description: userMessage, type: 'user_request' }
          );
        } else {
          // Regular fallback response
          return this.createAIResponse(
            "I understand your request. Let me process that for you...",
            undefined
          );
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Error response
      return this.createAIResponse(
        "I'm sorry, I encountered an error processing your request. Please try again.",
        undefined
      );
    }
  }

  // Handle ENS command processing
  private async handleENSCommand(ensCommand: any): Promise<ChatMessage> {
    try {
      const { responseMessage, pendingAction } = await this.ensManager.processENSCommand(ensCommand);
      
      return this.createAIResponse(responseMessage, pendingAction);
    } catch (error) {
      console.error('Error handling ENS command:', error);
      return this.createAIResponse(
        "I'm sorry, I encountered an error processing your ENS command. Please try again.",
        undefined
      );
    }
  }

  // Create AI response message
  private createAIResponse(
    content: string,
    pendingAction?: any
  ): ChatMessage {
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content,
      timestamp: new Date(),
      sender: 'ai',
    };

    if (pendingAction) {
      aiResponse.pendingAction = pendingAction;
      aiResponse.actions = [{
        type: 'confirmation',
        description: pendingAction.description || 'Execute action',
        status: 'pending'
      }];
    }

    return aiResponse;
  }

  // Execute action (ENS or regular Flow action)
  async executeAction(action: any, account: string): Promise<string> {
    try {
      let executionResult: string;
      
      // Check if this is an ENS operation
      if (action.type?.startsWith('ens_')) {
        console.log('Executing ENS operation:', action.type);
        executionResult = await this.ensManager.executeENSOperation(action, account);
        console.log('ENS operation result:', executionResult);
      } else {
        console.log('Executing regular Flow action:', action.type);
        executionResult = await this.executeFlowAction(action);
      }
      
      return executionResult;
    } catch (error) {
      console.error('Action execution failed:', error);
      throw error;
    }
  }

  // Update message to show completion
  updateMessageForCompletion(
    message: ChatMessage,
    executionResult: string,
    chainId?: number
  ): ChatMessage {
    // For ENS operations, show the actual result content
    let displayContent = "✅ Action executed successfully!";
    
    if (message.pendingAction?.type?.startsWith('ens_')) {
      // Check if this is a read operation that returns content
      if (['ens_resolve', 'ens_check', 'ens_get_text', 'ens_setup_profile'].includes(message.pendingAction.type)) {
        // Just show the raw result text like ChatGPT would
        displayContent = String(executionResult);
      } else {
        displayContent = `✅ ENS operation completed successfully!\n\n${String(executionResult)}`;
      }
    }

    // Add transaction verification link for all transaction operations
    if (executionResult && typeof executionResult === 'string') {
      const txHash = BlockchainUtils.extractTxHash(executionResult);
      
      if (txHash && chainId) {
        if (BlockchainUtils.isLocalNetwork(chainId)) {
          // Local network - minimal info
          displayContent = `${executionResult}\n\n🔍 *Local transaction - cannot verify externally*`;
        } else {
          // Public network - add verification link
          const verificationText = BlockchainUtils.getVerificationLinkText(chainId, txHash);
          displayContent = `${executionResult}\n\n${verificationText}`;
        }
      }
    }
    
    return {
      ...message,
      content: displayContent,
      pendingAction: undefined,
      actions: message.actions?.map(act => ({
        ...act,
        type: 'transaction',
        status: 'completed',
        txHash: executionResult
      }))
    };
  }

  // Update message to show error
  updateMessageForError(
    message: ChatMessage,
    error: any,
    actionType?: string
  ): ChatMessage {
    // For ENS operations, show better error formatting
    let errorContent = `❌ Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    
    if (actionType?.startsWith('ens_')) {
      errorContent = `❌ ENS operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
    
    return {
      ...message,
      content: errorContent,
      pendingAction: undefined,
      actions: message.actions?.map(act => ({
        ...act,
        type: 'transaction',
        status: 'failed'
      }))
    };
  }

  // Update message to show cancellation
  updateMessageForCancellation(message: ChatMessage): ChatMessage {
    return {
      ...message,
      content: "❌ Action cancelled by user",
      pendingAction: undefined,
      actions: message.actions?.map(act => ({
        ...act,
        status: 'failed'
      }))
    };
  }
}

export const createChatMessageHandler = (
  ensManager: ENSManager,
  llmService: any,
  flowContracts: any,
  executeFlowAction: any
) => {
  return new ChatMessageHandler(ensManager, llmService, flowContracts, executeFlowAction);
};
