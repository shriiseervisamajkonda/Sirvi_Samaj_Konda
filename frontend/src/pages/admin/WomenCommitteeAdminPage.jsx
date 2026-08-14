import { useEffect, useState } from 'react';
import { FiCalendar, FiEdit2, FiFileText, FiHeart, FiImage, FiMapPin, FiPlus, FiSave, FiShield, FiStar, FiTrash2, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'sirvi_women_committee_admin_data';

const createId = (prefix = 'item') => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const baseData = {
  intro: 'श्री आई जी महिला समिती का उद्देश्य महिलाओं को सशक्त, जागरूक और संगठित बनाना है, ताकि समाज में सेवा, सहयोग और संस्कार को एक साथ बढ़ावा दिया जा सके।',
  subtitle: 'महिला शक्ति • सेवा • संस्कार • सहयोग • समाज उत्थान',
  message: 'यहाँ श्री आई जी महिला समिती का आधिकारिक संदेश प्रदर्शित किया जाएगा।',
  objectives: [
    { id: createId('objective'), title: 'महिला सशक्तिकरण', description: 'महिलाओं को आत्मनिर्भर, जागरूक और संगठित बनाने के लिए प्रयास।' },
    { id: createId('objective'), title: 'समाज सेवा', description: 'जरूरतमंद परिवारों, महिलाओं और बच्चों की सहायता।' },
    { id: createId('objective'), title: 'शिक्षा एवं संस्कार', description: 'शिक्षा, संस्कार और सामाजिक मूल्यों की जागरूकता।' },
  ],
  workAreas: [
    { id: createId('work'), title: 'महिला सशक्तिकरण', content: 'महिलाओं को आत्मनिर्भर, जागरूक और संगठित बनाने के लिए विभिन्न गतिविधियों का आयोजन।' },
    { id: createId('work'), title: 'समाज सेवा', content: 'जरूरतमंद परिवारों, महिलाओं और बच्चों की सहायता के लिए सामाजिक सेवा कार्य।' },
    { id: createId('work'), title: 'शिक्षा एवं संस्कार', content: 'शिक्षा, संस्कार और सामाजिक मूल्यों के प्रति जागरूकता बढ़ाना।' },
  ],
  records: [
    { id: createId('record'), category: 'वर्षवार गतिविधियाँ', details: 'वर्षवार कार्यक्रमों और गतिविधियों का विवरण यहाँ दर्ज किया जाएगा।' },
    { id: createId('record'), category: 'सामाजिक सेवा कार्य', details: 'सामाजिक सेवा कार्यों का विवरण यहाँ दर्ज किया जाएगा।' },
  ],
  activities: [
    { id: createId('activity'), title: 'कार्यक्रम का नाम', date: 'तारीख दर्ज की जाएगी', location: 'स्थान दर्ज किया जाएगा', description: 'कार्यक्रम का विवरण यहाँ दर्ज किया जाएगा।', photo: '', extraInfo: 'संबंधित जानकारी यहाँ उपलब्ध होगी।' },
  ],
  upcomingEvents: [
    { id: createId('event'), title: 'आगामी कार्यक्रम', date: 'तारीख दर्ज की जाएगी', time: 'समय दर्ज किया जाएगा', location: 'स्थान दर्ज किया जाएगा', description: 'विवरण दर्ज किया जाएगा।' },
  ],
  members: [
    { id: createId('member'), name: 'नाम यहाँ दर्ज किया जाएगा', position: 'अध्यक्ष', bio: 'सदस्य का संक्षिप्त परिचय यहाँ दर्ज किया जाएगा।', photo: '' },
    { id: createId('member'), name: 'नाम यहाँ दर्ज किया जाएगा', position: 'सचिव', bio: 'सदस्य का संक्षिप्त परिचय यहाँ दर्ज किया जाएगा।', photo: '' },
  ],
  achievements: [
    { id: createId('achievement'), title: 'सामाजिक सेवा', category: 'सामाजिक सेवा' },
    { id: createId('achievement'), title: 'महिला सहभागिता', category: 'महिला सहभागिता' },
  ],
  gallery: [
    { id: createId('gallery'), title: 'कार्यक्रम', image: '', caption: 'फोटो का शीर्षक यहाँ दर्ज किया जाएगा।' },
  ],
  contact: {
    address: 'पता दर्ज किया जाएगा',
    phone: 'मोबाइल नंबर दर्ज किया जाएगा',
    email: 'ईमेल दर्ज किया जाएगा',
    whatsapp: 'WhatsApp नंबर दर्ज किया जाएगा',
    social: 'सोशल मीडिया लिंक दर्ज किया जाएगा',
    timing: 'समय दर्ज किया जाएगा',
  },
};

const getDefaultData = () => {
  if (typeof window === 'undefined') return baseData;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(baseData);
  } catch {
    return structuredClone(baseData);
  }
};

const emptyItems = {
  objectives: { title: '', description: '' },
  workAreas: { title: '', content: '' },
  records: { category: '', details: '' },
  activities: { title: '', date: '', location: '', description: '', photo: '', extraInfo: '' },
  upcomingEvents: { title: '', date: '', time: '', location: '', description: '' },
  members: { name: '', position: '', bio: '', photo: '' },
  achievements: { title: '', category: '' },
  gallery: { title: '', image: '', caption: '' },
};

