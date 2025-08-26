import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageCircle, Wallet, Shield, Bot, Users, Globe, Lock, CheckCircle } from "lucide-react";

interface AgentCardProps {
  name: string;
  ensName: string;
  role: string;
  rating: number;
  reviews: number;
  badges: string[];
  isOnline: boolean;
  avatar?: string;
  description?: string;
  requiresActivation?: boolean;
  activationStatus?: string;
  onChatClick: (agent: any) => void;
  onPayClick: (agent: any) => void;
  isWalletConnected?: boolean;
  flowContracts?: any;
}

const AgentCard = ({
  name,
  ensName,
  role,
  rating,
  reviews,
  badges,
  isOnline,
  avatar,
  description,
  requiresActivation = true,
  activationStatus = "available",
  onChatClick,
  onPayClick,
  isWalletConnected = false,
  flowContracts
}: AgentCardProps) => {
  // Get role-specific icon and primary action
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Payment Agent": return Wallet;
      case "AI Assistant": return Bot;
      case "Identity Agent": return Users;
      case "Community Agent": return Globe;
      default: return Shield;
    }
  };

  const getPrimaryAction = (role: string) => {
    if (!isWalletConnected) return "Connect Wallet";
    if (requiresActivation) return "Activate";
    return "Use";
  };

  const getActivationIcon = (role: string) => {
    if (!isWalletConnected) return Lock;
    if (requiresActivation) return Shield;
    return CheckCircle;
  };

  const RoleIcon = getRoleIcon(role);
  const primaryAction = getPrimaryAction(role);
  const ActivationIcon = getActivationIcon(role);

  // Create agent object to pass to parent
  const agentData = {
    name,
    ensName,
    role,
    rating,
    reviews,
    badges,
    isOnline,
    avatar,
    description,
    requiresActivation,
    activationStatus
  };

  const handlePrimaryAction = () => {
    if (!isWalletConnected) {
      // This will be handled by the parent component
      return;
    }
    if (requiresActivation) {
      onPayClick(agentData);
    } else {
      onChatClick(agentData);
    }
  };

  const isPrimaryActionDisabled = !isWalletConnected;

  return (
    <div className="agent-card group bg-card border rounded-lg p-6 h-full flex flex-col">
      {/* Agent Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="gradient-ens text-primary-foreground font-semibold">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-primary font-mono">{ensName}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${isOnline ? 'text-green-500' : 'text-muted-foreground'}`}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-muted-foreground'}`}></div>
          <span className="text-xs">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Role and Rating */}
      <div className="flex items-center justify-between mb-3">
        <Badge variant="secondary" className="rounded-full flex items-center gap-1">
          <RoleIcon className="w-3 h-3" />
          {role}
        </Badge>
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
          {description}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {badges.map((badge, index) => (
          <Badge 
            key={index} 
            variant="outline" 
            className="text-xs border-primary/20 bg-primary/5 text-primary"
          >
            <Shield className="w-3 h-3 mr-1" />
            {badge}
          </Badge>
        ))}
      </div>

      {/* Web3 Status */}
      {!isWalletConnected && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-muted">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Wallet connection required to interact with this agent</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2 mt-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onChatClick(agentData)}
          disabled={!isWalletConnected}
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Chat
        </Button>
        <Button 
          variant="ens" 
          size="sm" 
          className="flex-1"
          onClick={handlePrimaryAction}
          disabled={isPrimaryActionDisabled}
        >
          <ActivationIcon className="w-4 h-4 mr-1" />
          {primaryAction}
        </Button>
      </div>
    </div>
  );
};

export default AgentCard;