import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFlowWeb3 } from '../web3';
import { Wallet, Bot, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Web3Status = () => {
  const { 
    isConnected, 
    account, 
    network, 
    flowContracts,
    connectWallet, 
    disconnectWallet 
  } = useFlowWeb3();

  const getStatusIcon = () => {
    if (isConnected) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    return isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getContractStatus = () => {
    if (!flowContracts) return 'Not Initialized';
    
    const contractCount = Object.keys(flowContracts).length;
    const expectedCount = 8; // We expect 8 contracts
    
    if (contractCount === expectedCount) {
      return 'All Contracts Ready';
    } else {
      return `${contractCount}/${expectedCount} Contracts Ready`;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>Web3 Status</span>
        </CardTitle>
        <CardDescription>
          Current blockchain connection status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection:</span>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-2">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </Badge>
        </div>

        {/* Account */}
        {isConnected && account && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Account:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {account.slice(0, 6)}...{account.slice(-4)}
            </code>
          </div>
        )}

        {/* Network */}
        {isConnected && network && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Network:</span>
            <Badge variant="outline">
              {network.name}
            </Badge>
          </div>
        )}

        {/* Contract Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Contracts:</span>
          <Badge variant="outline">
            {getContractStatus()}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {!isConnected ? (
            <Button onClick={connectWallet} className="flex-1">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          ) : (
            <Button onClick={disconnectWallet} variant="outline" className="flex-1">
              Disconnect
            </Button>
          )}
        </div>

        {/* Contract Details */}
        {flowContracts && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Deployed Contracts:</h4>
            <div className="space-y-1 text-xs">
              {Object.entries(flowContracts).map(([name, contract]) => (
                <div key={name} className="flex justify-between">
                  <span className="capitalize">{name}:</span>
                  <code className="bg-background px-1 rounded">
                    {(contract as any).target?.slice(0, 8)}...
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Web3Status;
