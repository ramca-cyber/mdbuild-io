import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { githubService } from '@/lib/githubService';
import { useToast } from '@/hooks/use-toast';
import { Github, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';

export const GitHubSettings = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setGithubConnected } = useEditorStore();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const connected = githubService.isAuthenticated();
    setIsConnected(connected);
    setGithubConnected(connected);
    
    if (connected) {
      try {
        const user = await githubService.getUser();
        setUsername(user.login);
      } catch (error) {
        console.error('Failed to get user info:', error);
        setIsConnected(false);
        setGithubConnected(false);
      }
    }
  };

  const handleConnect = async () => {
    if (!token.trim()) {
      toast({
        title: 'Token required',
        description: 'Please enter your GitHub Personal Access Token',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      githubService.setToken(token.trim());
      const user = await githubService.getUser();
      setUsername(user.login);
      setIsConnected(true);
      setGithubConnected(true);
      setToken('');
      
      toast({
        title: 'Connected to GitHub',
        description: `Successfully connected as ${user.login}`,
      });
    } catch (error) {
      githubService.clearToken();
      setIsConnected(false);
      setGithubConnected(false);
      toast({
        title: 'Connection failed',
        description: 'Invalid token or network error. Please check your token and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    githubService.clearToken();
    setIsConnected(false);
    setGithubConnected(false);
    setUsername('');
    setToken('');
    
    toast({
      title: 'Disconnected',
      description: 'GitHub connection removed',
    });
  };

  if (isConnected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-4 bg-secondary/20 rounded-lg border border-border">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="font-medium">Connected to GitHub</p>
            <p className="text-sm text-muted-foreground">@{username}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </div>
        
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <p className="text-sm font-medium">You can now:</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Open markdown files from your repositories</li>
            <li>Save changes directly to GitHub</li>
            <li>Browse all your repos and .md files</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium">Connect to GitHub</p>
          <p className="text-sm text-muted-foreground">
            To enable GitHub integration, you need to provide a Personal Access Token (PAT).
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="github-token">Personal Access Token</Label>
          <Input
            id="github-token"
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConnect();
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Create a token at{' '}
            <a
              href="https://github.com/settings/tokens/new?scopes=repo&description=MDBuild.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              github.com/settings/tokens
            </a>
            {' '}with <code className="text-xs bg-muted px-1 py-0.5 rounded">repo</code> scope
          </p>
        </div>

        <Button
          onClick={handleConnect}
          disabled={isLoading || !token.trim()}
          className="w-full"
        >
          <Github className="h-4 w-4 mr-2" />
          {isLoading ? 'Connecting...' : 'Connect GitHub'}
        </Button>
      </div>
    </div>
  );
};
