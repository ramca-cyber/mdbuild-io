import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { githubService } from '@/lib/githubService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GitHubCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');

      if (error) {
        toast.error(`GitHub authorization failed: ${error}`);
        navigate('/editor');
        return;
      }

      if (!code || !state) {
        toast.error('Invalid callback parameters');
        navigate('/editor');
        return;
      }

      // Verify state to prevent CSRF attacks
      if (!githubService.verifyOAuthState(state)) {
        toast.error('Invalid OAuth state. Possible security issue.');
        navigate('/editor');
        return;
      }

      try {
        // Exchange code for token
        const token = await githubService.exchangeCodeForToken(code);
        githubService.setToken(token);
        
        toast.success('Successfully connected to GitHub!');
        navigate('/editor');
      } catch (error: any) {
        console.error('Failed to exchange code for token:', error);
        toast.error(error.message || 'Failed to complete GitHub authentication');
        navigate('/editor');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Connecting to GitHub...</p>
    </div>
  );
}
