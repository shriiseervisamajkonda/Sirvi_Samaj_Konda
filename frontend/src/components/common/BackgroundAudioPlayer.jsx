import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVolume2, FiVolumeX, FiMusic, FiPlay, FiPause } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Standard background audio filename in public folder
const AUDIO_SRC = '/bhajan.mp3';

const BackgroundAudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [showControls, setShowControls] = useState(false);

  // Handle audio error gracefully if file is not found (no 404 looping)
  const handleAudioError = () => {
    setIsPlaying(false);
    toast.error('भजन ऑडियो (bhajan.mp3) उपलब्ध नहीं है', { id: 'bhajan-audio-error' });
  };

  const togglePlay = (e) => {
    e?.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.volume = isMuted ? 0 : volume;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
          toast.error('भजन ऑडियो (bhajan.mp3) उपलब्ध नहीं है', { id: 'bhajan-audio-error' });
        });
    }
  };

  const toggleMute = (e) => {
    e?.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      if (newVol === 0) setIsMuted(true);
      else setIsMuted(false);
    }
  };

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] right-3 sm:bottom-5 sm:right-auto sm:left-5 z-50 flex items-center">
      {/* Audio element with preload="none" so no network requests are sent on page load */}
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        loop
        preload="none"
        onError={handleAudioError}
      />

      {/* Floating Player Widget */}
      <div
        className="relative"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Expanded Volume / Controls Popup on Hover */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full right-0 sm:right-auto sm:left-0 mb-3 p-3.5 bg-[#3B0A0A]/95 border border-[#F59E0B]/30 rounded-2xl shadow-2xl backdrop-blur-xl w-[min(15rem,calc(100vw-1.5rem))] text-xs text-[#FFF8F0]"
            >
              <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#7F1D1D]/50">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FiMusic className="text-[#F59E0B] shrink-0" />
                  <span className="font-bold truncate text-[#FDE68A]">पृष्ठभूमि भजन संगीत</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isPlaying
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}
                >
                  {isPlaying ? 'चालू' : 'बंद'}
                </span>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-[#F59E0B] hover:text-white transition cursor-pointer p-1"
                >
                  {isMuted || volume === 0 ? <FiVolumeX className="w-4 h-4 text-red-400" /> : <FiVolume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-[#F59E0B] h-1.5 bg-[#230505] rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-[#CDBBA4] w-7 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              <p className="text-[10px] text-[#CDBBA4] text-center pt-1 border-t border-[#7F1D1D]/40">
                {isPlaying ? 'संगीत रोकने हेतु क्लिक करें' : 'संगीत शुरू करने हेतु क्लिक करें'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Capsule Button */}
        <motion.button
          onClick={togglePlay}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-0 sm:gap-2.5 p-2 sm:px-3.5 sm:py-2.5 rounded-full shadow-2xl transition-all duration-300 border cursor-pointer ${
            isPlaying
              ? 'bg-[#3B0A0A]/90 border-[#F59E0B]/50 shadow-[#F59E0B]/20 text-[#FFF8F0]'
              : 'bg-[#230505]/90 border-[#7F1D1D]/60 text-[#CDBBA4] hover:border-[#F59E0B]/40'
          } backdrop-blur-md`}
          title={isPlaying ? 'संगीत रोकें' : 'संगीत चालू करें'}
        >
          {/* Animated Equalizer Wave Bars or Disc */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#EA580C] flex items-center justify-center text-[#230505] shrink-0 shadow">
            {isPlaying ? (
              <FiPause className="w-3 h-3 fill-current" />
            ) : (
              <FiPlay className="w-3 h-3 fill-current ml-0.5" />
            )}
          </div>

          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-xs font-bold text-[#FDE68A] leading-none flex items-center gap-1.5">
              <span>भजन संगीत</span>
              {isPlaying && (
                <span className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-[#F59E0B] h-full animate-pulse" style={{ animationDuration: '0.6s' }} />
                  <span className="w-0.5 bg-[#F59E0B] h-2/3 animate-pulse" style={{ animationDuration: '0.4s' }} />
                  <span className="w-0.5 bg-[#F59E0B] h-full animate-pulse" style={{ animationDuration: '0.8s' }} />
                </span>
              )}
            </span>
            <span className="text-[10px] text-[#CDBBA4] font-medium leading-none mt-0.5">
              {isPlaying ? 'संगीत चालू है • रोकने हेतु क्लिक करें' : 'संगीत बंद है • शुरू करने हेतु क्लिक करें'}
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default BackgroundAudioPlayer;
