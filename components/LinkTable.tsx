'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Trash2, BarChart2, ExternalLink } from 'lucide-react';
import CopyButton from './CopyButton';
import { formatDate, truncateUrl } from '@/lib/utils';
import Link from 'next/link';

type Link = {
  id: number;
  code: string;
  targetUrl: string;
  totalClicks: number;
  lastClickedAt: string | null;
  createdAt: string;
};

export default function LinkTable() {
  const [links, setLinks] = useState<Link[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(
        `/api/links${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch links' }));
        throw new Error(errorData.error || 'Failed to fetch links');
      }
      
      const data = await response.json();
      
      // Handle both response formats: direct array or { links: [] }
      const linksData = Array.isArray(data) ? data : (data.links || []);
      
      setLinks(linksData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load links';
      setError(errorMessage);
      console.error('Error fetching links:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchLinks();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete link' }));
        throw new Error(errorData.error || 'Failed to delete link');
      }
      
      // Refresh the links list
      await fetchLinks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete link';
      setError(errorMessage);
      console.error('Error deleting link:', err);
      // Show error for 3 seconds then clear
      setTimeout(() => setError(''), 3000);
    }
  };

  const getFullShortUrl = (code: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/${code}`;
    }
    return `/${code}`;
  };

  if (isLoading && links.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-12 bg-muted rounded w-full"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Links</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your shortened URLs
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by code or URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
            aria-label="Search links"
          />
        </div>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 rounded-full bg-muted">
              <ExternalLink className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">
              {searchTerm ? 'No links found' : 'No links yet'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {searchTerm 
                ? 'Try adjusting your search terms or clear the search to see all links.'
                : 'Create your first short link by entering a URL above.'}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Short Link
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Destination
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Clicks
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Last Clicked
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {links.map((link) => {
                  const fullShortUrl = getFullShortUrl(link.code);
                  return (
                    <tr 
                      key={`${link.id}-${link.code}`} 
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <a
                            href={fullShortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                            title={`Visit ${fullShortUrl}`}
                          >
                            {fullShortUrl}
                            <ExternalLink className="h-3 w-3 opacity-70" />
                          </a>
                          <code className="text-xs text-muted-foreground font-mono">
                            /{link.code}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs">
                        <a 
                          href={link.targetUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1 truncate"
                          title={link.targetUrl}
                        >
                          <span className="truncate">{truncateUrl(link.targetUrl, 40)}</span>
                          <ExternalLink className="h-3 w-3 opacity-70 flex-shrink-0" />
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {link.totalClicks}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(link.lastClickedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            asChild 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-muted"
                            title="View Statistics"
                          >
                            <Link href={`/code/${link.code}`}>
                              <BarChart2 className="h-4 w-4" />
                              <span className="sr-only">View Statistics for {link.code}</span>
                            </Link>
                          </Button>
                          <CopyButton 
                            text={link.targetUrl} 
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted"
                            aria-label={`Copy link ${fullShortUrl}`}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete(link.code);
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Delete Link"
                            aria-label={`Delete link ${link.code}`}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}