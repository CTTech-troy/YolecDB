import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '@livekit/components-styles';
import { HostLiveStudio } from '@/components/live/HostLiveStudio';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { liveApi, LiveSession } from '@/api/live';
import { getSocketOrigin } from '@/lib/socketUrl';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/hooks/useEvents';

export function EventLivePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [session, setSession] = useState<LiveSession | null>(null);
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [title, setTitle] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const { data: event } = useEvent(eventId || '');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await liveApi.getStatus(eventId);
      setSession(res.session);
      setViewerCount(res.session?.viewerCount ?? 0);
      if (res.session?.isLive && authUser) {
        const tok = await liveApi.getHostToken(eventId);
        setToken(tok.token);
        setServerUrl(tok.serverUrl);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load live status');
    } finally {
      setLoading(false);
    }
  }, [eventId, authUser]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (!eventId || !session?.isLive) return undefined;

    const socket: Socket = io(getSocketOrigin(), {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.emit('join-live', {
      eventId,
      userName: authUser?.email || 'Host',
    });

    socket.on('viewer-count', (data: { count: number }) => {
      setViewerCount(data.count ?? 0);
    });

    return () => {
      socket.off('viewer-count');
      if (socket.connected) {
        socket.emit('leave-live');
      }
      socket.disconnect();
    };
  }, [eventId, session?.isLive, authUser?.email]);

  const handleStart = async () => {
    if (!eventId) return;
    setStarting(true);
    try {
      const res = await liveApi.start(
        eventId,
        title || event?.title || undefined,
        event?.url || undefined
      );
      setSession(res.session);
      setToken(res.token);
      setServerUrl(res.serverUrl);
      toast.success('You are live!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start live');
    } finally {
      setStarting(false);
    }
  };

  const handleEnd = async () => {
    if (!eventId) return;
    setEnding(true);
    try {
      await liveApi.end(eventId);
      setSession(null);
      setToken('');
      toast.success('Live ended');
      navigate('/events');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not end live');
    } finally {
      setEnding(false);
    }
  };

  if (!eventId) {
    return <p className="text-slate-500">Invalid event</p>;
  }

  if (loading) {
    return <p className="text-slate-500 dark:text-slate-400">Loading studio…</p>;
  }

  const isLive = session?.isLive && token && serverUrl;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live studio"
        description={session?.title || `Event ${eventId}`}
        action={
          <Link to="/events">
            <Button variant="ghost">Back to events</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
            isLive
              ? 'bg-red-500/15 text-red-600 dark:text-red-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}
          />
          {isLive ? 'LIVE' : 'Offline'}
        </span>
        {isLive && (
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {viewerCount} viewer{viewerCount === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {!isLive ? (
        <Card className="max-w-lg space-y-4 p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Start a live broadcast for this event. Viewers will see it on the public event page.
          </p>
          <Input
            label="Stream title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Live session title"
          />
          {event?.url ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Thumbnail
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Uses this event&apos;s cover image
              </p>
              <img
                src={event.url}
                alt=""
                className="h-24 w-40 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
              />
            </div>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              No cover image on this event — add one in Events before going live.
            </p>
          )}
          <Button onClick={handleStart} loading={starting} icon="ri-live-line">
            Go live
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black dark:border-slate-700">
            <HostLiveStudio token={token} serverUrl={serverUrl} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Allow camera and microphone when your browser asks. Use the control bar under the
            preview to toggle devices.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="danger" onClick={handleEnd} loading={ending}>
              End live
            </Button>
            <a
              href={`${import.meta.env.VITE_PUBLIC_SITE_URL || ''}/event/${eventId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-sm text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Open public event page
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
