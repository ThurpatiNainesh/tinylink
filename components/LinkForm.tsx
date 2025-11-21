'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function LinkForm() {
  const [targetUrl, setTargetUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUrl,
          customCode: customCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create short link');
      }

      setSuccess('Short link created successfully!');
      setTargetUrl('');
      setCustomCode('');
      router.refresh(); // Refresh the page to show the new link
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Create a new short link</h2>
        <p className="text-muted-foreground">
          Create a short, memorable link for any URL
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="targetUrl">Destination URL</Label>
          <Input
            id="targetUrl"
            type="url"
            placeholder="https://example.com/very/long/url"
            value={targetUrl}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTargetUrl(e.target.value)}
            required
            className={error ? 'border-red-500' : ''}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="customCode">Custom code (optional)</Label>
            <span className="text-sm text-muted-foreground">6-8 alphanumeric characters</span>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                id="customCode"
                placeholder="mylink"
                value={customCode}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  // Only allow alphanumeric characters
                  const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                  setCustomCode(value);
                }}
                maxLength={8}
                className={cn('w-full', error ? 'border-red-500' : '')}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
            {success}
          </div>
        )}
      </form>
    </div>
  );
}
