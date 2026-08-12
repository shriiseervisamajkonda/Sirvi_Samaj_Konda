import { useState, useEffect } from 'react';
import { FiSave, FiMapPin, FiInfo } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { villageAPI } from '../../services/api';
import toast from 'react-hot-toast';

const VillagePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [villageData, setVillageData] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    villageAPI.getAll()
      .then(res => {
        const data = res.data.data?.[0];
        setVillageData(data);
        if (data) {
          reset(data);
        }
      })
      .catch(() => toast.error('Failed to load village details'))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (villageData?._id) {
        await villageAPI.update(villageData._id, data);
      } else {
        await villageAPI.create(data);
      }
      toast.success('Village details updated successfully!');
    } catch {
      toast.error('Failed to save village details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Village Information Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Update general information about Konda Village displayed on the public page</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <FiMapPin className="w-5 h-5 text-orange-500" /> Geography & Demographics
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Village Name *</label>
              <input {...register('name', { required: true })} placeholder="Konda" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tehsil *</label>
              <input {...register('tehsil', { required: true })} placeholder="Kukshi" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District *</label>
              <input {...register('district', { required: true })} placeholder="Dhar" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
              <input {...register('state', { required: true })} placeholder="Madhya Pradesh" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIN Code *</label>
              <input {...register('pinCode', { required: true })} placeholder="454335" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Community Center (Dharmshala)</label>
              <input {...register('communityCenter')} placeholder="Sirvi Samaj Dharmshala, Konda" className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Konda Village</label>
            <textarea {...register('description')} rows={4} placeholder="Brief summary of geography, community history..." className="input-field resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dharmshala Purpose / Facilities</label>
            <textarea {...register('purpose')} rows={2} placeholder="Used for weddings, public gatherings, religious events..." className="input-field resize-none" />
          </div>

          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default VillagePage;
