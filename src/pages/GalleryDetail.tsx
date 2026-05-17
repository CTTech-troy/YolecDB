import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvents';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card } from '@/components/ui';
import { isEventListing, isGalleryItem } from '@/lib/galleryUtils';
import { statusBadge } from '@/lib/tableStyles';
import { PUBLIC_SITE_URL } from '@/config/domains';

const siteBase = PUBLIC_SITE_URL;

export function GalleryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading, isError } = useEvent(id || '');

  if (!id) {
    return <Navigate to="/gallery" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="space-y-6 text-center">
        <PageHeader title="Not found" description="This gallery item could not be loaded." />
        <Button onClick={() => navigate('/gallery')}>Back to Gallery</Button>
      </div>
    );
  }

  if (isEventListing(item)) {
    return <Navigate to="/events" replace />;
  }

  const publicUrl = siteBase ? `${siteBase}/gallery/${id}` : `/gallery/${id}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={item.title || 'Gallery image'}
        description="Full gallery item details"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate('/gallery')}>
              Back to Gallery
            </Button>
            <Button
              variant="secondary"
              icon="ri-external-link-line"
              onClick={() => window.open(publicUrl, '_blank', 'noopener,noreferrer')}
            >
              View on site
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card padding="none" className="overflow-hidden">
          {item.url ? (
            <img
              src={item.url}
              alt={item.title}
              className="max-h-[min(70vh,720px)] w-full object-contain bg-slate-100 dark:bg-slate-950"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center text-slate-400">
              No image
            </div>
          )}
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Status
            </p>
            <span className={item.publish ? statusBadge.success : statusBadge.neutral}>
              {item.publish ? 'Published' : 'Draft'}
            </span>
          </div>

          {item.description ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Description
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {item.description}
              </p>
            </div>
          ) : null}

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">ID</p>
              <p className="mt-1 break-all font-mono text-slate-700 dark:text-slate-200">{item.id}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Type</p>
              <p className="mt-1 text-slate-700 dark:text-slate-200">
                {isGalleryItem(item) ? 'Gallery image' : 'Event listing'}
              </p>
            </div>
            {item.createdAt ? (
              <div>
                <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                  Added
                </p>
                <p className="mt-1 text-slate-700 dark:text-slate-200">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ) : null}
            {item.updatedAt ? (
              <div>
                <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                  Updated
                </p>
                <p className="mt-1 text-slate-700 dark:text-slate-200">
                  {new Date(item.updatedAt).toLocaleString()}
                </p>
              </div>
            ) : null}
          </div>

          <Link
            to="/gallery"
            className="inline-flex text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← All gallery images
          </Link>
        </Card>
      </div>
    </div>
  );
}
