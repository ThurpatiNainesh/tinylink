import { notFound } from 'next/navigation';
import { getLinkByCode } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function LinkStatsPage({
  params,
}: {
  params: { code: string };
}) {
  const link = await getLinkByCode(params.code);

  if (!link) {
    notFound();
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${link.code}`;
  const formattedCreatedAt = new Date(link.createdAt).toLocaleString();
  const formattedLastClicked = link.lastClickedAt 
    ? new Date(link.lastClickedAt).toLocaleString() 
    : 'Never';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Link Analytics</h1>
        <p className="text-muted-foreground">
          Track performance for your short link
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Link Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Short URL</p>
                <div className="flex items-center gap-2">
                  <a 
                    href={shortUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {shortUrl}
                  </a>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Destination URL</p>
                <div className="flex items-center gap-2">
                  <a 
                    href={link.targetUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {link.targetUrl}
                  </a>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open in new tab</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">{link.totalClicks}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{formattedCreatedAt}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Last Clicked</p>
                  <p className="text-sm">{formattedLastClicked}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future charts */}
        <Card>
          <CardHeader>
            <CardTitle>Click Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Click analytics coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button asChild variant="outline">
          <Link href="/">
            ← Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}