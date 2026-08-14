import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { galleryAPI } from '../../services/api';
import { SkeletonImageGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    Promise.all([
      galleryAPI.getAll({ limit: 60, status: 'active' }),
      galleryAPI.getAlbums(),
    ])
      .then(([imgRes, albRes]) => {
        setImages(imgRes.data.data || []);
        setAlbums(albRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedAlbum === 'All' ? images : images.filter(img => img.album?.title === selectedAlbum || img.album?._id === selectedAlbum);

  const openLightbox = (idx) => setLightbox(idx);
  const closeLightbox = () => setLightbox(null);
  const prevImage = () => setLightbox(l => (l > 0 ? l - 1 : filtered.length - 1));
  const nextImage = () => setLightbox(l => (l < filtered.length - 1 ? l + 1 : 0));

  useEffect(() => {
    const handleKey = (e) => {
      if (lightbox === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, filtered]);

  return (
    <div className="bg-[#160D08] min-h-screen text-[#FFF3DD]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#D4AF37]/20">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-[#D4AF37]/35 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              स्मृति वीथिका
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">चित्र दीर्घा (Gallery)</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">सीरवी समाज कोणदा के उत्सवों और सामूहिक स्मृतियों के सुंदर पल</p>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Album filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center border-b border-[#D4AF37]/10 pb-6">
          <button
            onClick={() => setSelectedAlbum('All')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
              selectedAlbum === 'All'
                ? 'bg-[#7A2525] border-[#D4AF37]/40 text-[#D4AF37] shadow-lg'
                : 'bg-[#2A1010] border-[#D4AF37]/15 text-[#CDBBA4] hover:border-[#D4AF37]/45'
            }`}
          >
            All Photos ({images.length})
          </button>
          {albums.map(album => (
            <button
              key={album._id}
              onClick={() => setSelectedAlbum(album._id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                selectedAlbum === album._id
                  ? 'bg-[#7A2525] border-[#D4AF37]/40 text-[#D4AF37] shadow-lg'
                  : 'bg-[#2A1010] border-[#D4AF37]/15 text-[#CDBBA4] hover:border-[#D4AF37]/45'
              }`}
            >
              {album.title}
            </button>
          ))}
        </div>

        {loading ? (
          <SkeletonImageGrid count={8} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiImage} title="कोई चित्र उपलब्ध नहीं" description="वर्तमान में गैलरी में कोई फोटो उपलब्ध नहीं है।" />
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((img, i) => (
              <motion.div
                key={img._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 12) * 0.04 }}
                className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-2xl border border-[#D4AF37]/15 shadow-lg"
                onClick={() => openLightbox(i)}
              >
                <img
                  src={img.url || img.imageUrl}
                  alt={img.title || `Gallery ${i + 1}`}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 rounded-2xl">
                  {img.title && <p className="text-[#FFF3DD] text-xs font-bold">{img.title}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10 cursor-pointer">
              <FiX className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer">
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={filtered[lightbox]?.url || filtered[lightbox]?.imageUrl}
              alt={filtered[lightbox]?.title}
              className="max-h-[90vh] max-w-full object-contain rounded-xl"
              onClick={e => e.stopPropagation()}
            />
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer">
              <FiChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 text-white/60 text-sm">
              {lightbox + 1} / {filtered.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
