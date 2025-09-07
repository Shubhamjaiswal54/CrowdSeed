import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Search, 
  Bell, 
  User, 
  Menu, 
  X,
  Zap,
  Trophy,
  Vote
} from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const connectWallet = () => {
    setIsWalletConnected(true);
  };

  return (
    <nav className="sticky top-0 z-50 bg-glass backdrop-blur-md border-b border-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CrowdChain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/discover" className="text-muted-foreground hover:text-foreground transition-smooth">
              Discover
            </Link>
            <Link to="/create" className="text-muted-foreground hover:text-foreground transition-smooth">
              Start a Project
            </Link>
            <Link to="/dao" className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-smooth">
              <Vote className="w-4 h-4" />
              <span>DAO</span>
            </Link>
            <Link to="/leaderboard" className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-smooth">
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </Link>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-web3-warning"></Badge>
            </Button>

            {/* Wallet Connection */}
            {!isWalletConnected ? (
              <Button onClick={connectWallet} className="bg-gradient-primary hover:shadow-primary">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-web3-success/20 text-web3-success border-web3-success/30">
                  Connected
                </Badge>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link to="/discover" className="text-muted-foreground hover:text-foreground">
                Discover Projects
              </Link>
              <Link to="/create" className="text-muted-foreground hover:text-foreground">
                Start a Project
              </Link>
              <Link to="/dao" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <Vote className="w-4 h-4" />
                <span>DAO Governance</span>
              </Link>
              <Link to="/leaderboard" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </Link>
              <div className="pt-4 border-t border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;