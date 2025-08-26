import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  User, 
  Building, 
  Globe, 
  Shield, 
  Zap, 
  Settings, 
  Plus,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Copy,
  ExternalLink
} from "lucide-react";

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'personal' | 'business' | 'defi' | 'nft' | 'dao';
  features: string[];
  popular: boolean;
}

const NewAgent = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentType, setAgentType] = useState<string>('');
  const [enableAI, setEnableAI] = useState(true);
  const [enableAutomation, setEnableAutomation] = useState(false);

  const [templates] = useState<AgentTemplate[]>([
    {
      id: '1',
      name: 'Personal Agent',
      description: 'Your personal AI assistant for daily blockchain tasks',
      icon: '👤',
      category: 'personal',
      features: ['Payment management', 'Portfolio tracking', 'Identity verification'],
      popular: true
    },
    {
      id: '2',
      name: 'Business Agent',
      description: 'Professional agent for business operations and compliance',
      icon: '🏢',
      category: 'business',
      features: ['Invoice management', 'Compliance tracking', 'Team permissions'],
      popular: false
    },
    {
      id: '3',
      name: 'DeFi Agent',
      description: 'Specialized agent for DeFi operations and yield farming',
      icon: '💰',
      category: 'defi',
      features: ['Yield optimization', 'Risk management', 'Portfolio rebalancing'],
      popular: true
    },
    {
      id: '4',
      name: 'NFT Agent',
      description: 'Agent for NFT management and marketplace operations',
      icon: '🎨',
      category: 'nft',
      features: ['Collection management', 'Marketplace integration', 'Royalty tracking'],
      popular: false
    },
    {
      id: '5',
      name: 'DAO Agent',
      description: 'Governance agent for DAO participation and voting',
      icon: '🏛️',
      category: 'dao',
      features: ['Proposal tracking', 'Voting management', 'Treasury oversight'],
      popular: false
    }
  ]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal': return 'bg-blue-100 text-blue-800';
      case 'business': return 'bg-purple-100 text-purple-800';
      case 'defi': return 'bg-green-100 text-green-800';
      case 'nft': return 'bg-pink-100 text-pink-800';
      case 'dao': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateAgent = () => {
    // Handle agent creation logic
    console.log('Creating agent:', {
      template: selectedTemplate,
      name: agentName,
      description: agentDescription,
      type: agentType,
      enableAI,
      enableAutomation
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-4 bg-card flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Create New Agent</h1>
            <p className="text-muted-foreground">Set up a new ENS agent with AI capabilities</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            Quick Setup
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-6xl mx-auto w-full space-y-6">
          {/* Agent Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>Choose Agent Template</span>
              </CardTitle>
              <CardDescription>Select a template to get started quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{template.icon}</span>
                      {template.popular && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="space-y-2">
                      {template.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Badge className={`mt-3 ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agent Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Agent Configuration</span>
              </CardTitle>
              <CardDescription>Customize your agent settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="agentName">Agent Name</Label>
                  <Input
                    id="agentName"
                    placeholder="e.g., mybusiness.agent.eth"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a unique ENS name for your agent
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agentType">Agent Type</Label>
                  <Select value={agentType} onValueChange={setAgentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="defi">DeFi</SelectItem>
                      <SelectItem value="nft">NFT</SelectItem>
                      <SelectItem value="dao">DAO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentDescription">Description</Label>
                <Textarea
                  id="agentDescription"
                  placeholder="Describe what this agent will do..."
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Agent Capabilities</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="enableAI"
                      checked={enableAI}
                      onCheckedChange={(checked) => setEnableAI(checked as boolean)}
                    />
                    <Label htmlFor="enableAI" className="flex items-center space-x-2">
                      <Bot className="w-4 h-4" />
                      <span>Enable AI Assistant</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="enableAutomation"
                      checked={enableAutomation}
                      onCheckedChange={(checked) => setEnableAutomation(checked as boolean)}
                    />
                    <Label htmlFor="enableAutomation" className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Enable Automation</span>
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Advanced Settings</span>
              </CardTitle>
              <CardDescription>Configure security and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Permission Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select permission level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="readonly">Read Only</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                      <SelectItem value="full">Full Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Security Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select security level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="enhanced">Enhanced</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Button */}
          <div className="flex justify-end">
            <Button 
              size="lg" 
              className="flex items-center space-x-2"
              onClick={handleCreateAgent}
              disabled={!selectedTemplate || !agentName}
            >
              <span>Create Agent</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAgent;
