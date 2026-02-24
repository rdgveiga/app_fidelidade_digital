import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Gift,
  XCircle,
  Clock,
  Stamp,
  Award,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ActivityItem {
  id: string;
  type: 'STAMP' | 'REDEEM';
  created_at: string;
  customer_id: string;
  customer_name: string;
}

export const Counter = () => {
  const { token } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' | 'WARNING'>('IDLE');
  const [pendingConfirmation, setPendingConfirmation] = useState<{ code: string; message: string } | null>(null);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherStatus, setVoucherStatus] = useState<'IDLE' | 'LOADING'>('IDLE');
  const voucherInputRef = useRef<HTMLInputElement>(null);

  // Recent activity
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  // ── Helpers ────────────────────────────────────────────────────
  const prependActivity = (item: ActivityItem) => {
    setActivity(prev => [item, ...prev].slice(0, 10));
  };

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/shop/recent-activity?limit=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setActivity(data.activity || []);
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  // ── Counter ────────────────────────────────────────────────────
  const handleNumberClick = (num: string) => {
    setCode(prev => prev.length < 6 ? prev + num : prev);
  };

  const handleDelete = () => setCode(prev => prev.slice(0, -1));
  const handleClear = () => setCode('');

  const handleSubmit = useCallback(async (isForced = false) => {
    const codeToValidate = isForced ? pendingConfirmation?.code : code;
    if (!codeToValidate || codeToValidate.length !== 6 || (status === 'LOADING' && !isForced)) return;

    setStatus('LOADING');
    setPendingConfirmation(null);

    try {
      const res = await fetch('/api/shop/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: codeToValidate, force: isForced })
      });

      const data = await res.json();

      if (data.warning === 'DOUBLE_STAMP_DETECTION') {
        setStatus('WARNING');
        setPendingConfirmation({ code: codeToValidate, message: data.message });
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Erro ao validar código');

      setStatus('SUCCESS');
      toast.success(data.message);
      if (data.newStamps) toast.success(`Novo saldo: ${data.newStamps} selos`);
      setCode('');

      // Add to live feed
      if (data.customer?.id) {
        prependActivity({
          id: Date.now().toString(),
          type: 'STAMP',
          created_at: new Date().toISOString(),
          customer_id: data.customer.id,
          customer_name: data.customer.name,
        });
      }

      setTimeout(() => setStatus('IDLE'), 4000);
    } catch (err: any) {
      setStatus('ERROR');
      toast.error(err.message);
      setTimeout(() => setStatus('IDLE'), 3000);
    }
  }, [code, status, token, pendingConfirmation]);

  // ── Keyboard ──────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement === voucherInputRef.current) return;
      if (e.key >= '0' && e.key <= '9') { e.preventDefault(); handleNumberClick(e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); handleDelete(); }
      else if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
      else if (e.key === 'Escape') { e.preventDefault(); handleClear(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSubmit]);

  // ── Voucher ───────────────────────────────────────────────────
  const handleVoucherSubmit = async () => {
    const trimmed = voucherCode.trim();
    if (!trimmed || voucherStatus === 'LOADING') return;
    setVoucherStatus('LOADING');

    try {
      const res = await fetch('/api/shop/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: trimmed })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código de resgate inválido');

      toast.success(data.message || 'Recompensa resgatada com sucesso!');
      setVoucherCode('');

      // Add to live feed
      if (data.customer?.id) {
        prependActivity({
          id: Date.now().toString(),
          type: 'REDEEM',
          created_at: new Date().toISOString(),
          customer_id: data.customer.id,
          customer_name: data.customer.name,
        });
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setVoucherStatus('IDLE');
    }
  };

  // ── Helpers ───────────────────────────────────────────────────
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="grid lg:grid-cols-12 gap-8 items-start">

        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">Balcão de Atendimento</h1>
            <p className="text-[#6b7280] font-medium text-lg">Digite o código de 6 dígitos do cliente</p>
          </div>

          {/* Counter Card */}
          <div className="bg-white rounded-3xl premium-shadow border border-gray-100 p-10 flex flex-col items-center">
            <div className="flex gap-3 mb-12">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className={`w-16 h-24 rounded-2xl border-2 flex items-center justify-center text-4xl font-bold transition-all ${code[idx]
                    ? 'border-blue-500 bg-white text-gray-900 shadow-lg shadow-blue-50'
                    : 'border-gray-50 bg-[#f9fafb] text-transparent'
                    }`}
                >
                  {code[idx] || '•'}
                </div>
              ))}
            </div>

            {/* Confirmation Warning Modal/Overlay */}
            {status === 'WARNING' && pendingConfirmation && (
              <div className="mb-8 p-6 bg-orange-50 border-2 border-orange-100 rounded-3xl animate-in zoom-in duration-300 w-full max-w-md">
                <div className="flex items-center gap-3 mb-4 text-orange-600">
                  <AlertTriangle size={24} className="animate-bounce" />
                  <h3 className="font-black text-lg">Aviso de Duplicidade</h3>
                </div>
                <p className="text-sm text-orange-700 font-bold leading-tight mb-6">
                  {pendingConfirmation.message}
                  <br />
                  <span className="font-medium text-orange-600/70">Confirmar este carimbo adicional agora?</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSubmit(true)}
                    className="flex-1 h-12 bg-orange-600 text-white font-black text-sm rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95"
                  >
                    SIM, CONFIRMAR
                  </button>
                  <button
                    onClick={() => {
                      setStatus('IDLE');
                      setPendingConfirmation(null);
                      setCode('');
                    }}
                    className="flex-1 h-12 bg-white text-gray-500 font-bold text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => handleSubmit(false)}
              disabled={code.length !== 6 || status === 'LOADING' || status === 'WARNING'}
              className={`w-full max-w-md h-16 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-xl transition-all shadow-lg active:scale-95 ${code.length === 6 && status !== 'LOADING' && status !== 'WARNING'
                ? 'bg-[#3b82f6] hover:bg-blue-600 shadow-blue-200'
                : 'bg-gray-300 cursor-not-allowed shadow-none'
                }`}
            >
              {status === 'LOADING' ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  <span>CONFIRMAR CARIMBO (+1)</span>
                </>
              )}
            </button>

            <div className="mt-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#f0fdf4] text-[#16a34a] rounded-full text-sm font-bold border border-[#dcfce7]">
                <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
                <span>Sistema Pronto • Use o teclado para digitar</span>
              </div>
            </div>
          </div>

          {/* Validar Resgate */}
          <div className="bg-white rounded-3xl premium-shadow border border-gray-100 p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                <Gift size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">Validar Resgate</h3>
                <p className="text-sm text-gray-500 font-medium">Insira o código do voucher para resgatar recompensas.</p>
                <div className="mt-6 flex gap-3">
                  <input
                    ref={voucherInputRef}
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVoucherSubmit()}
                    placeholder="CÓD. RESGATE"
                    maxLength={6}
                    className="flex-1 h-14 px-6 bg-[#f9fafb] border-2 border-transparent focus:border-blue-100 rounded-2xl font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400"
                  />
                  <button
                    onClick={handleVoucherSubmit}
                    disabled={!voucherCode.trim() || voucherStatus === 'LOADING'}
                    className={`h-14 px-8 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 ${voucherCode.trim() && voucherStatus !== 'LOADING'
                      ? 'bg-[#4b5563] hover:bg-[#374151]'
                      : 'bg-gray-300 cursor-not-allowed'
                      }`}
                  >
                    {voucherStatus === 'LOADING' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    ) : (
                      'Validar Recompensa'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Keypad */}
          <div className="bg-white rounded-3xl premium-shadow border border-gray-100 p-8">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num.toString())}
                  className="h-20 bg-[#f3f4f6] hover:bg-gray-200 text-3xl font-bold text-gray-700 rounded-2xl transition-all active:scale-90"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-20 bg-[#fef2f2] hover:bg-[#fee2e2] text-red-600 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-90"
              >
                <XCircle size={20} />
                <span className="text-[10px] font-black uppercase">Limpar</span>
              </button>
              <button
                onClick={() => handleNumberClick('0')}
                className="h-20 bg-[#f3f4f6] hover:bg-gray-200 text-3xl font-bold text-gray-700 rounded-2xl transition-all active:scale-90"
              >
                0
              </button>
              <button
                onClick={handleSubmit}
                disabled={code.length !== 6}
                className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1 text-white transition-all active:scale-90 ${code.length === 6 ? 'bg-[#3b82f6] hover:bg-blue-600 shadow-lg shadow-blue-100' : 'bg-gray-300 cursor-not-allowed'
                  }`}
              >
                <CheckCircle2 size={24} />
                <span className="text-[10px] font-black uppercase">Confirmar</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl premium-shadow border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wider">Atividade Recente</h3>
              <button
                onClick={() => navigate(`/shop/${slug}/customers`)}
                className="text-blue-600 text-xs font-bold hover:underline"
              >
                Ver Tudo
              </button>
            </div>

            <div className="space-y-2">
              {activity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Clock size={36} className="mb-3 opacity-10" />
                  <p className="text-sm font-bold opacity-40">Nenhuma atividade recente</p>
                  <p className="text-xs opacity-30 mt-1">Carimbos e resgates aparecerão aqui</p>
                </div>
              ) : (
                activity.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/shop/${slug}/customers?userId=${item.customer_id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'STAMP' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-500'
                      }`}>
                      {item.type === 'STAMP' ? <Stamp size={18} /> : <Award size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{item.customer_name}</p>
                      <p className="text-xs text-gray-400">
                        {item.type === 'STAMP' ? 'Carimbo' : 'Resgate'} · {formatTime(item.created_at)}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
