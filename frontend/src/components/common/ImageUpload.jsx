import { useState, useRef } from 'react';
import { FiUploadCloud, FiImage, FiTrash2, FiCheck, FiLink, FiRefreshCw } from 'react-icons/fi';
import { uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ImageUpload = ({
  value = '',
  onChange,
  label = 'फ़ोटो / छवि अपलोड करें (Upload Image)',
  folder = 'seervi-samaj',
  helperText,
}) => {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('कृपया केवल छवि/फ़ोटो फ़ाइल (JPG, PNG, WebP) चुनें');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('फ़ाइल का आकार 10MB से कम होना चाहिए');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    setUploading(true);
    try {
      const res = await uploadAPI.upload(formData);
      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
        toast.success('फ़ोटो सफलतापूर्वक अपलोड हो गई!');
      } else {
        toast.error('अपलोड विफल रहा');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'फ़ोटो अपलोड करने में त्रुटि');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A2525]">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs font-bold text-[#C85A17] hover:text-[#7A2525] flex items-center gap-1 transition cursor-pointer"
        >
          <FiLink className="w-3 h-3" />
          {showUrlInput ? 'फ़ाइल अपलोडर का उपयोग करें' : 'या URL दर्ज करें'}
        </button>
      </div>

      {showUrlInput ? (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... फ़ोटो लिंक / URL दर्ज करें"
          className="w-full px-4 py-3 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-[#2B211B] focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/20 text-sm font-medium"
        />
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept="image/*"
            className="hidden"
          />

          {value ? (
            /* Uploaded Image Preview Box */
            <div className="p-3 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#E8DCC8] overflow-hidden shrink-0 shadow-sm">
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                  <FiCheck className="w-4 h-4" /> फ़ोटो चयनित / अपलोड है
                </div>
                <p className="text-xs text-[#766A60] truncate font-mono">{value}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-2 text-[#C85A17] hover:bg-white rounded-xl transition border border-[#E8DCC8] cursor-pointer shadow-xs"
                  title="फ़ोटो बदलें"
                >
                  <FiRefreshCw className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 text-red-600 hover:bg-white rounded-xl transition border border-red-200 cursor-pointer shadow-xs"
                  title="फ़ोटो हटाएँ"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Drag & Drop Upload Zone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? 'border-[#C85A17] bg-[#FFF8EC]'
                  : 'border-[#E8DCC8] bg-[#FFF8EC]/40 hover:bg-[#FFF8EC] hover:border-[#C9A44C]'
              }`}
            >
              {uploading ? (
                <div className="py-2 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-3 border-[#C85A17]/30 border-t-[#C85A17] rounded-full animate-spin" />
                  <span className="text-xs font-bold text-[#7A2525]">फ़ोटो अपलोड हो रही है, कृपया प्रतीक्षा करें...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8DCC8] shadow-xs flex items-center justify-center text-[#C85A17]">
                    <FiUploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#2B211B]">
                      कंप्यूटर या मोबाइल से फ़ोटो चुनें या यहाँ खींचकर छोड़ें
                    </p>
                    <p className="text-[11px] text-[#766A60] font-medium mt-0.5">
                      PNG, JPG, WebP (अधिकतम 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {helperText && <p className="text-[11px] text-[#766A60] font-medium">{helperText}</p>}
    </div>
  );
};

export default ImageUpload;
