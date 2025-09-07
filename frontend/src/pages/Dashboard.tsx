import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/contexts/WalletContext';
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  ExternalLink,
  Plus,
  Heart,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types for API responses
interface Contribution {
  id: string;
  projectId: string;
  projectTitle: string;
  projectImage?: string;
  amount: number;
  date: string;
  status: 'pending' | 'confirmed' | 'failed';
  tokensEarned: number;
  projectStatus: 'active' | 'funded' | 'expired';
}

interface SavedProject {
  id: string;
  title: string;
  image?: string;
  category: string;
  daysLeft: number;
  status: string;
}

interface Activity {
  id: string;
  type: 'contribution' | 'save' | 'unsave' | 'project_update';
  description: string;
  date: string;
  projectId?: string;
  projectTitle?: string;
}

interface UserStats {
  totalContributed: number;
  projectsBacked: number;
  tokensEarned: number;
  activeContributions: number;
}

interface UserDashboardData {
  stats: UserStats;
  contributions: Contribution[];
  savedProjects: SavedProject[];
  recentActivity: Activity[];
}

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const Dashboard: React.FC = () => {
  const { isConnected, address, connectWallet } = useWallet();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user dashboard data from API
  const fetchDashboardData = async () => {
    if (!isConnected || !address) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/projects`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UserDashboardData = await response.json();
      setDashboardData(data);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      fetchDashboardData();
    }
  }, [isConnected, address]);

  // Handle unsaving a project
  const handleUnsaveProject = async (projectId: string) => {
    if (!isConnected || !address) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/${address}/saved-projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh dashboard data
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Error unsaving project:', err);
    }
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Wallet className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Connect your wallet to view your dashboard and track your contributions.
            </p>
            <Button onClick={connectWallet} size="lg" className="bg-gradient-primary hover:opacity-90">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your crowdfunding activity overview.
            </p>
          </div>
          <Button
            onClick={fetchDashboardData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {loading && !dashboardData && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
          </div>
        )}

        {/* Error State */}
        {error && !dashboardData && (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="text-xl font-semibold mb-2">Error Loading Dashboard</div>
            <div className="text-muted-foreground mb-6">{error}</div>
            <Button onClick={handleRetry} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Dashboard Content */}
        {dashboardData && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Contributed</p>
                      <p className="text-2xl font-bold text-accent">
                        {dashboardData.stats.totalContributed.toFixed(2)} ETH
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Projects Backed</p>
                      <p className="text-2xl font-bold">{dashboardData.stats.projectsBacked}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tokens Earned</p>
                      <p className="text-2xl font-bold">{dashboardData.stats.tokensEarned.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold">{dashboardData.stats.activeContributions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="contributions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="contributions">My Contributions</TabsTrigger>
                <TabsTrigger value="saved">Saved Projects</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="contributions" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Your Contributions</h2>
                  <Button
                    onClick={() => navigate('/')}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Back New Project
                  </Button>
                </div>

                {dashboardData.contributions.length > 0 ? (
                  <div className="grid gap-6">
                    {dashboardData.contributions.map((contribution) => (
                      <Card key={contribution.id} className="bg-gradient-card border-border/50">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {contribution.projectImage && (
                              <img
                                src={contribution.projectImage}
                                alt={contribution.projectTitle}
                                className="w-16 h-16 rounded-lg object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-lg">{contribution.projectTitle}</h3>
                                <div className="flex gap-2">
                                  <Badge
                                    className={
                                      contribution.status === 'confirmed'
                                        ? 'bg-green-500'
                                        : contribution.status === 'pending'
                                          ? 'bg-yellow-500'
                                          : 'bg-red-500'
                                    }
                                  >
                                    {contribution.status}
                                  </Badge>
                                  <Badge
                                    className={
                                      contribution.projectStatus === 'funded'
                                        ? 'bg-accent'
                                        : contribution.projectStatus === 'active'
                                          ? 'bg-primary'
                                          : 'bg-destructive'
                                    }
                                  >
                                    {contribution.projectStatus}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Contributed</p>
                                  <p className="font-medium text-accent">{contribution.amount} ETH</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Date</p>
                                  <p className="font-medium">
                                    {new Date(contribution.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Tokens Earned</p>
                                  <p className="font-medium text-accent">
                                    {contribution.tokensEarned.toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/project/${contribution.projectId}`)}
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gradient-card border-border/50">
                    <CardContent className="p-8 text-center">
                      <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mb-4">No contributions yet</p>
                      <Button onClick={() => navigate('/discover')}>
                        Discover Projects
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="saved" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Saved Projects</h2>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                  >
                    Discover More
                  </Button>
                </div>

                {dashboardData.savedProjects.length > 0 ? (
                  <div className="grid gap-4">
                    {dashboardData.savedProjects.map((project) => (
                      <Card key={project.id} className="bg-gradient-card border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {project.image && (
                              <img
                                src={project.image}
                                alt={project.title}
                                className="w-12 h-12 rounded-lg object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold">{project.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">{project.category}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {project.daysLeft > 0 ? `${project.daysLeft} days left` : 'Ended'}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnsaveProject(project.id)}
                              >
                                <Heart className="w-3 h-3 fill-current" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => navigate(`/project/${project.id}`)}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gradient-card border-border/50">
                    <CardContent className="p-8 text-center">
                      <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mb-4">No saved projects yet</p>
                      <Button onClick={() => navigate('/')}>
                        Discover Projects
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <h2 className="text-xl font-semibold">Recent Activity</h2>

                {dashboardData.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentActivity.map((activity) => (
                      <Card key={activity.id} className="bg-gradient-card border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${activity.type === 'contribution' ? 'bg-primary/20' :
                              activity.type === 'save' ? 'bg-red-500/20' :
                                'bg-accent/20'
                              }`}>
                              {activity.type === 'contribution' && <Wallet className="w-4 h-4 text-primary" />}
                              {activity.type === 'save' && <Heart className="w-4 h-4 text-red-500" />}
                              {activity.type === 'unsave' && <Heart className="w-4 h-4 text-muted-foreground" />}
                              {activity.type === 'project_update' && <CheckCircle className="w-4 h-4 text-accent" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(activity.date).toLocaleDateString()}
                              </p>
                            </div>
                            {activity.projectId && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/project/${activity.projectId}`)}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gradient-card border-border/50">
                    <CardContent className="p-6">
                      <div className="text-center text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No recent activity to show.</p>
                        <p className="text-sm mt-2">Your recent contributions and interactions will appear here.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};