import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  example?: string;
}

export const FeatureCard = ({ icon: Icon, title, description, example }: FeatureCardProps) => {
  return (
    <Card className="hover-scale transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {example && (
        <CardContent>
          <div className="bg-muted rounded-md p-3 text-sm font-mono text-muted-foreground">
            {example}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
