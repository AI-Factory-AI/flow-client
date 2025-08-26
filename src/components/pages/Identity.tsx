import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Edit, 
  Plus, 
  ExternalLink, 
  Copy,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building,
  Verified,
  AlertTriangle
} from "lucide-react";

interface IdentityRecord {
  id: string;
  type: 'avatar' | 'email' | 'description' | 'url' | 'location' | 'company';
  key: string;
  value: string;
  verified: boolean;
  lastUpdated: Date;
}

interface Verification {
  id: string;
  type: 'email' | 'phone' | 'kyc' | 'social' | 'domain';
  status: 'verified' | 'pending' | 'failed';
  verifiedAt?: Date;
  expiresAt?: Date;
}

const Identity = () => {
  const [identityRecords] = useState<IdentityRecord[]>([
    {
      id: '1',
      type: 'avatar',
      key: 'Avatar',
      value: '/api/placeholder/128/128',
      verified: true,
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'email',
      key: 'Email',
      value: 'alex@example.com',
      verified: true,
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'description',
      key: 'Description',
      value: 'Blockchain developer and DeFi enthusiast',
      verified: false,
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      type: 'url',
      key: 'Website',
      value: 'https://alex.agent.eth',
      verified: true,
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '5',
      type: 'location',
      key: 'Location',
      value: 'Accra, Ghana',
      verified: false,
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '6',
      type: 'company',
      key: 'Company',
      value: 'ENS Agent Portal',
      verified: true,
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [verifications] = useState<Verification[]>([
    {
      id: '1',
      type: 'email',
      status: 'verified',
      verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'phone',
      status: 'verified',
      verifiedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'kyc',
      status: 'verified',
      verifiedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      type: 'social',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '5',
      type: 'domain',
      status: 'verified',
      verifiedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  ]);

  const getVerificationIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'kyc': return <User className="w-4 h-4" />;
      case 'social': return <Globe className="w-4 h-4" />;
      case 'domain': return <Building className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'failed': return <XCircle className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-4 bg-card flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Identity Management</h1>
            <p className="text-muted-foreground">Manage your ENS identity and verification status</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            Add Record
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-6xl mx-auto w-full space-y-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Profile Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/api/placeholder/128/128" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">A</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">alex.agent.eth</h2>
                  <p className="text-muted-foreground mb-4">Blockchain developer and DeFi enthusiast</p>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Verified className="w-3 h-3" />
                      <span>Verified</span>
                    </Badge>
                    <Badge variant="outline">
                      {verifications.filter(v => v.status === 'verified').length}/{verifications.length} Verified
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>Your identity verification progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifications.map((verification) => (
                  <div key={verification.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="p-2 bg-muted rounded-lg">
                      {getVerificationIcon(verification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">{verification.type}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(verification.status)}>
                          {getStatusIcon(verification.status)}
                          {verification.status}
                        </Badge>
                        {verification.verifiedAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(verification.verifiedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Identity Records */}
          <Card>
            <CardHeader>
              <CardTitle>ENS Records</CardTitle>
              <CardDescription>Manage your public ENS profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {identityRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {record.type === 'avatar' && <User className="w-4 h-4" />}
                        {record.type === 'email' && <Mail className="w-4 h-4" />}
                        {record.type === 'description' && <User className="w-4 h-4" />}
                        {record.type === 'url' && <Globe className="w-4 h-4" />}
                        {record.type === 'location' && <MapPin className="w-4 h-4" />}
                        {record.type === 'company' && <Building className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{record.key}</p>
                        <p className="text-sm text-muted-foreground">{record.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={record.verified ? "default" : "secondary"}>
                        {record.verified ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Identity;