const sectionMeta = {
  objectives: { label: 'उद्देश्य', icon: FiStar, fields: ['title', 'description'] },
  workAreas: { label: 'कार्य', icon: FiShield, fields: ['title', 'content'] },
  records: { label: 'लेखा-जोखा', icon: FiFileText, fields: ['category', 'details'] },
  activities: { label: 'प्रमुख गतिविधियाँ', icon: FiCalendar, fields: ['title', 'date', 'location', 'description', 'photo', 'extraInfo'] },
  upcomingEvents: { label: 'आगामी कार्यक्रम', icon: FiCalendar, fields: ['title', 'date', 'time', 'location', 'description'] },
  members: { label: 'सदस्य', icon: FiUsers, fields: ['name', 'position', 'bio', 'photo'] },
  achievements: { label: 'उपलब्धियाँ', icon: FiHeart, fields: ['title', 'category'] },
  gallery: { label: 'गैलरी', icon: FiImage, fields: ['title', 'image', 'caption'] },
};

const WomenCommitteeAdminPage = () => {
  const [data, setData] = useState(getDefaultData);
  const [editor, setEditor] = useState({ open: false, section: null, mode: 'create', itemId: null, draft: {} });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleOverviewChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  };

  const openEditor = (section, item = null) => {
    setEditor({
      open: true,
      section,
      mode: item ? 'edit' : 'create',
      itemId: item?.id || null,
      draft: item ? { ...item } : { ...emptyItems[section] },
    });
  };

  const closeEditor = () => {
    setEditor({ open: false, section: null, mode: 'create', itemId: null, draft: {} });
  };

  const saveItem = () => {
    const section = editor.section;
    if (!section) return;

    const draft = { ...editor.draft };
    const invalid = Object.entries(emptyItems[section]).some(([key, value]) => {
      if (typeof value === 'string' && key !== 'photo' && key !== 'image' && key !== 'caption' && key !== 'extraInfo') {
        return !draft[key]?.trim();
      }
      return false;
    });

    if (invalid) {
      toast.error('कृपया सभी आवश्यक फील्ड भरें।');
      return;
    }

    setData((prev) => {
      const list = prev[section] || [];
      const next = editor.mode === 'edit'
        ? list.map((item) => (item.id === editor.itemId ? { ...item, ...draft } : item))
        : [{ ...draft, id: createId(section) }, ...list];

      return { ...prev, [section]: next };
    });

    toast.success('सफलतापूर्वक सहेजा गया।');
    closeEditor();
  };

  const deleteItem = (section, itemId) => {
    setData((prev) => ({
      ...prev,
      [section]: (prev[section] || []).filter((item) => item.id !== itemId),
    }));
    toast.success('आइटम हटाया गया।');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Admin Panel</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">श्री आई जी महिला समिती</h1>
        </div>
        <button
          onClick={() => toast.success('सभी परिवर्तन सुरक्षित रूप से सेव हो रहे हैं।')}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5"
        >
          <FiSave className="mr-2 h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/95 p-5 shadow-xl shadow-slate-900/5 dark:bg-slate-800/80">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FiHeart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">सामान्य जानकारी</h2>
              <p className="text-sm text-slate-500">मुख्य परिचय, संदेश और टैगलाइन</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">मुख्य परिचय</span>
              <textarea
                rows={5}
                value={data.intro}
                onChange={(e) => handleOverviewChange('intro', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none ring-0 transition focus:border-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">उपशीर्षक</span>
              <input
                value={data.subtitle}
                onChange={(e) => handleOverviewChange('subtitle', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">समिति का संदेश</span>
              <textarea
                rows={4}
                value={data.message}
                onChange={(e) => handleOverviewChange('message', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/95 p-5 shadow-xl shadow-slate-900/5 dark:bg-slate-800/80">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FiMapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">संपर्क एवं जानकारी</h2>
              <p className="text-sm text-slate-500">प्रदर्शित होने वाली संपर्क जानकारी</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <input value={data.contact.address} onChange={(e) => handleContactChange('address', e.target.value)} placeholder="पता" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100" />
            <input value={data.contact.phone} onChange={(e) => handleContactChange('phone', e.target.value)} placeholder="मोबाइल नंबर" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100" />
            <input value={data.contact.email} onChange={(e) => handleContactChange('email', e.target.value)} placeholder="ईमेल" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100" />
            <input value={data.contact.whatsapp} onChange={(e) => handleContactChange('whatsapp', e.target.value)} placeholder="WhatsApp" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100" />
            <input value={data.contact.social} onChange={(e) => handleContactChange('social', e.target.value)} placeholder="Social media" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
            <input value={data.contact.timing} onChange={(e) => handleContactChange('timing', e.target.value)} placeholder="संपर्क समय" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {Object.entries(sectionMeta).map(([section, meta]) => {
          const Icon = meta.icon;
          const items = data[section] || [];

          return (
            <section key={section} className="rounded-3xl border border-white/10 bg-white/95 p-5 shadow-xl shadow-slate-900/5 dark:bg-slate-800/80">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{meta.label}</h3>
                    <p className="text-xs text-slate-500">{items.length} entries</p>
                  </div>
                </div>
                <button
                  onClick={() => openEditor(section)}
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
                >
                  <FiPlus className="h-3.5 w-3.5" /> Add
                </button>
              </div>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                    अभी कोई डेटा उपलब्ध नहीं है। नया आइटम जोड़ें।
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {item.title || item.name || item.category || item.position || item.name || 'Untitled'}
                          </p>
                          {item.description && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                          )}
                          {item.content && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.content}</p>
                          )}
                          {item.details && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.details}</p>
                          )}
                          {item.date && <p className="mt-1 text-xs text-primary">{item.date}</p>}
                          {item.location && <p className="mt-1 text-xs text-slate-500">{item.location}</p>}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditor(section, item)}
                            className="rounded-lg border border-primary/20 bg-primary/5 p-2 text-primary transition hover:bg-primary hover:text-white"
                            aria-label="Edit"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteItem(section, item.id)}
                            className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 transition hover:bg-red-500 hover:text-white"
                            aria-label="Delete"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      {editor.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editor.mode === 'edit' ? 'संपादित करें' : 'नया आइटम जोड़ें'}
              </h3>
              <button onClick={closeEditor} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {editor.section === 'objectives' && (
                <>
                  <input value={editor.draft.title || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, title: e.target.value } }))} placeholder="शीर्षक" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                  <textarea value={editor.draft.description || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, description: e.target.value } }))} rows={4} placeholder="विवरण" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                </>
              )}

              {editor.section === 'workAreas' && (
                <>
                  <input value={editor.draft.title || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, title: e.target.value } }))} placeholder="कार्य का शीर्षक" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                  <textarea value={editor.draft.content || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, content: e.target.value } }))} rows={4} placeholder="विवरण" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                </>
              )}

              {editor.section === 'records' && (
                <>
                  <input value={editor.draft.category || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, category: e.target.value } }))} placeholder="श्रेणी" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                  <textarea value={editor.draft.details || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, details: e.target.value } }))} rows={5} placeholder="विवरण" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                </>
              )}

              {editor.section === 'activities' && (
                <>
                  <input value={editor.draft.title || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, title: e.target.value } }))} placeholder="कार्यक्रम का नाम" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                  <input value={editor.draft.date || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, date: e.target.value } }))} placeholder="तारीख" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100" />
                  <input value={editor.draft.location || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, location: e.target.value } }))} placeholder="स्थान" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100" />
                  <textarea value={editor.draft.description || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, description: e.target.value } }))} rows={4} placeholder="विवरण" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                  <input value={editor.draft.photo || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, photo: e.target.value } }))} placeholder="फोटो URL" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                  <textarea value={editor.draft.extraInfo || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, extraInfo: e.target.value } }))} rows={3} placeholder="संबंधित जानकारी" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                </>
              )}

              {editor.section === 'upcomingEvents' && (
                <>
                  <input value={editor.draft.title || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, title: e.target.value } }))} placeholder="कार्यक्रम" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                  <input value={editor.draft.date || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, date: e.target.value } }))} placeholder="तारीख" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100" />
                  <input value={editor.draft.time || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, time: e.target.value } }))} placeholder="समय" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100" />
                  <input value={editor.draft.location || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, location: e.target.value } }))} placeholder="स्थान" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                  <textarea value={editor.draft.description || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, description: e.target.value } }))} rows={4} placeholder="विवरण" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                </>
              )}

              {editor.section === 'members' && (
                <>
                  <input value={editor.draft.name || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, name: e.target.value } }))} placeholder="नाम" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100" />
                  <input value={editor.draft.position || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, position: e.target.value } }))} placeholder="पद" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100" />
                  <input value={editor.draft.photo || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, photo: e.target.value } }))} placeholder="फोटो URL" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                  <textarea value={editor.draft.bio || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, bio: e.target.value } }))} rows={4} placeholder="संक्षिप्त परिचय" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                </>
              )}

              {editor.section === 'achievements' && (
                <>
                  <input value={editor.draft.title || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, title: e.target.value } }))} placeholder="उपलब्धि" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                  <input value={editor.draft.category || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, category: e.target.value } }))} placeholder="श्रेणी" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                </>
              )}

              {editor.section === 'gallery' && (
                <>
                  <input value={editor.draft.title || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, title: e.target.value } }))} placeholder="शीर्षक" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                  <input value={editor.draft.image || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, image: e.target.value } }))} placeholder="फोटो URL" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                  <input value={editor.draft.caption || ''} onChange={(e) => setEditor((prev) => ({ ...prev, draft: { ...prev.draft, caption: e.target.value } }))} placeholder="कैप्शन" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 sm:col-span-2" />
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeEditor} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700">Cancel</button>
              <button onClick={saveItem} className="rounded-xl bg-gradient-to-r from-primary to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WomenCommitteeAdminPage;
