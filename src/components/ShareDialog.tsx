import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link as LinkIcon } from 'lucide-react';
import pako from 'pako';

export const ShareDialog = () => {
  const { content } = useEditorStore();
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');

  const generateShareLink = () => {
    try {
      const compressed = pako.deflate(content);
      const base64 = btoa(String.fromCharCode(...compressed));
      const url = `${window.location.origin}?doc=${encodeURIComponent(base64)}`;
      setShareUrl(url);
      
      toast({
        title: 'Share link generated',
        description: 'Copy the link to share your document',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate share link',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Copied!',
      description: 'Share link copied to clipboard',
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Share Your Document</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Generate a shareable link that contains your document content
        </p>
      </div>

      <Button onClick={generateShareLink} className="w-full" variant="outline">
        <LinkIcon className="mr-2 h-4 w-4" />
        Generate Share Link
      </Button>

      {shareUrl && (
        <div className="space-y-2">
          <Label htmlFor="share-url">Share URL</Label>
          <div className="flex gap-2">
            <Input
              id="share-url"
              value={shareUrl}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyToClipboard} size="icon" variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Anyone with this link can view your document
          </p>
        </div>
      )}
    </div>
  );
};
