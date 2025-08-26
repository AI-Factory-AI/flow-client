import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar
} from "lucide-react";

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'stake';
  amount: string;
  currency: string;
  from: string;
  to: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
  txHash: string;
  gasFee: string;
  blockNumber: number;
}

const Transactions = () => {
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'send',
      amount: '5.0',
      currency: 'USDC',
      from: 'alex.agent.eth',
      to: 'kwame.agent.eth',
      status: 'completed',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      txHash: '0x742d35Cc6548Bb1067b3B0a1e0e2c7B5d3e8F9c4',
      gasFee: '0.002',
      blockNumber: 18456789
    },
    {
      id: '2',
      type: 'receive',
      amount: '2.5',
      currency: 'ETH',
      from: 'sarah.agent.eth',
      to: 'alex.agent.eth',
      status: 'completed',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      txHash: '0x8f9e2d1c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8',
      gasFee: '0.001',
      blockNumber: 18456745
    },
    {
      id: '3',
      type: 'swap',
      amount: '100.0',
      currency: 'USDC → ETH',
      from: 'alex.agent.eth',
      to: 'Uniswap V3',
      status: 'pending',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
      gasFee: '0.005',
      blockNumber: 18456890
    },
    {
      id: '4',
      type: 'stake',
      amount: '50.0',
      currency: 'ETH',
      from: 'alex.agent.eth',
      to: 'Lido Protocol',
      status: 'completed',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      txHash: '0x9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
      gasFee: '0.003',
      blockNumber: 18456678
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.txHash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'send': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'receive': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'swap': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'stake': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default: return <Wallet className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-4 bg-card flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">View and manage your blockchain transactions</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-4 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search transactions, addresses, or TX hashes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="send">Send</SelectItem>
              <SelectItem value="receive">Receive</SelectItem>
              <SelectItem value="swap">Swap</SelectItem>
              <SelectItem value="stake">Stake</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-6xl mx-auto w-full space-y-4">
          {filteredTransactions.map((tx) => (
            <Card key={tx.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(tx.type)}
                    <div>
                      <CardTitle className="text-lg capitalize">{tx.type}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        {formatTime(tx.timestamp)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(tx.status)}>
                      {tx.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {tx.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {tx.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                      {tx.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Amount</p>
                    <p className="text-lg font-semibold">{tx.amount} {tx.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">From</p>
                    <p className="text-sm font-mono">{tx.from}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">To</p>
                    <p className="text-sm font-mono">{tx.to}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>Block: {tx.blockNumber}</span>
                      <span>Gas: {tx.gasFee} ETH</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 p-2 text-primary">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Explorer
                    </Button>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-2">
                    {tx.txHash}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
