import { useState, useEffect, useMemo } from 'react';
import { FiX, FiUsers, FiPhone, FiSearch, FiBriefcase, FiBookOpen } from 'react-icons/fi';
import { familyAPI, memberAPI } from '../../services/api';
import Badge from './Badge';

const relationHindiMap = {
  self: 'स्वयं (मुखिया)',
  head: 'स्वयं (मुखिया)',
  spouse: 'पत्नी / पति',
  wife: 'पत्नी',
  husband: 'पति',
  son: 'पुत्र',
  daughter: 'पुत्री',
  daughter_in_law: 'पुत्रवधू',
  father: 'पिता',
  mother: 'माता',
  grandson: 'पोता',
  granddaughter: 'पोती',
  brother: 'भाई',
  sister: 'बहन',
  other: 'सदस्य',
};

const maritalStatusMap = {
  married: 'विवाहित',
  single: 'अविवाहित',
  divorced: 'तलाकशुदा',
  widowed: 'विधवा / विधुर',
};

const FamilyMembersModal = ({ isOpen, onClose, family, familyId }) => {
  const [loading, setLoading] = useState(false);
  const [fetchedFamily, setFetchedFamily] = useState(null);
  const [fetchedMembers, setFetchedMembers] = useState([]);
  const [search, setSearch] = useState('');

  const familyData = fetchedFamily || family;
  const members = useMemo(() => {
    if (fetchedMembers.length > 0) return fetchedMembers;
    if (Array.isArray(family?.family_members) && family.family_members.length > 0) {
      return [...family.family_members].sort((a, b) => {
        if (a.is_head || a.relation_to_head === 'self' || a.relation_to_head === 'head') return -1;
        if (b.is_head || b.relation_to_head === 'self' || b.relation_to_head === 'head') return 1;
        const numA = Number(a.member_number || 999);
        const numB = Number(b.member_number || 999);
        return numA - numB;
      });
    }
    return [];
  }, [fetchedMembers, family]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const targetUuid = family?.id || family?._id || (typeof familyId === 'string' && familyId.includes('-') ? familyId : null);
        const targetPanchayatId = family?.panchayat_family_id || family?.familyId || (!targetUuid ? familyId : null);

        let resolvedFamily = null;
        let resolvedMembers = [];

        // Try getting full family by UUID
        if (targetUuid) {
          try {
            const res = await familyAPI.getOne(targetUuid);
            if (res.data?.data) {
              resolvedFamily = res.data.data;
              resolvedMembers = res.data.data.family_members || [];
            }
          } catch {
            // fallback if error
          }
        }

        // Try getting by panchayat family ID
        if ((!resolvedMembers || resolvedMembers.length === 0) && targetPanchayatId) {
          try {
            const res = await familyAPI.getByFamilyId(targetPanchayatId);
            if (res.data?.data) {
              resolvedFamily = res.data.data;
              resolvedMembers = res.data.data.family_members || [];
            }
          } catch {
            // fallback
          }
        }

        // Fallback: query memberAPI directly by family_id
        if ((!resolvedMembers || resolvedMembers.length === 0) && (targetUuid || resolvedFamily?.id)) {
          try {
            const fId = targetUuid || resolvedFamily?.id;
            const res = await memberAPI.getAll({ family_id: fId, limit: 100 });
            if (res.data?.data && res.data.data.length > 0) {
              resolvedMembers = res.data.data;
            }
          } catch {
            // fallback
          }
        }

        if (isMounted) {
          if (resolvedFamily) {
            setFetchedFamily(resolvedFamily);
          }
          if (resolvedMembers && resolvedMembers.length > 0) {
            const sorted = [...resolvedMembers].sort((a, b) => {
              if (a.is_head || a.relation_to_head === 'self' || a.relation_to_head === 'head') return -1;
              if (b.is_head || b.relation_to_head === 'self' || b.relation_to_head === 'head') return 1;
              const numA = Number(a.member_number || 999);
              const numB = Number(b.member_number || 999);
              return numA - numB;
            });
            setFetchedMembers(sorted);
          }
        }
      } catch (err) {
        console.error('Error fetching family members:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, family, familyId]);

  const filteredMembers = useMemo(() => {
    if (!search) return members;
    const q = search.toLowerCase().trim();
    return members.filter((m) => {
      const name = (m.full_name || `${m.first_name || ''} ${m.last_name || ''}`).toLowerCase();
      const relative = (m.relative_name || m.guardianName || '').toLowerCase();
      const occ = (m.occupation || '').toLowerCase();
      const edu = (m.education || '').toLowerCase();
      const phone = (m.mobile_number || m.phone || '').replace(/\D/g, '');
      const rel = (relationHindiMap[m.relation_to_head] || m.relation_to_head || '').toLowerCase();
      return name.includes(q) || relative.includes(q) || occ.includes(q) || edu.includes(q) || phone.includes(q) || rel.includes(q);
    });
  }, [members, search]);

  if (!isOpen) return null;

  const headName = familyData?.head_name || familyData?.headOfFamily || family?.head_name || family?.headOfFamily || '—';
  const panchayatId = familyData?.panchayat_family_id || familyData?.familyId || family?.panchayat_family_id || family?.familyId || '—';
  const gotra = familyData?.gotra || familyData?.surname || family?.gotra || family?.surname || '—';
  const mobile = familyData?.head_mobile || familyData?.mobileNumber || family?.head_mobile || family?.mobileNumber || '';
  const village = familyData?.village || family?.village || 'कोणदा';
  const land = familyData?.land_area_acres ? `${familyData.land_area_acres} एकड़` : (familyData?.land_details_text || family?.land_details_text || null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#E8DCC8] overflow-hidden my-4 sm:my-8 animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Top Action Bar */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#FFF8EC] to-white border-b border-[#E8DCC8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#7A2525] text-white flex items-center justify-center shadow-xs">
              <FiUsers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[#7A2525] text-base sm:text-lg">
                  परिवार सदस्य विवरण (Family Members)
                </h3>
                <span className="font-mono font-black text-xs bg-[#7A2525] text-white px-2.5 py-0.5 rounded-lg">
                  परिवार #{panchayatId}
                </span>
              </div>
              <p className="text-[11px] text-[#766A60] font-medium hidden sm:block">
                ग्राम कोणदा • श्री सिर्वी समाज परिवार निर्देशिका
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-[#766A60] hover:text-[#2B211B] hover:bg-[#FAF1E0] rounded-xl transition-all cursor-pointer"
              title="बंद करें"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div id="printable-family-card" className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Family Header Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FFF8EC] via-[#FFFDF8] to-white border border-[#E8DCC8] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-[#C85A17] uppercase tracking-wider">
                    परिवार मुखिया (Head of Family)
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded">
                    सत्यापित परिवार
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#2B211B] flex items-center gap-2">
                  {headName}
                  {gotra && (
                    <span className="text-sm font-bold text-[#7A2525] bg-[#FFF8EC] border border-[#E8DCC8] px-2.5 py-0.5 rounded-lg">
                      गोत्र: {gotra}
                    </span>
                  )}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#766A60] mt-1 font-medium">
                  <span>गाँव: <strong className="text-[#2B211B]">{village}</strong></span>
                  {land && <span>कृषि भूमि: <strong className="text-emerald-800">{land}</strong></span>}
                  {familyData?.faliya_or_ward && <span>फलिया/वार्ड: <strong className="text-[#2B211B]">{familyData.faliya_or_ward}</strong></span>}
                </div>
              </div>

              {/* Quick Contacts & Counts */}
              <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8DCC8] rounded-xl shadow-2xs text-xs font-bold text-[#7A2525]">
                  <FiUsers className="w-4 h-4 text-[#C85A17]" />
                  <span>कुल सदस्य: {members.length || familyData?.total_members || 0}</span>
                </div>
                {mobile && (
                  <a
                    href={`tel:${mobile}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-mono font-bold text-emerald-800 transition"
                  >
                    <FiPhone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+91 {mobile}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Search bar inside modal */}
          {members.length > 2 && (
            <div className="no-print flex items-center gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#766A60]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="परिवार में सदस्य खोजें (नाम, संबंध, शिक्षा, व्यवसाय)..."
                  className="w-full pl-10 pr-4 py-2 bg-[#FFF8EC] border border-[#E8DCC8] rounded-xl text-xs sm:text-sm text-[#2B211B] placeholder-[#766A60]/70 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/30 font-medium"
                />
              </div>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="px-3 py-2 text-xs font-bold text-[#766A60] hover:text-[#2B211B] bg-white border border-[#E8DCC8] rounded-xl cursor-pointer"
                >
                  रीसेट
                </button>
              )}
            </div>
          )}

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-[#E8DCC8] overflow-hidden shadow-2xs">
            {loading && members.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-3 border-[#7A2525] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-bold text-[#766A60]">परिवार के सदस्य लोड हो रहे हैं...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-[#766A60]">
                <FiUsers className="w-8 h-8 mx-auto text-[#C85A17] mb-2 opacity-50" />
                <p className="text-sm font-bold text-[#2B211B]">
                  {search ? 'खोज के अनुसार कोई सदस्य नहीं मिला' : 'इस परिवार में कोई सदस्य पंजीकृत नहीं है'}
                </p>
                <p className="text-xs text-[#766A60] mt-0.5">
                  एडमिन सदस्य पेज से नया सदस्य इस परिवार में जोड़ा जा सकता है।
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#FFF8EC] border-b border-[#E8DCC8] text-[11px] sm:text-xs font-black text-[#7A2525] uppercase tracking-wider whitespace-nowrap">
                      <th className="px-4 py-3 text-center w-12">क्र.</th>
                      <th className="px-4 py-3">सदस्य का नाम (Full Name)</th>
                      <th className="px-4 py-3">मुखिया से संबंध (Relation)</th>
                      <th className="px-4 py-3">लिंग (Gender)</th>
                      <th className="px-4 py-3">रक्त समूह (Blood)</th>
                      <th className="px-4 py-3">शैक्षणिक योग्यता (Education)</th>
                      <th className="px-4 py-3">व्यवसाय (Occupation)</th>
                      <th className="px-4 py-3">मोबाइल नंबर (Mobile)</th>
                      <th className="px-4 py-3">वैवाहिक स्थिति</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DCC8]/60">
                    {filteredMembers.map((m, idx) => {
                      const isHead = m.is_head || m.relation_to_head === 'self' || m.relation_to_head === 'head';
                      const memName = m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || '—';
                      const guardian = m.relative_name || m.guardianName;
                      const relLabel = relationHindiMap[m.relation_to_head] || m.relation_to_head || (isHead ? 'स्वयं (मुखिया)' : 'सदस्य');
                      const edu = m.education || m.qualification;
                      const occ = m.occupation;
                      const phone = m.mobile_number || m.phone;
                      const bg = m.blood_group || m.bloodGroup;
                      const marital = maritalStatusMap[m.marital_status] || m.marital_status;

                      return (
                        <tr
                          key={m.id || m._id || idx}
                          className={`hover:bg-[#FFFDF8] transition-colors ${
                            isHead ? 'bg-[#FFF8EC]/40 font-semibold' : ''
                          }`}
                        >
                          {/* S.No. / Member No */}
                          <td className="px-4 py-3.5 text-center font-mono font-bold text-xs text-[#7A2525]">
                            {m.member_number || idx + 1}
                          </td>

                          {/* Name & Father/Husband */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                {m.photo ? (
                                  <img src={m.photo} alt={memName} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                  memName.charAt(0) || 'M'
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-[#2B211B] flex items-center gap-1.5">
                                  <span>{memName}</span>
                                  {isHead && (
                                    <span className="text-[10px] font-black bg-[#7A2525] text-white px-1.5 py-0.2 rounded">
                                      मुखिया
                                    </span>
                                  )}
                                </div>
                                {guardian && (
                                  <div className="text-[11px] text-[#766A60]">
                                    {m.gender === 'female' && m.marital_status === 'married' ? 'W/O' : 'S/O, D/O'}: {guardian}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Relation */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                              isHead
                                ? 'bg-[#7A2525] text-white'
                                : 'bg-[#FFF8EC] text-[#7A2525] border border-[#E8DCC8]'
                            }`}>
                              {relLabel}
                            </span>
                          </td>

                          {/* Gender */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <Badge variant={m.gender === 'female' ? 'warning' : 'info'}>
                              {m.gender === 'female' ? 'महिला' : m.gender === 'male' ? 'पुरुष' : m.gender || '—'}
                            </Badge>
                          </td>

                          {/* Blood Group */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {bg && bg !== 'unknown' && bg !== 'Unknown' ? (
                              <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-md font-mono text-xs font-bold">
                                {bg}
                              </span>
                            ) : (
                              <span className="text-[#766A60]">—</span>
                            )}
                          </td>

                          {/* Education */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {edu ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-[#FFF8EC] text-[#7A2525] border border-[#E8DCC8]">
                                <FiBookOpen className="w-3 h-3 text-[#C85A17]" />
                                {edu}
                              </span>
                            ) : (
                              <span className="text-[#766A60]">—</span>
                            )}
                          </td>

                          {/* Occupation */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {occ ? (
                              <span className="inline-flex items-center gap-1 text-xs text-[#2B211B] font-medium">
                                <FiBriefcase className="w-3 h-3 text-[#766A60]" />
                                {occ}
                              </span>
                            ) : (
                              <span className="text-[#766A60]">—</span>
                            )}
                          </td>

                          {/* Mobile */}
                          <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                            {phone ? (
                              <a
                                href={`tel:${phone}`}
                                className="text-[#7A2525] hover:underline font-bold"
                              >
                                {phone}
                              </a>
                            ) : (
                              <span className="text-[#766A60]">—</span>
                            )}
                          </td>

                          {/* Marital Status */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[#2B211B]">
                            {marital || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="no-print px-6 py-4 bg-[#FFF8EC] border-t border-[#E8DCC8] flex items-center justify-between">
          <div className="text-xs font-semibold text-[#766A60]">
            कुल सदस्य संख्या: <strong className="text-[#7A2525]">{members.length}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-[#E8DCC8] hover:bg-[#FAF1E0] text-[#2B211B] font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyMembersModal;
