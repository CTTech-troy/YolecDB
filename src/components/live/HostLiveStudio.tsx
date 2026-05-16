import { useEffect } from 'react';
import {
  ControlBar,
  GridLayout,
  LayoutContextProvider,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useCreateLayoutContext,
  useRoomContext,
  useTracks,
} from '@livekit/components-react';
import { MediaDeviceFailure, RoomEvent, Track } from 'livekit-client';
import toast from 'react-hot-toast';

function EnableHostDevices() {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return undefined;

    const enable = async () => {
      try {
        await room.localParticipant.setCameraEnabled(true);
        await room.localParticipant.setMicrophoneEnabled(true);
      } catch (e) {
        toast.error(
          e instanceof Error
            ? e.message
            : 'Could not access camera or microphone. Allow permissions in your browser.'
        );
      }
    };

    if (room.state === 'connected') {
      enable();
    }

    room.on(RoomEvent.Connected, enable);
    return () => {
      room.off(RoomEvent.Connected, enable);
    };
  }, [room]);

  return null;
}

function HostVideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  if (tracks.length === 0) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-white/70">
        Starting camera…
      </div>
    );
  }

  return (
    <GridLayout tracks={tracks} className="host-live-grid h-full w-full">
      <ParticipantTile />
    </GridLayout>
  );
}

function deviceFailureMessage(failure?: MediaDeviceFailure, kind?: MediaDeviceKind) {
  if (failure === MediaDeviceFailure.PermissionDenied) {
    return 'Camera or microphone permission was denied. Enable access in browser settings.';
  }
  if (failure === MediaDeviceFailure.NotFound) {
    return `No ${kind === 'audioinput' ? 'microphone' : 'camera'} found on this device.`;
  }
  return 'Could not access camera or microphone.';
}

export interface HostLiveStudioProps {
  token: string;
  serverUrl: string;
}

function HostLiveStudioContent() {
  const layoutContext = useCreateLayoutContext();

  return (
    <LayoutContextProvider value={layoutContext}>
      <EnableHostDevices />
      <div className="host-live-studio-inner">
        <div className="host-live-preview">
          <HostVideoGrid />
        </div>
        <RoomAudioRenderer />
        <div className="host-live-controls">
          <ControlBar
            controls={{
              camera: true,
              microphone: true,
              screenShare: true,
              chat: false,
              settings: false,
              leave: false,
            }}
          />
        </div>
      </div>
    </LayoutContextProvider>
  );
}

export function HostLiveStudio({ token, serverUrl }: HostLiveStudioProps) {
  return (
    <LiveKitRoom
      key={`${serverUrl}-${token.slice(0, 24)}`}
      token={token}
      serverUrl={serverUrl}
      connect
      video
      audio
      data-lk-theme="default"
      className="host-live-studio"
      onError={(err) => {
        toast.error(err.message || 'Live connection failed');
      }}
      onMediaDeviceFailure={(failure, kind) => {
        toast.error(deviceFailureMessage(failure, kind));
      }}
    >
      <HostLiveStudioContent />
    </LiveKitRoom>
  );
}
