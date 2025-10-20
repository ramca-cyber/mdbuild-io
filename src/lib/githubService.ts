import { Octokit } from '@octokit/rest';

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = 'Ov23li7HGFSK9WVdZpQE'; // Public client ID for the app
const REDIRECT_URI = `${window.location.origin}/github-callback`;

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  private: boolean;
  description: string | null;
  default_branch: string;
}

export interface GitHubFile {
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
}

export interface GitHubFileContent {
  content: string;
  sha: string;
  path: string;
  repo: string;
  owner: string;
  branch: string;
}

class GitHubService {
  private octokit: Octokit | null = null;
  private token: string | null = null;

  constructor() {
    // Try to load token from localStorage
    const savedToken = localStorage.getItem('github-token');
    if (savedToken) {
      this.setToken(savedToken);
    }
  }

  setToken(token: string) {
    this.token = token;
    this.octokit = new Octokit({ auth: token });
    localStorage.setItem('github-token', token);
  }

  clearToken() {
    this.token = null;
    this.octokit = null;
    localStorage.removeItem('github-token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Initiate GitHub OAuth flow
  initiateOAuth() {
    const scope = 'repo'; // Access to repositories
    const state = Math.random().toString(36).substring(7); // CSRF protection
    localStorage.setItem('github-oauth-state', state);
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}&state=${state}`;
    window.location.href = authUrl;
  }

  // Verify OAuth callback state
  verifyOAuthState(state: string): boolean {
    const savedState = localStorage.getItem('github-oauth-state');
    localStorage.removeItem('github-oauth-state');
    return state === savedState;
  }

  // Exchange code for token using GitHub's device flow proxy
  async exchangeCodeForToken(code: string): Promise<string> {
    // Note: In production, this should go through a backend proxy to keep the client secret secure
    // For now, we'll use GitHub's device flow which doesn't require a client secret
    // The user will need to complete this step or we'll need a backend edge function
    
    throw new Error('Token exchange requires a backend endpoint. Please use Personal Access Token method instead.');
  }

  // Get authenticated user info
  async getUser() {
    if (!this.octokit) throw new Error('Not authenticated');
    
    const { data } = await this.octokit.users.getAuthenticated();
    return data;
  }

  // Get user's repositories
  async getRepositories(): Promise<GitHubRepo[]> {
    if (!this.octokit) throw new Error('Not authenticated');
    
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });
    
    return data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
      description: repo.description,
      default_branch: repo.default_branch,
    }));
  }

  // Get repository tree (files and directories)
  async getRepositoryTree(owner: string, repo: string, branch: string = 'main'): Promise<GitHubFile[]> {
    if (!this.octokit) throw new Error('Not authenticated');
    
    try {
      const { data } = await this.octokit.git.getTree({
        owner,
        repo,
        tree_sha: branch,
        recursive: '1', // Get all files recursively
      });
      
      // Filter for markdown files only
      const markdownFiles = data.tree
        .filter(item => item.type === 'blob' && item.path?.endsWith('.md'))
        .map(item => ({
          path: item.path!,
          sha: item.sha!,
          size: item.size!,
          type: 'file' as const,
        }));
      
      return markdownFiles;
    } catch (error) {
      // If branch doesn't exist, try 'master'
      if (branch === 'main') {
        return this.getRepositoryTree(owner, repo, 'master');
      }
      throw error;
    }
  }

  // Get file content
  async getFileContent(owner: string, repo: string, path: string, branch: string = 'main'): Promise<GitHubFileContent> {
    if (!this.octokit) throw new Error('Not authenticated');
    
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });
    
    if ('content' in data && data.type === 'file') {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return {
        content,
        sha: data.sha,
        path: data.path,
        repo,
        owner,
        branch,
      };
    }
    
    throw new Error('Not a file or content not available');
  }

  // Update file (commit changes)
  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    sha: string,
    commitMessage: string,
    branch: string = 'main'
  ): Promise<string> {
    if (!this.octokit) throw new Error('Not authenticated');
    
    const { data } = await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: commitMessage,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch,
    });
    
    return data.content?.sha || sha;
  }

  // Search for markdown files in a repository
  async searchMarkdownFiles(owner: string, repo: string, query: string): Promise<GitHubFile[]> {
    if (!this.octokit) throw new Error('Not authenticated');
    
    const { data } = await this.octokit.search.code({
      q: `${query} extension:md repo:${owner}/${repo}`,
    });
    
    return data.items.map(item => ({
      path: item.path,
      sha: item.sha,
      size: 0,
      type: 'file' as const,
    }));
  }
}

export const githubService = new GitHubService();

