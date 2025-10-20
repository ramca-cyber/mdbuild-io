import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { githubService, GitHubRepo, GitHubFile } from '@/lib/githubService';
import { useToast } from '@/hooks/use-toast';
import { useEditorStore } from '@/store/editorStore';
import { Github, FolderOpen, FileText, Search, Loader2, ChevronRight, ChevronDown } from 'lucide-react';

interface GitHubFileBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GitHubFileBrowser = ({ open, onOpenChange }: GitHubFileBrowserProps) => {
  const { toast } = useToast();
  const { setContent, setCurrentGithubFile, setCurrentDocId } = useEditorStore();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    if (open && repos.length === 0) {
      loadRepositories();
    }
  }, [open]);

  const loadRepositories = async () => {
    setIsLoadingRepos(true);
    try {
      const userRepos = await githubService.getRepositories();
      setRepos(userRepos);
    } catch (error: any) {
      toast({
        title: 'Failed to load repositories',
        description: error.message || 'Please check your connection and try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const loadFiles = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setIsLoadingFiles(true);
    try {
      const markdownFiles = await githubService.getRepositoryTree(
        repo.owner,
        repo.name,
        repo.default_branch
      );
      setFiles(markdownFiles);
    } catch (error: any) {
      toast({
        title: 'Failed to load files',
        description: error.message || 'Could not load files from repository',
        variant: 'destructive',
      });
      setFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const openFile = async (file: GitHubFile) => {
    if (!selectedRepo) return;

    setIsLoadingContent(true);
    try {
      const fileContent = await githubService.getFileContent(
        selectedRepo.owner,
        selectedRepo.name,
        file.path,
        selectedRepo.default_branch
      );

      setContent(fileContent.content);
      setCurrentGithubFile({
        repo: selectedRepo.name,
        owner: selectedRepo.owner,
        path: file.path,
        sha: fileContent.sha,
        branch: selectedRepo.default_branch,
      });
      setCurrentDocId(null); // Clear local document ID when loading from GitHub

      toast({
        title: 'File loaded',
        description: `Opened ${file.path} from ${selectedRepo.full_name}`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Failed to load file',
        description: error.message || 'Could not load file content',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingContent(false);
    }
  };

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter(file =>
    file.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Open from GitHub
          </DialogTitle>
          <DialogDescription>
            {selectedRepo
              ? `Select a markdown file from ${selectedRepo.full_name}`
              : 'Select a repository to browse markdown files'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={selectedRepo ? 'Search files...' : 'Search repositories...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Back button when viewing files */}
          {selectedRepo && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedRepo(null);
                setFiles([]);
                setSearchQuery('');
              }}
              className="w-fit"
            >
              <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
              Back to repositories
            </Button>
          )}

          {/* Content */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            {!selectedRepo ? (
              // Repository List
              <div className="space-y-2">
                {isLoadingRepos ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No repositories found' : 'No repositories available'}
                  </div>
                ) : (
                  filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => loadFiles(repo)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <FolderOpen className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{repo.name}</p>
                          {repo.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {repo.owner}
                            </span>
                            {repo.private && (
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                Private
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              // File List
              <div className="space-y-2">
                {isLoadingFiles ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No markdown files found' : 'No markdown files in this repository'}
                  </div>
                ) : (
                  filteredFiles.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => openFile(file)}
                      disabled={isLoadingContent}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent hover:border-accent-foreground/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.path}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
