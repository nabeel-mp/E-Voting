import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Sliders, 
  Save, 
  Loader2, 
  Server, 
  Globe, 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight,
  RotateCcw
} from 'lucide-react';

const Configuration = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalSettings, setOriginalSettings] = useState([]);
  const { addToast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/config');
      if (res.data.success) {
        setSettings(res.data.data);
        setOriginalSettings(JSON.parse(JSON.stringify(res.data.data)));
      }
    } catch (err) {
      console.error("Failed to load config", err);
      addToast("Failed to load system configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleChange = (key, newValue) => {
    setSettings(prev => prev.map(s => 
      s.key === key ? { ...s, value: newValue.toString() } : s
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const changes = settings.filter(s => {
        const orig = originalSettings.find(o => o.key === s.key);
        return orig && orig.value !== s.value;
      }).map(s => ({ key: s.key, value: s.value }));

      if (changes.length === 0) {
        addToast("No changes to save.", "info");
        setSaving(false);
        return;
      }

      await api.post('/api/admin/config', changes);
      addToast("Configuration updated successfully!", "success");
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
    } catch (err) {
      console.error("Save Error:", err);
      addToast("Failed to save configuration.", "error");
    } finally {
      setSaving(false);
    }
  };

  const groupedSettings = settings.reduce((acc, item) => {
    (acc[item.Category] = acc[item.Category] || []).push(item);
    return acc;
  }, {});

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'General': return <Globe size={18} />;
      case 'Security': return <ShieldAlert size={18} />;
      case 'System': return <Server size={18} />;
      default: return <Sliders size={18} />;
    }
  };

  const formatKey = (key) => {
    return key.split('_').map(w => {
        if (['otp', 'url', 'id', 'api'].includes(w.toLowerCase())) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Configuration</h1>
          <p className="text-slate-400 mt-1">Global settings and environmental variables.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={fetchSettings}
                className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="Reset Changes"
            >
                <RotateCcw size={20} />
            </button>
            <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                <span>Save Changes</span>
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {Object.entries(groupedSettings).map(([category, items]) => (
            <div key={category} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
                    <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
                        {getCategoryIcon(category)}
                    </div>
                    <h3 className="font-bold text-lg text-white">{category} Settings</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {items.map((setting) => (
                        <div key={setting.key} className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 block">
                                {formatKey(setting.key)}
                            </label>
                            
                            {setting.type === 'boolean' ? (
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => handleChange(setting.key, setting.value === 'true' ? 'false' : 'true')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                            setting.value === 'true' 
                                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                                            : 'bg-slate-800 border-slate-700 text-slate-400'
                                        }`}
                                    >
                                        {setting.value === 'true' ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                        <span className="text-sm font-bold">{setting.value === 'true' ? 'Enabled' : 'Disabled'}</span>
                                    </button>
                                    <span className="text-xs text-slate-500">{setting.description}</span>
                                </div>
                            ) : (
                                <div>
                                    <input 
                                        type={setting.type === 'number' ? 'number' : 'text'}
                                        value={setting.value} 
                                        onChange={(e) => handleChange(setting.key, e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                    <p className="text-xs text-slate-500 mt-1.5">{setting.description}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Configuration;