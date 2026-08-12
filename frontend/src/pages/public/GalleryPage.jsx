import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { galleryAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">Gallery</h1>
            <p className="text-orange-100 text-lg">Cherished moments from our community</p>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Album filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedAlbum('All')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              selectedAlbum === 'All'
                ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-orange-300'
            }`}
          >
            All Photos ({images.length})
          </button>
          {albums.map(album => (
            <button
              key={album._id}
              onClick={() => setSelectedAlbum(album._id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                selectedAlbum === album._id
                  ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-orange-300'
              }`}
            >
              {album.title}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState icon={FiImage} title="No photos yet" description="Gallery photos will be added soon." />
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((img, i) => (
              <motion.div
                key={img._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 12) * 0.04 }}
                className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                onClick={() => openLightbox(i)}
              >
                <img
                  src={img.url || img.imageUrl}
                  alt={img.title || `Gallery ${i + 1}`}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  {img.title && <p className="text-white text-xs font-semibold">{img.title}</p>}
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
            <button onClick={closeLightbox} className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">
              <FiX className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
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
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
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
