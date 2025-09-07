import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Target, 
  Share2, 
  Heart,
  TrendingUp,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Types for API response
interface ProjectUpdate {
  id?: string;
  date: string;
  title: string;
  content: string;
}

interface ProjectReward {
  id?: string;
  amount: number;
  title: string;
  description: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  image?: string;
  goal: number;
  raised: number;
  backers: number;
  daysLeft: number;
  category: string;
  creator: string;
  status: 'active' | 'funded' | 'expired';
  createdAt?: string;
  updates?: ProjectUpdate[];
  rewards?: ProjectReward[];
  walletAddress?: string;
}

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected, address, connectWallet } = useWallet();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);

  // Fetch project details from API
  const fetchProject = async () => {
    if (!id) {
      setError('Project ID not provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/projects/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Project = await response.json();
      setProject(data.data);
      
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch project details');
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch project on component mount and when ID changes
  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleContribute = async () => {
    if (!project) return;

    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount.",
        variant: "destructive",
      });
      return;
    }

    setIsContributing(true);
    
    try {
      // Make API call to contribute
      const response = await fetch(`${API_BASE_URL}/projects/${project.id}/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(contributionAmount),
          walletAddress: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process contribution');
      }

      const result = await response.json();
      
      toast({
        title: "Contribution Successful!",
        description: `Successfully contributed ${contributionAmount} ETH to ${project.title}`,
      });
      
      setContributionAmount('');
      
      // Refresh project data to show updated stats
      await fetchProject();
      
    } catch (error) {
      console.error('Contribution error:', error);
      toast({
        title: "Contribution Failed",
        description: error instanceof Error ? error.message : "There was an error processing your contribution.",
        variant: "destructive",
      });
    } finally {
      setIsContributing(false);
    }
  };

  const handleRetry = () => {
    fetchProject();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading project details...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="text-xl font-semibold mb-2">
              {error === 'Project not found' ? 'Project Not Found' : 'Error Loading Project'}
            </div>
            <div className="text-muted-foreground mb-6">
              {error || 'Unable to load project details'}
            </div>
            <div className="space-x-4">
              <Button onClick={handleRetry} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => navigate('/')}>
                Back to Projects
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = (project.raised / project.goal) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {project.category}
                </Badge>
                <Badge 
                  className={project.status === 'active' ? 'bg-accent' : 
                           project.status === 'funded' ? 'bg-green-500' : 'bg-destructive'}
                >
                  {project.status === 'active' ? 'Active' : 
                   project.status === 'funded' ? 'Funded' : 'Ended'}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {project.title}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-6">
                {project.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>by {project.creator}</span>
                {project.createdAt && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Project Image */}
            {project.image && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 md:h-96 object-cover"
                  onError={(e) => {
                    // Hide image if it fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Project Description */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>About This Project</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div className="whitespace-pre-line text-muted-foreground">
                  {project.fullDescription || project.description}
                </div>
              </CardContent>
            </Card>

            {/* Rewards */}
            {project.rewards && project.rewards.length > 0 && (
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Rewards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.rewards.map((reward, index) => (
                    <div key={reward.id || index} className="border border-border/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{reward.title}</h4>
                        <span className="text-accent font-bold">{reward.amount} ETH</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Updates */}
            {project.updates && project.updates.length > 0 && (
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Project Updates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.updates.map((update, index) => (
                    <div key={update.id || index} className="border-l-2 border-primary/30 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span className="font-semibold">{update.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(update.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{update.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Stats */}
            <Card className="bg-gradient-card border-border/50 shadow-card">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="text-2xl font-bold text-accent mb-1">
                      <p>{(project.goal ?? 0).toFixed(2)} ETH goal</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{(project.goal ?? 0).toFixed(2)} ETH goal</p>
                    </div>
                  </div>
                  
                  <Progress value={Math.min(progress, 100)} className="h-3" />
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-accent">{project.backers}</div>
                      <div className="text-xs text-muted-foreground">backers</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-accent">{project.daysLeft}</div>
                      <div className="text-xs text-muted-foreground">days left</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contribute */}
            {project.status === 'active' && (
              <Card className="bg-gradient-card border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="text-center">Support This Project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Contribution Amount (ETH)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.1"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button
                    onClick={handleContribute}
                    disabled={isContributing}
                    className="w-full bg-gradient-primary hover:opacity-90"
                    size="lg"
                  >
                    {isContributing ? 'Processing...' : 
                     !isConnected ? 'Connect Wallet to Contribute' : 
                     'Contribute Now'}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Heart className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {project.status === 'funded' && (
              <Card className="bg-gradient-card border-border/50 shadow-card">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-500 mb-2">Project Funded!</h3>
                  <p className="text-sm text-muted-foreground">
                    This project has successfully reached its funding goal.
                  </p>
                </CardContent>
              </Card>
            )}

            {project.status === 'expired' && (
              <Card className="bg-gradient-card border-border/50 shadow-card">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-500 mb-2">Funding Ended</h3>
                  <p className="text-sm text-muted-foreground">
                    The funding period for this project has expired.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-accent">{progress.toFixed(1)}%</span>
                  </div>
                  {project.backers > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Average Contribution</span>
                      <span className="font-medium">
                        {(project.raised / project.backers).toFixed(3)} ETH
                      </span>
                    </div>
                  )}
                  {project.daysLeft > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Funding Rate</span>
                      <span className="font-medium text-accent">
                        {((project.raised / project.goal) * 100 / (30 - project.daysLeft)).toFixed(1)}%/day
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};