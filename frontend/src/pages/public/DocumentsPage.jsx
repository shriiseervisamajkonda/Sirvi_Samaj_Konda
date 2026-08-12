import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiFile } from 'react-icons/fi';
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
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 py-16 text-white relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">Documents</h1>
            <p className="text-teal-100 text-lg">Download forms, certificates, and community documents</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                category === cat ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-teal-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState icon={FiFileText} title="No documents" description="Documents will be uploaded soon." />
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
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-2xl shrink-0">
                    {docTypeIcons[ext]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate">{doc.title}</h3>
                    {doc.description && <p className="text-gray-500 dark:text-gray-400 text-xs mb-2 line-clamp-2">{doc.description}</p>}
                    <div className="flex items-center gap-2">
                      {doc.category && <Badge variant="success" size="xs">{doc.category}</Badge>}
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="ml-auto flex items-center gap-1 text-xs text-teal-500 hover:text-teal-700 font-medium transition-colors"
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
