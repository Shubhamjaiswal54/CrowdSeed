import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ProjectCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, TrendingUp, Clock, Target, Loader2 } from 'lucide-react';
import heroBackground from '@/assets/hero-bg.jpg';
import ProjectForm from './CreateProject';
// Types for API response
interface Project {
  _id: string;
  title: string;
  description: string;
  image?: string;
  goal: number;
  raised: number;
  backers: number;
  daysLeft: number;
  category: string;
  creator: string;
  status: string;
}

interface ApiResponse {
  projects: Project[];
  total: number;
  stats?: {
    totalFunded: number;
    totalRaised: string;
    activeProjects: number;
  };
}

const categories = ['All', 'Gaming', 'Energy', 'Healthcare', 'Technology', 'Art'];

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const Homepage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState([
    { icon: Target, label: 'Projects Funded', value: '0' },
    { icon: TrendingUp, label: 'Total Raised', value: '0 ETH' },
    { icon: Clock, label: 'Active Projects', value: '0' },
  ]);
  const navigate = useNavigate();
  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/projects/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debugging output

      // Correctly extract projects from data.data
      const projectsData = data.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);

      // Update stats if available
      if (data.stats) {
        setStats([
          { icon: Target, label: 'Projects Funded', value: data.stats.totalFunded.toString() },
          { icon: TrendingUp, label: 'Total Raised', value: data.stats.totalRaised },
          { icon: Clock, label: 'Active Projects', value: data.stats.activeProjects.toString() },
        ]);
      } else {
        // Fallback calculation from projects array
        const activeProjects = projectsData.filter(p => p.status === 'active').length;
        const fundedProjects = projectsData.filter(p => p.status === 'funded').length;
        const totalRaised = projectsData.reduce((sum, p) => sum + p.raised, 0);

        setStats([
          { icon: Target, label: 'Projects Funded', value: fundedProjects.toString() },
          { icon: TrendingUp, label: 'Total Raised', value: `${totalRaised.toFixed(1)} ETH` },
          { icon: Clock, label: 'Active Projects', value: activeProjects.toString() },
        ]);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects based on selected category
  const filteredProjects = projects;

  // Retry function for error state
  const handleRetry = () => {
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBackground})` }}
        >
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Decentralized Crowdfunding Platform
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Fund the Future with{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Blockchain
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover groundbreaking projects and support innovation through secure,
              transparent Web3 crowdfunding. Connect your wallet and be part of the revolution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/startproject')}
                className="mb-6"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Start Your Project
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-lg mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-accent">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
              <p className="text-muted-foreground">
                Discover innovative projects seeking funding from the community
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mt-6 lg:mt-0">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ?
                    "bg-gradient-primary" :
                    "border-border/50 hover:border-primary/50"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading projects...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-16">
              <div className="text-red-500 mb-4">
                Error loading projects: {error}
              </div>
              <Button onClick={handleRetry} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && !error && (
            <>
              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project._id}
                      id={project._id}                       // map _id to id
                      title={project.title}
                      description={project.description}
                      image={project.image ?? ''}
                      goal={project.goal}
                      raised={project.raised}
                      backers={project.backers}
                      daysLeft={project.daysLeft}
                      category={project.category}
                      creator={project.creator}
                      status={['active', 'funded', 'ended'].includes(project.status) ? project.status as 'active' | 'funded' | 'ended' : 'ended'}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  {selectedCategory === 'All'
                    ? 'No projects available at the moment.'
                    : `No projects found in the ${selectedCategory} category.`}
                </div>
              )}

              {filteredProjects.length > 0 && (
                <div className="text-center mt-12">
                  <Button variant="outline" size="lg" className="border-primary/20">
                    View All Projects
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent mb-4">
              CrowdChain
            </div>
            <p className="text-muted-foreground mb-6">
              Empowering innovation through decentralized crowdfunding
            </p>
            <div className="flex justify-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};