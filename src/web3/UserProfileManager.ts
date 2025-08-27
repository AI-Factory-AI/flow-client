import { ENSManager, ENSProfile } from './ENSManager';

export interface UserProfile {
  ensName: string;
  address: string;
  profile: ENSProfile | null;
}

export class UserProfileManager {
  private ensManager: ENSManager;

  constructor(ensManager: ENSManager) {
    this.ensManager = ensManager;
  }

  // Auto-detect user's ENS profile when wallet connects
  async detectUserENSProfile(account: string): Promise<UserProfile | null> {
    if (!account) {
      console.log('No account provided for ENS profile detection');
      return null;
    }

    try {
      console.log('Detecting user ENS profile for address:', account);
      
      // Check if the user owns any .agent.eth names
      const possibleNames = [
        'kwame.agent.eth', // Your specific ENS name
        'flow.agent.eth',
        'agent.eth'
      ];
      
      let foundENS = '';
      
      for (const ensName of possibleNames) {
        try {
          const isOwned = await this.ensManager.isENSNameOwnedBy(ensName, account);
          if (isOwned) {
            console.log('User owns ENS name:', ensName);
            foundENS = ensName;
            break;
          }
        } catch (error) {
          console.log(`Error checking ownership of ${ensName}:`, error);
        }
      }
      
      if (foundENS) {
        // Get the user's ENS profile
        const userProfile = await this.ensManager.getUserENSProfile(foundENS);
        
        return {
          ensName: foundENS,
          address: account,
          profile: userProfile
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error detecting user ENS profile:', error);
      return null;
    }
  }

  // Generate welcome message based on user profile
  generateWelcomeMessage(userProfile: UserProfile | null, account: string): string {
    if (userProfile && userProfile.profile) {
      const { ensName, profile } = userProfile;
      return `Welcome back! 🎉\n\n**Your ENS Profile:**\n🌐 **Name:** ${ensName}\n📍 **Address:** ${account}\n📝 **Description:** ${profile.description || 'No description set'}\n🔗 **Website:** ${profile.url || 'No website set'}\n📧 **Email:** ${profile.email || 'No email set'}\n\nHow can I help you today?`;
    } else {
      return `Welcome! 👋\n\nI notice you don't have an ENS name yet. Would you like me to help you:\n\n• Create a new ENS name (e.g., kwame.agent.eth)\n• Set up your profile with text records\n• Learn more about ENS integration\n\nJust let me know what you'd like to do!`;
    }
  }

  // Generate agent-specific welcome message
  generateAgentWelcomeMessage(agentName: string, agentEns: string, agentRole: string): string {
    return `Hello! I'm ${agentName} (${agentEns}). I'm your ${agentRole.toLowerCase()} and I'm here to help you with specialized services. How can I assist you today?`;
  }

  // Check if user has any ENS names
  async hasENSNames(account: string): Promise<boolean> {
    if (!account) return false;

    try {
      const possibleNames = ['kwame.agent.eth', 'flow.agent.eth', 'agent.eth'];
      
      for (const ensName of possibleNames) {
        try {
          const isOwned = await this.ensManager.isENSNameOwnedBy(ensName, account);
          if (isOwned) {
            return true;
          }
        } catch (error) {
          console.log(`Error checking ownership of ${ensName}:`, error);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking ENS ownership:', error);
      return false;
    }
  }

  // Get suggested prompts based on user profile
  getSuggestedPrompts(userProfile: UserProfile | null): Array<{ text: string; color: string }> {
    const basePrompts = [
      { text: "Create Multi-Signature Wallet", color: "bg-green-100 text-green-800" },
    ];

    if (userProfile && userProfile.profile) {
      // User has ENS profile - show profile management prompts
      return [
        { text: "Update my agent profile", color: "bg-emerald-100 text-emerald-800" },
        { text: "Get text records: " + userProfile.ensName, color: "bg-indigo-100 text-indigo-800" },
        ...basePrompts
      ];
    } else {
      // User doesn't have ENS profile - show setup prompts
      return [
        { text: "Setup my ENS profile", color: "bg-purple-100 text-purple-800" },
        { text: "Create agent ENS: kwame.agent.eth", color: "bg-blue-100 text-blue-800" },
        { text: "Check ENS availability: flow.agent.eth", color: "bg-yellow-100 text-yellow-800" },
        ...basePrompts
      ];
    }
  }
}

export const createUserProfileManager = (ensManager: ENSManager) => {
  return new UserProfileManager(ensManager);
};
