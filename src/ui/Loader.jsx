import { useEffect } from 'react';
const SITE_LOGO_SRC = '/logo.png';

export default function Loader({ message = 'Loading…' }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.value = 0.02;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    const stop = () => {
      osc.stop();
      ctx.close();
    };
    const timer = window.setTimeout(stop, 180);
    return () => {
      window.clearTimeout(timer);
      stop();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700 px-4">
      <div className="relative mb-4">
        <img
          src={SITE_LOGO_SRC}
          alt="YolecHub"
          className="h-20 w-20 object-contain shadow-2xl"
        />
        <span className="absolute -right-2 -top-2 inline-flex h-4 w-4 rounded-full bg-emerald-500 opacity-80 animate-ping" />
        <span className="absolute -right-2 -top-2 inline-flex h-2 w-2 rounded-full bg-emerald-700" />
      </div>
      <div className="text-lg font-semibold">{message}</div>
      <div className="mt-2 text-sm text-gray-500">Fetching live dashboard data…</div>
    </div>
  );
}
