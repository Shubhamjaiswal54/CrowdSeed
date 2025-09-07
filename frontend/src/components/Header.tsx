import React from 'react';
import { Button } from '@/components/ui/button';
import { WalletConnect } from './WalletConnect';
import { Search, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 font-bold text-xl bg-gradient-primary bg-clip-text text-transparent"
            >
              CrowdChain
            </button>
            
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" onClick={() => navigate('/discover')}>
                Discover
              </Button>
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </nav>
          </div>

          <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects..."
                className="pl-10 bg-background/50 border-border/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex border-primary/20 hover:border-primary hover:bg-primary/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start Project
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="hidden sm:flex"
            >
              <User className="w-4 h-4" />
            </Button>
            
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
};