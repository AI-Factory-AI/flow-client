import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  Shield, 
  Star, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus, 
  Download,
  ExternalLink,
  TrendingUp,
  Users,
  Calendar,
  Eye,
  Edit
} from "lucide-react";

interface Credential {
  id: string;
  name: string;
  issuer: string;
  type: 'badge' | 'certification' | 'verification' | 'achievement';
  status: 'active' | 'expired' | 'pending' | 'revoked';
  issuedDate: Date;
  expiryDate?: Date;
  score?: number;
  description: string;
  icon: string;
  verified: boolean;
}

interface ReputationScore {
  category: string;
  score: number;
  maxScore: number;
  trend: 'up' | 'down' | 'stable';
}

const Credentials = () => {
  const [credentials] = useState<Credential[]>([
    {
      id: '1',
      name: 'Verified Vendor',
      issuer: 'Ghana DAO',
      type: 'badge',
      status: 'active',
      issuedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      score: 95,
      description: 'Verified vendor with excellent community feedback',
      icon: '🏆',
      verified: true
    },
    {
      id: '2',
      name: 'Trusted Farmer',
      issuer: 'Agriculture Alliance',
      type: 'certification',
      status: 'active',
      issuedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
      score: 88,
      description: 'Certified organic farming practices',
      icon: '🌾',
      verified: true
    },
    {
      id: '3',
      name: 'Community Leader',
      issuer: 'ENS Community',
      type: 'achievement',
      status: 'active',
      issuedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      score: 92,
      description: 'Active community contributor and leader',
      icon: '👑',
      verified: true
    },
    {
      id: '4',
      name: 'DeFi Expert',
      issuer: 'DeFi Academy',
      type: 'certification',
      status: 'pending',
      issuedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      description: 'Advanced DeFi strategies and risk management',
      icon: '💰',
      verified: false
    },
    {
      id: '5',
      name: 'NFT Collector',
      issuer: 'NFT Guild',
      type: 'badge',
      status: 'active',
      issuedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      score: 78,
      description: 'Curated collection of high-value NFTs',
      icon: '🎨',
      verified: true
    }
  ]);

  const [reputationScores] = useState<ReputationScore[]>([
    { category: 'Community Trust', score: 92, maxScore: 100, trend: 'up' },
    { category: 'Transaction Success', score: 98, maxScore: 100, trend: 'up' },
    { category: 'Verification Rate', score: 85, maxScore: 100, trend: 'stable' },
    { category: 'Response Time', score: 88, maxScore: 100, trend: 'up' },
    { category: 'Overall Rating', score: 4.8, maxScore: 5, trend: 'up' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'revoked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'expired': return <XCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'revoked': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'badge': return 'bg-blue-100 text-blue-800';
      case 'certification': return 'bg-purple-100 text-purple-800';
      case 'verification': return 'bg-green-100 text-green-800';
      case 'achievement': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      case 'stable': return <TrendingUp className="w-4 h-4 text-gray-500" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-4 bg-card flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Credentials & Reputation</h1>
            <p className="text-muted-foreground">Manage your verified credentials and reputation scores</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              Add Credential
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-6xl mx-auto w-full space-y-6">
          {/* Reputation Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Reputation Overview</span>
              </CardTitle>
              <CardDescription>Your current reputation scores across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reputationScores.map((score, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{score.category}</span>
                      {getTrendIcon(score.trend)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Score</span>
                        <span className="font-semibold">{score.score}/{score.maxScore}</span>
                      </div>
                      <Progress value={(score.score / score.maxScore) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Credentials List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Your Credentials</span>
              </CardTitle>
              <CardDescription>Verified credentials and achievements from various issuers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {credentials.map((credential) => (
                  <div key={credential.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{credential.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{credential.name}</h3>
                            {credential.verified && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">{credential.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{credential.issuer}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Issued: {formatDate(credential.issuedDate)}</span>
                            </span>
                            {credential.expiryDate && (
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Expires: {formatDate(credential.expiryDate)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(credential.status)}>
                          {getStatusIcon(credential.status)}
                          {credential.status}
                        </Badge>
                        <Badge className={getTypeColor(credential.type)}>
                          {credential.type}
                        </Badge>
                        {credential.score && (
                          <div className="text-right">
                            <div className="text-lg font-bold">{credential.score}</div>
                            <div className="text-xs text-muted-foreground">Score</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 p-2">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 p-2">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 p-2 text-primary">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Credentials</p>
                    <p className="text-2xl font-bold">{credentials.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verified</p>
                    <p className="text-2xl font-bold">{credentials.filter(c => c.verified).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">
                      {Math.round(credentials.filter(c => c.score).reduce((acc, c) => acc + (c.score || 0), 0) / credentials.filter(c => c.score).length)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credentials;
