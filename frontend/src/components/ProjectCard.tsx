import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
  backers: number;
  daysLeft: number;
  category: string;
  creator: string;
  status: 'active' | 'funded' | 'ended';
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  image,
  goal,
  raised,
  backers,
  daysLeft,
  category,
  creator,
  status,
}) => {
  const navigate = useNavigate();
  const progress = (raised / goal) * 100;
  
  const getStatusColor = () => {
    switch (status) {
      case 'funded':
        return 'bg-accent';
      case 'ended':
        return 'bg-destructive';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-hover hover:-translate-y-1 bg-gradient-card border-border/50"
      onClick={() => navigate(`/project/${id}`)}
    >
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <Badge 
            className={`absolute top-3 right-3 ${getStatusColor()} text-white`}
          >
            {status === 'funded' ? 'Funded' : status === 'ended' ? 'Ended' : 'Active'}
          </Badge>
          <Badge 
            variant="secondary" 
            className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm"
          >
            {category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {description}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              by {creator}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-accent font-semibold">
                {raised.toFixed(2)} ETH
              </span>
              <span className="text-muted-foreground">
                of {goal.toFixed(2)} ETH
              </span>
            </div>
            <Progress 
              value={Math.min(progress, 100)} 
              className="h-2"
            />
          </div>
          
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{backers} backers</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="text-sm">
              <span className="text-muted-foreground">Progress: </span>
              <span className="font-medium text-accent">
                {progress.toFixed(1)}%
              </span>
            </div>
            <Target className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};