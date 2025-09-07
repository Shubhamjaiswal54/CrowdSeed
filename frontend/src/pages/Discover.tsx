import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle, Calendar, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types for API response
interface Project {
    id: string;
    title: string;
    description: string;
    goal: number;
    raised: number;
    category: string;
    status: 'active' | 'funded' | 'expired';
    image?: string; // Optional image URL
    createdAt?: string; // Optional creation date
}

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Generate a placeholder image URL based on project category
const getPlaceholderImage = (category: string, id: string) => {
    const colors = {
        'Technology': '4F46E5',
        'Art': 'EC4899',
        'Music': '10B981',
        'Film': 'F59E0B',
        'Games': '8B5CF6',
        'Fashion': 'EF4444',
        'Food': 'F97316',
        'Publishing': '06B6D4',
        'Default': '6B7280'
    };

    const color = colors[category as keyof typeof colors] || colors.Default;
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop&auto=format&q=80`;
};

export const Discover: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/projects`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setProjects(result.data || []);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading projects...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <div className="text-xl font-semibold mb-2">Error Loading Projects</div>
                        <div className="text-muted-foreground mb-6">{error}</div>
                        <Button onClick={fetchProjects}>Try Again</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br bg-[rgba(9 , 9 , 11 , 0.)]">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold white mb-2">Discover Projects</h1>
                    <p className="text-lg text-gray-200">Support innovative projects and help bring ideas to life</p>
                </div>

                <div className="space-y-6">
                    {projects.map((project) => {
                        const progress = Math.min((project.raised / project.goal) * 100, 100);
                        const daysLeft = Math.floor(Math.random() * 30) + 1; // Placeholder for days left

                        return (
                            <Card
                                key={project.id}
                                className=" max-h-[50vh] overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-[1.02] bg-white "
                                onClick={() => navigate(`/projects/${project.id}`)}
                            >
                                <div className="flex flex-col md:flex-row h-full bg-[rgba(9 , 9 , 11 , 0.9)]">
                                    {/* Left Section - Image */}
                                    <div className="md:w-1/3 lg:w-2/5 relative">
                                        <div className="aspect-video md:aspect-square w-full h-full">
                                            <img
                                                src={project.image || getPlaceholderImage(project.category, project.id)}
                                                alt={project.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <Badge className={`text-white font-medium ${project.status === 'active' ? 'bg-green-500 hover:bg-green-600' :
                                                        project.status === 'funded' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
                                                    }`}>
                                                    {project.status === 'active' ? 'Active' : project.status === 'funded' ? 'Funded' : 'Ended'}
                                                </Badge>
                                            </div>
                                            <div className="absolute bottom-4 left-4">
                                                <Badge className="bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm">
                                                    {project.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section - Project Details */}
                                    <div className="md:w-2/3 lg:w-3/5 p-6 flex flex-col justify-between bg-[rgba(9 , 9 , 11 , 0.4)]">
                                        <div>
                                            <CardHeader className="p-0 mb-4">
                                                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                                                    {project.title}
                                                </CardTitle>
                                                <p className="text-gray-600 line-clamp-3 leading-relaxed">
                                                    {project.description}
                                                </p>
                                            </CardHeader>

                                            <CardContent className="p-0 space-y-4">
                                                {/* Funding Progress */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                                                        <span className="text-sm text-gray-500">{progress.toFixed(1)}%</span>
                                                    </div>
                                                    <Progress value={progress} className="h-2 bg-gray-200">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </Progress>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-3 gap-2 pt-1">
                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center mb-1">
                                                            <Target className="w-3 h-3 text-gray-500 mr-1" />
                                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Goal</span>
                                                        </div>
                                                        <div className="text-sm font-bold text-gray-900">{project.goal.toFixed(1)} ETH</div>
                                                    </div>

                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center mb-1">
                                                            <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Raised</span>
                                                        </div>
                                                        <div className="text-sm font-bold text-green-600">{project.raised.toFixed(1)} ETH</div>
                                                    </div>

                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center mb-1">
                                                            <Calendar className="w-3 h-3 text-orange-500 mr-1" />
                                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Days Left</span>
                                                        </div>
                                                        <div className="text-sm font-bold text-orange-600">{daysLeft}</div>
                                                    </div>
                                                </div>

                                                {/* Additional Info */}
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                    <div className="text-xs text-gray-500">
                                                        {Math.floor(Math.random() * 100) + 10} backers
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="hover:bg-primary hover:text-white transition-colors text-xs px-3 py-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/projects/${project.id}`);
                                                        }}
                                                    >
                                                        View Project
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}

                    {projects.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-gray-400 mb-4">
                                <Target className="w-16 h-16 mx-auto mb-4" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
                            <p className="text-gray-600">Check back later for new and exciting projects to support!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};