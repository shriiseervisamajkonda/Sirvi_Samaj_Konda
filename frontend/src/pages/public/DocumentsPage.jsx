import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText } from 'react-icons/fi';
import { documentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const docTypeIcons = {
  pdf: '📄', excel: '📊', word: '📝', image: '🖼️', other: '📁',
};

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    documentAPI.getAll({ limit: 50, status: 'active' })
      .then(res => setDocuments(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(documents.map(d => d.category).filter(Boolean))];
  const filtered = category === 'All' ? documents : documents.filter(d => d.category === category);

  const getFileExt = (url) => {
    if (!url) return 'other';
    const ext = url.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'excel';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
    return 'other';
  };

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
              संसाधन एवं प्रपत्र
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">महत्वपूर्ण दस्तावेज (Documents)</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">समाज के नियम-कायदे, प्रपत्र, प्रमाण-पत्र और आधिकारिक सूचियां डाउनलोड करें</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                category === cat 
                  ? 'bg-[#7A2525] border-[#D4AF37]/40 text-[#D4AF37] shadow-lg' 
                  : 'bg-[#2A1010] border-[#D4AF37]/15 text-[#CDBBA4] hover:border-[#D4AF37]/45'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiFileText} title="कोई दस्तावेज उपलब्ध नहीं" description="वर्तमान में कोई दस्तावेज अपलोड नहीं किया गया है।" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc, i) => {
              const ext = getFileExt(doc.fileUrl);
              return (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-[#2A1010] rounded-2xl p-5 border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 hover:shadow-xl transition-all duration-300 flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#7A2525]/30 flex items-center justify-center text-2xl shrink-0">
                    {docTypeIcons[ext]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#FFF3DD] text-sm mb-1 truncate">{doc.title}</h3>
                    {doc.description && <p className="text-[#CDBBA4] text-xs mb-2 line-clamp-2 leading-relaxed">{doc.description}</p>}
                    <div className="flex items-center gap-2">
                      {doc.category && <Badge variant="success" size="xs">{doc.category}</Badge>}
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="ml-auto flex items-center gap-1 text-xs text-[#C85A17] hover:text-[#D4AF37] font-bold transition-colors"
                        >
                          <FiDownload className="w-3.5 h-3.5" /> Download
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
