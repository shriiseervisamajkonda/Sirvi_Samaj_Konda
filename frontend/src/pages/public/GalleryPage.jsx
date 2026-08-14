import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { galleryAPI } from '../../services/api';
import { SkeletonImageGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const defaultGalleryImages = [
  { _id: 'g-temple-1', url: '/aai_mata_temple.webp', title: 'श्री आई जी मंदिर (बडेर) कोणदा' },
  { _id: 'g-temple-2', url: '/aai_mataji_portrait.jpg', title: 'श्री आई माताजी पावन स्वरूप' },
  { _id: 'g-temple-3', url: '/hero_background.webp', title: 'सिर्वी समाज कोणदा धरोहर' },
];

const GalleryPage = () => {
  const [images, setImages] = useState(defaultGalleryImages);
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
        const fetchedImages = imgRes.data.data || [];
        setImages(fetchedImages.length > 0 ? fetchedImages : defaultGalleryImages);
        setAlbums(albRes.data.data || []);
      })
      .catch((err) => {
        console.warn('Gallery load error, using default images:', err);
        setImages(defaultGalleryImages);
      })
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
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#E8DCC8] bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-white shadow-sm">
              स्मृति वीथिका
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3 text-white">चित्र दीर्घा</h1>
            <p className="text-orange-100 text-lg font-medium">सीरवी समाज कोणदा के उत्सवों, मंदिर दर्शन और सामूहिक स्मृतियों के सुंदर पल</p>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Album filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center border-b border-[#E8DCC8] pb-6">
          <button
            onClick={() => setSelectedAlbum('All')}
            className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
              selectedAlbum === 'All'
                ? 'bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white border-transparent shadow-md font-black'
                : 'bg-white border-[#E8DCC8] text-[#2B211B] hover:bg-[#FFF8EC]'
            }`}
          >
            सभी चित्र ({images.length})
          </button>
          {albums.map(album => (
            <button
              key={album._id}
              onClick={() => setSelectedAlbum(album._id)}
              className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                selectedAlbum === album._id
                  ? 'bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white border-transparent shadow-md font-black'
                  : 'bg-white border-[#E8DCC8] text-[#2B211B] hover:bg-[#FFF8EC]'
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
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filtered.map((img, i) => (
              <motion.div
                key={img._id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 12) * 0.04 }}
                className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-3xl border border-[#E8DCC8] shadow-md hover:shadow-2xl hover:border-[#C9A44C]/60 transition-all duration-300 bg-white p-2"
                onClick={() => openLightbox(i)}
              >
                <div className="rounded-2xl overflow-hidden bg-[#FAF1E0]">
                  <img
                    src={img.url || img.imageUrl}
                    alt={img.title || `Gallery ${i + 1}`}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                    loading="lazy"
                  />
                </div>
                {img.title && (
                  <div className="p-3">
                    <p className="text-[#2B211B] text-sm font-bold truncate group-hover:text-[#C85A17] transition-colors">{img.title}</p>
                  </div>
                )}
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
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-amber-400 p-2 text-2xl z-10 cursor-pointer"
            >
              <FiX className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 text-white hover:text-amber-400 p-2 z-10 cursor-pointer"
            >
              <FiChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 text-white hover:text-amber-400 p-2 z-10 cursor-pointer"
            >
              <FiChevronRight className="w-8 h-8" />
            </button>
            <div className="max-w-4xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={filtered[lightbox]?.url || filtered[lightbox]?.imageUrl}
                alt={filtered[lightbox]?.title || ''}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border-2 border-white/20"
              />
              {filtered[lightbox]?.title && (
                <p className="text-white text-center mt-4 text-base font-bold bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md">
                  {filtered[lightbox].title}
                </p>
              )}
              <div className="text-white/60 text-xs mt-2 font-medium">
                {lightbox + 1} / {filtered.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
