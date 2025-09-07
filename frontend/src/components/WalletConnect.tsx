import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

export const WalletConnect: React.FC = () => {
  const { isConnected, address, balance, connectWallet, disconnectWallet } = useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end text-sm">
          <span className="text-muted-foreground">
            {address.substring(0, 6)}...{address.substring(38)}
          </span>
          <span className="text-accent font-medium">
            {balance ? `${parseFloat(balance).toFixed(4)} ` : '0 ETH'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnectWallet}
          className="border-destructive/20 hover:border-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      className="bg-gradient-primary hover:opacity-90 transition-opacity"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
}