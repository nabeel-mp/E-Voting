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
  RotateCcw,
  Settings,
  Database
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
        // Filter out 'max_session_duration' so it doesn't appear in the list
        const visibleSettings = (res.data.data || []).filter(
          s => s.key !== 'max_session_duration'
        );
        
        setSettings(visibleSettings);
        setOriginalSettings(JSON.parse(JSON.stringify(visibleSettings)));
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
      case 'General': return <Globe size={20} />;
      case 'Security': return <ShieldAlert size={20} />;
      case 'System': return <Server size={20} />;
      case 'Database': return <Database size={20} />;
      default: return <Sliders size={20} />;
    }
  };

  const formatKey = (key) => {
    return key.split('_').map(w => {
        if (['otp', 'url', 'id', 'api', 'jwt', 'db'].includes(w.toLowerCase())) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  };

  // Calculate changes to enable/disable buttons
  const hasChanges = settings.some(s => {
      const orig = originalSettings.find(o => o.key === s.key);
      return orig && orig.value !== s.value;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col p-6 md:p-10 bg-[#f8fafc]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 border-b border-slate-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full mb-4">
              <Settings size={14} className="text-indigo-700" />
              <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Environment Variables</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            System <span className="italic text-slate-400 font-light">Configuration</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-light">
            Manage global settings and environmental parameters.
          </p>
        </div>
        
        <div className="flex gap-4">
            <button 
                onClick={fetchSettings}
                disabled={!hasChanges && !loading}
                className={`p-3 rounded-xl border transition-all ${
                    hasChanges 
                    ? 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 shadow-sm' 
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
                title="Reset Changes"
            >
                <RotateCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            
            <button 
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 transform hover:-translate-y-0.5 ${
                    hasChanges
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
            >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-indigo-500">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="text-slate-400 text-lg animate-pulse font-medium">Loading system configuration...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pb-10 pr-2">
            {Object.entries(groupedSettings).map(([category, items]) => (
                <div key={category} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
                    
                    {/* Category Header */}
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                        <div className="p-2.5 bg-white rounded-xl text-indigo-600 border border-slate-200 shadow-sm">
                            {getCategoryIcon(category)}
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900 font-serif">{category}</h3>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Configuration Group</p>
                        </div>
                    </div>

                    {/* Settings Grid */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {items.map((setting) => (
                            <div key={setting.key} className="group">
                                <div className="flex justify-between items-start mb-2">
                                    <label className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                                        {formatKey(setting.key)}
                                    </label>
                                    {setting.type === 'boolean' && (
                                        <button 
                                            onClick={() => handleChange(setting.key, setting.value === 'true' ? 'false' : 'true')}
                                            className={`transition-colors duration-300 ${setting.value === 'true' ? 'text-emerald-500' : 'text-slate-300'}`}
                                        >
                                            {setting.value === 'true' ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                                        </button>
                                    )}
                                </div>

                                {setting.type === 'boolean' ? (
                                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 px-4">
                                        <span className="text-xs text-slate-500 font-medium">{setting.description}</span>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase border ${
                                            setting.value === 'true' 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            {setting.value === 'true' ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input 
                                            type={setting.type === 'number' ? 'number' : 'text'}
                                            value={setting.value} 
                                            onChange={(e) => handleChange(setting.key, e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-mono text-sm shadow-inner"
                                        />
                                        <p className="text-xs text-slate-400 mt-2 ml-1 font-medium">{setting.description}</p>
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