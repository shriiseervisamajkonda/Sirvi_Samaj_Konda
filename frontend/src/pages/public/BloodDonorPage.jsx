import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDroplet, FiSearch, FiPhone, FiMapPin } from 'react-icons/fi';
import { bloodDonorAPI } from '../../services/api';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const bgColorMap = {
  'A+': 'from-red-400 to-red-600', 'A-': 'from-red-500 to-red-700',
  'B+': 'from-orange-400 to-orange-600', 'B-': 'from-orange-500 to-orange-700',
  'AB+': 'from-purple-400 to-purple-600', 'AB-': 'from-purple-500 to-purple-700',
  'O+': 'from-blue-400 to-blue-600', 'O-': 'from-blue-500 to-blue-700',
};

const BloodDonorPage = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBG, setSelectedBG] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = { limit: 50, status: 'available', search };
    if (selectedBG) params.bloodGroup = selectedBG;
    bloodDonorAPI.getAll(params)
      .then(res => setDonors(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, selectedBG]);

  return (
    <div className="bg-transparent min-h-screen">
      <div className="bg-gradient-to-br from-red-600 to-red-800 py-16 text-white relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDroplet className="w-8 h-8" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">Blood Donor Directory</h1>
            <p className="text-red-100 text-lg">Our heroes who save lives — find the right blood donor</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Urgent appeal */}
        <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4">
          <div className="text-3xl">🩸</div>
          <div>
            <p className="font-bold text-red-700 mb-1">रक्तदान जीवनदान है!</p>
            <p className="text-red-600 text-sm">आपातकालीन स्थिति में सीधे रक्तदाता से संपर्क करें या हेल्पलाइन पर कॉल करें: <strong>+91-9981644585</strong></p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CDBBA4]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or village..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E8DCC8] rounded-xl text-sm text-[#2B211B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-[#2B211B] self-center">Filter:</span>
            {bloodGroups.map(bg => (
              <button
                key={bg}
                onClick={() => setSelectedBG(bg === selectedBG ? '' : bg)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                  selectedBG === bg
                    ? `bg-gradient-to-br ${bgColorMap[bg]} border-transparent text-white shadow-md`
                    : 'bg-white border-[#E8DCC8] text-[#766A60] hover:border-red-300'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {loading ? <SkeletonCardGrid count={8} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" /> : donors.length === 0 ? (
          <EmptyState icon={FiDroplet} title="No donors found" description={selectedBG ? `No ${selectedBG} donors available` : 'No blood donors registered.'} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {donors.map((donor, i) => {
              const bg = donor.blood_group || donor.bloodGroup || 'O+';
              const phoneNum = donor.mobile_number || donor.phone;
              return (
              <motion.div
                key={donor.id || donor._id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl p-5 border border-[#E8DCC8] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bgColorMap[bg] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white text-lg font-bold shadow-lg overflow-hidden`}>
                    {donor.photo ? <img src={donor.photo} alt="Donor" className="w-full h-full object-cover" /> : bg}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2B211B] text-sm">{donor.name}</h3>
                    <Badge variant="danger" size="xs">
                      <FiDroplet className="w-3 h-3" /> {bg}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {donor.village && (
                    <div className="flex items-center gap-1.5 text-[#766A60] text-xs">
                      <FiMapPin className="w-3.5 h-3.5 text-red-400" /> {donor.village}
                    </div>
                  )}
                  {phoneNum && (
                    <a href={`tel:${phoneNum}`} className="flex items-center gap-1.5 text-red-500 text-xs hover:text-red-700 transition-colors font-medium">
                      <FiPhone className="w-3.5 h-3.5" /> {phoneNum}
                    </a>
                  )}
                  {donor.lastDonationDate && (
                    <p className="text-[#CDBBA4] text-xs">
                      Last donated: {new Date(donor.lastDonationDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </p>
                  )}
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

export default BloodDonorPage;
