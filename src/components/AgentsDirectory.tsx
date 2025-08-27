import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AgentCard from "./AgentCard";
import { Search, Filter, Users, Bot, Wallet, Globe, ArrowLeft, Shield, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFlowWeb3 } from "../web3";

const AgentsDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Web3 integration
  const { isConnected, account, flowContracts } = useFlowWeb3();

  // Check if user is in onboarding process
  const onboardingAgent = searchParams.get('agent');
  const onboardingEns = searchParams.get('ens');
  const onboardingRole = searchParams.get('role');
  const isInOnboarding = Boolean(onboardingAgent && onboardingEns && onboardingRole);

  // Check if an agent has been activated
  const activatedAgent = searchParams.get('activated');
  const activatedEns = searchParams.get('ens');
  const activatedRole = searchParams.get('role');
  const isAgentActivated = Boolean(activatedAgent && activatedEns && activatedRole);

  const agents = [
    {
      name: "FlowPay Agent",
      ensName: "flow.pay.agent.eth",
      role: "Payment Agent",
      rating: 4.9,
      reviews: 127,
      badges: ["Auto-Split", "Cross-Border", "Privacy"],
      isOnline: true,
      description: "Send to one ENS, split to multiple recipients automatically. Uses rotating sub-addresses for privacy and supports cross-border payments.",
      requiresActivation: true,
      activationStatus: "available"
    },
    {
      name: "Identity Guardian",
      ensName: "guardian.id.agent.eth",
      role: "Identity Agent",
      rating: 4.9,
      reviews: 156,
      badges: ["KYC Verified", "ZK Proofs", "Portable"],
      isOnline: true,
      description: "Your digital ID card across apps and communities. Store credentials, get attestations, and prove verification with zero-knowledge proofs.",
      requiresActivation: true,
      activationStatus: "available"
    },
    {
      name: "DAO Coordinator",
      ensName: "dao.coord.agent.eth",
      role: "Community Agent",
      rating: 4.7,
      reviews: 203,
      badges: ["Governance", "Multi-Sig", "Voting"],
      isOnline: true,
      description: "Community coordination and DAO governance. Handles voting, proposals, fund management, and group wallets controlled by ENS names.",
      requiresActivation: true,
      activationStatus: "available"
    },
    {
      name: "DeFi Assistant",
      ensName: "defi.assist.agent.eth",
      role: "AI Assistant",
      rating: 4.8,
      reviews: 89,
      badges: ["DeFi Expert", "Automation", "24/7"],
      isOnline: true,
      description: "Your personal AI helper for onchain systems. Explains transactions, suggests safe actions, and automates tasks across all agents.",
      requiresActivation: true,
      activationStatus: "available"
    },
    {
      name: "Cross-Border Bridge",
      ensName: "bridge.cross.agent.eth",
      role: "Community Agent",
      rating: 4.8,
      reviews: 145,
      badges: ["Multi-Sig", "Coordination", "Global"],
      isOnline: true,
      description: "Named multi-sig wallets for cross-border coordination. Enable agent-to-agent communication and human-readable DAO addresses.",
      requiresActivation: true,
      activationStatus: "available"
    },
    {
      name: "Agent Registry",
      ensName: "registry.agent.eth",
      role: "AI Assistant",
      rating: 4.9,
      reviews: 178,
      badges: ["Autonomous", "Verifiable", "Onchain"],
      isOnline: true,
      description: "Onchain agent registry with human-verifiable interactions. Discover, verify, and coordinate with autonomous agents globally.",
      requiresActivation: true,
      activationStatus: "available"
    },
  ];

  const roles = ["all", "Payment Agent", "AI Assistant", "Identity Agent", "Community Agent"];
  const roleIcons = {
    "Payment Agent": Wallet,
    "AI Assistant": Bot,
    "Identity Agent": Users,
    "Community Agent": Globe,
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.ensName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.badges.some(badge => badge.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = selectedRole === "all" || agent.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleChatClick = (agent: any) => {
    // Navigate to chat page with agent information
    navigate(`/chat?agent=${encodeURIComponent(agent.name)}&ens=${encodeURIComponent(agent.ensName)}&role=${encodeURIComponent(agent.role)}`);
  };

  const handlePayClick = (agent: any) => {
    // Navigate to onboarding to activate the agent (and wallet if needed)
    navigate(`/onboarding?agent=${encodeURIComponent(agent.name)}&ens=${encodeURIComponent(agent.ensName)}&role=${encodeURIComponent(agent.role)}`);
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Discover{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AI agents
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover AI agents that transform ENS from simple names into powerful, interactive services. 
            Each agent brings blockchain to life with human-readable addresses and intelligent automation.
          </p>
        </div>



        {/* Agent Activation Banner */}
        {isInOnboarding && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="sm" onClick={() => navigate('/onboarding')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Onboarding
                </Button>
                <Badge variant="secondary" className="text-sm">
                  Activating Agent
                </Badge>
              </div>
              <h3 className="text-2xl font-bold mb-2">{onboardingAgent}</h3>
              <p className="text-muted-foreground font-mono mb-2">{onboardingEns}</p>
              <p className="text-sm text-muted-foreground">
                Complete the onboarding process to activate this {onboardingRole?.toLowerCase()} and start using its services.
              </p>
            </div>
          </div>
        )}

        {/* Agent Activation Success Banner */}
        {isAgentActivated && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-green-800">Agent Successfully Activated!</h3>
              </div>
              <p className="text-green-700 mb-4">
                {activatedAgent} ({activatedEns}) is now ready to use. 
                You can start chatting with your {activatedRole?.toLowerCase()} and access its services.
              </p>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate(`/chat?agent=${activatedAgent}&ens=${activatedEns}&role=${activatedRole}`)}
              >
                <Bot className="w-4 h-4 mr-2" />
                Start Chatting
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search agents by name, ENS, or badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {roles.map((role) => {
              const Icon = role === "all" ? Filter : roleIcons[role as keyof typeof roleIcons];
              return (
                <Button
                  key={role}
                  variant={selectedRole === role ? "ens" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                  className="whitespace-nowrap"
                >
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {role === "all" ? "All Roles" : role}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent, index) => (
            <AgentCard 
              key={index} 
              {...agent} 
              onChatClick={handleChatClick}
              onPayClick={handlePayClick}

              
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgentsDirectory;