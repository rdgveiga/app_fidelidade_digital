import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, ChevronDown, Coffee, Gift, Star, ArrowLeft, MoreHorizontal, ChevronRight, Home, Settings, Upload, Image, X, Calendar, Clock, AlertCircle } from 'lucide-react';

export const Campaign = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    stamps_required: 8,
    reward_description: '',
    active: true,
    reward_image_url: '',
    expires_at: '',
    rules_config: {
      cooldown_hours: 0,
      custom_rules_text: ''
    }
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showStampOptions, setShowStampOptions] = useState(false);

  useEffect(() => {
    fetch('/api/shop/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.campaign) {
          setFormData({
            stamps_required: data.campaign.stamps_required,
            reward_description: data.campaign.reward_description || '',
            active: !!data.campaign.active,
            reward_image_url: data.campaign.reward_image_url || '',
            expires_at: data.campaign.expires_at ? new Date(data.campaign.expires_at).toISOString().slice(0, 16) : '',
            rules_config: data.campaign.rules_config || { cooldown_hours: 0, custom_rules_text: '' }
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/shop/campaign', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage('Campanha atualizada com sucesso!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await fetch('/api/shop/upload-reward-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload
      });

      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, reward_image_url: data.url }));
        setMessage('Imagem da premiação atualizada!');
        setTimeout(() => setMessage(''), 4000);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro ao enviar imagem: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const stampOptions = [3, 4, 5, 6, 7, 8, 9, 10, 12, 15];
  const filledStamps = 3;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Home size={14} />
        <span>Início</span>
        <ChevronRight size={14} />
        <Settings size={14} />
        <span>Configurações</span>
        <ChevronRight size={14} />
        <span className="font-bold text-gray-900">Campanha</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-3">Configuração da Campanha</h1>
            <p className="text-[#6b7280] font-medium text-lg leading-relaxed">
              Configure as regras do seu programa de fidelidade e recompensas para seus clientes.
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-8 p-5 bg-green-50 text-green-700 rounded-2xl font-bold border border-green-200 flex items-center gap-3 animate-in fade-in duration-300">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <Star size={16} className="text-green-600" />
              </div>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-3xl premium-shadow border border-gray-100 p-8 lg:p-10 space-y-10">
              {/* Stamps Required */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-1">
                  Quantidade de carimbos necessária
                </label>
                <p className="text-sm text-gray-500 font-medium mb-5">
                  Quantas compras são necessárias para desbloquear a recompensa?
                </p>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowStampOptions(!showStampOptions)}
                    className="w-full flex items-center justify-between h-16 px-6 bg-[#f9fafb] border-2 border-gray-100 rounded-2xl text-left font-bold text-gray-900 text-lg hover:border-gray-200 transition-all focus:border-blue-200 focus:bg-white outline-none"
                  >
                    <span>{formData.stamps_required} Carimbos</span>
                    <ChevronDown size={20} className={`text-gray-400 transition-transform ${showStampOptions ? 'rotate-180' : ''}`} />
                  </button>

                  {showStampOptions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {stampOptions.map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, stamps_required: num });
                            setShowStampOptions(false);
                          }}
                          className={`w-full text-left px-6 py-4 font-bold text-base transition-colors ${formData.stamps_required === num
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {num} Carimbos
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reward Description */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-1">
                  Descrição da recompensa
                </label>
                <p className="text-sm text-gray-500 font-medium mb-5">
                  Isso é o que os clientes veem quando completam o cartão.
                </p>
                <div className="relative">
                  <textarea
                    required
                    maxLength={100}
                    className="w-full p-6 bg-[#f9fafb] border-2 border-gray-100 rounded-2xl focus:border-blue-200 focus:bg-white outline-none min-h-[120px] font-medium text-gray-900 text-base resize-none transition-all placeholder:text-gray-400"
                    placeholder="Ex: Um café especial grátis de qualquer tamanho"
                    value={formData.reward_description}
                    onChange={e => setFormData({ ...formData, reward_description: e.target.value })}
                  />
                  <span className="absolute bottom-4 right-5 text-xs font-bold text-gray-400">
                    {formData.reward_description.length}/100
                  </span>
                </div>
              </div>

              {/* Reward Image */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-1">
                  Foto da recompensa
                </label>
                <p className="text-sm text-gray-500 font-medium mb-5">
                  Uma imagem atraente ajuda a motivar seus clientes.
                </p>

                {formData.reward_image_url ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-gray-100 group">
                    <img
                      src={formData.reward_image_url}
                      alt="Premiação"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, reward_image_url: '' }))}
                        className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                        title="Remover imagem"
                      >
                        <X size={20} />
                      </button>
                      <label className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors shadow-lg cursor-pointer">
                        <Upload size={20} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="text-sm font-bold text-gray-500">Enviando...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-8 text-center">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-1">
                          <Image size={28} />
                        </div>
                        <div>
                          <p className="text-gray-900 font-bold">Clique para subir uma foto</p>
                          <p className="text-sm text-gray-500 font-medium">PNG, JPG ou WEBP (Max. 5MB)</p>
                        </div>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                )}
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-1">
                  Data de término da campanha
                </label>
                <p className="text-sm text-gray-500 font-medium mb-5">
                  Após esta data, os clientes não poderão mais coletar carimbos nesta campanha.
                </p>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar size={20} />
                  </div>
                  <input
                    type="datetime-local"
                    className="w-full h-16 pl-14 pr-6 bg-[#f9fafb] border-2 border-gray-100 rounded-2xl focus:border-blue-200 focus:bg-white outline-none font-bold text-gray-900 text-lg transition-all"
                    value={formData.expires_at}
                    onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
              </div>

              {/* Rules Config (Cooldown) */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-1">
                  Regras de segurança
                </label>
                <p className="text-sm text-gray-500 font-medium mb-5">
                  Evite carimbos duplicados acidentais definindo um tempo mínimo entre carimbos.
                </p>

                <div className="bg-[#f9fafb] border-2 border-gray-100 rounded-2xl p-6 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <Clock size={16} /> Intervalo entre carimbos
                      </span>
                      <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full">
                        {formData.rules_config.cooldown_hours} {formData.rules_config.cooldown_hours === 1 ? 'hora' : 'horas'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="48"
                      step="1"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      value={formData.rules_config.cooldown_hours}
                      onChange={e => setFormData({
                        ...formData,
                        rules_config: { ...formData.rules_config, cooldown_hours: parseInt(e.target.value) }
                      })}
                    />
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">
                      <span>Sem limite</span>
                      <span>12h</span>
                      <span>24h</span>
                      <span>48h</span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                    <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 font-medium leading-relaxed">
                      <strong>Aviso Suave:</strong> Se o cliente tentar carimbar antes do tempo, você verá um aviso, mas poderá autorizar manualmente se desejar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Campaign Status Toggle */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-1">
                  Status da campanha
                </label>
                <p className="text-sm text-gray-500 font-medium mb-5">
                  Pausar para ocultar esta campanha dos clientes.
                </p>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${!formData.active ? 'text-gray-900' : 'text-gray-400'}`}>Pausada</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={`relative w-14 h-8 rounded-full transition-colors ${formData.active ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${formData.active ? 'translate-x-7' : 'translate-x-1'
                      }`}></div>
                  </button>
                  <span className={`text-sm font-bold ${formData.active ? 'text-gray-900' : 'text-gray-400'}`}>Ativa</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-8 h-16 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-bold text-lg rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Save size={22} />
              Salvar Alterações
            </button>
          </form>
        </div>

        {/* Right Column: Card Preview */}
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
              <Coffee size={12} className="text-blue-600" />
            </div>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Prévia do Cartão</span>
          </div>

          {/* Phone Mockup */}
          <div className="mx-auto w-[300px]">
            <div className="bg-[#1a1f2e] rounded-[40px] p-3 shadow-2xl">
              <div className="bg-[#f0f2f5] rounded-[32px] overflow-hidden">
                {/* Phone Status Bar */}
                <div className="bg-white px-6 pt-3 pb-1 flex items-center justify-between text-[10px] font-bold text-gray-900">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-2.5 border border-gray-900 rounded-sm relative">
                      <div className="absolute inset-0.5 bg-gray-900 rounded-[1px]"></div>
                    </div>
                  </div>
                </div>

                {/* App Header */}
                <div className="bg-white px-5 py-3 flex items-center justify-between">
                  <ArrowLeft size={18} className="text-gray-600" />
                  <span className="font-bold text-gray-900 text-sm">Minha Carteira</span>
                  <MoreHorizontal size={18} className="text-gray-600" />
                </div>

                {/* Store Info */}
                <div className="bg-white px-5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Coffee size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Bean & Leaf</h4>
                      <p className="text-[10px] text-gray-500">Torrefação de Café • São Paulo, SP</p>
                    </div>
                  </div>
                </div>

                {/* Loyalty Card Preview */}
                <div className="px-4 pb-4">
                  <div className="bg-[#1e3a5f] rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute right-3 top-3 text-[10px] text-white/60 font-bold">#{Math.floor(Math.random() * 9000 + 1000)}</div>
                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider mb-1">Cartão Fidelidade</p>
                    <h3 className="text-white font-extrabold text-lg mb-3">
                      {formData.reward_description || 'Café Grátis'}
                    </h3>

                    {/* Reward Image Preview in Card */}
                    {formData.reward_image_url && (
                      <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 border border-white/10">
                        <img src={formData.reward_image_url} alt="Prêmio" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Expiration Badge in Preview */}
                    {formData.expires_at && (
                      <div className="flex items-center gap-1.5 mb-4 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 w-fit">
                        <Clock size={12} className="text-[#60a5fa]" />
                        <span className="text-[10px] font-bold text-white/90">
                          Expira em {new Date(formData.expires_at).toLocaleDateString('pt-BR')} às {new Date(formData.expires_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {/* Stamps Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {Array.from({ length: formData.stamps_required }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`aspect-square rounded-full flex items-center justify-center text-xs font-bold ${idx < filledStamps
                            ? 'bg-[#3b82f6] text-white'
                            : idx === formData.stamps_required - 1
                              ? 'bg-white/20 border border-white/30'
                              : 'bg-white/10 border border-white/20 text-white/40'
                            }`}
                        >
                          {idx < filledStamps ? (
                            <Coffee size={14} />
                          ) : idx === formData.stamps_required - 1 ? (
                            <Gift size={14} className="text-white/70" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-white/60 font-medium">
                        Colete {formData.stamps_required} selos para desbloquear sua recompensa.
                      </p>
                      <span className="text-sm font-extrabold text-[#60a5fa]">
                        {filledStamps}/{formData.stamps_required}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reward Info */}
                <div className="px-4 pb-6">
                  <div className="bg-white rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                      <Star size={16} className="text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 text-xs">Recompensa Atual</h5>
                      <p className="text-[10px] text-gray-500 leading-relaxed">
                        {formData.reward_description || 'Configure sua recompensa ao lado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
