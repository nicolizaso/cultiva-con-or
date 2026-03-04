"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bulkChangeStage } from "@/app/cycles/actions";

const stageColumnMap: Record<string, string> = {
  'Germinación': 'date_germinacion',
  'Plántula': 'date_plantula',
  'Enraizamiento': 'date_enraizamiento',
  'Vegetativo': 'date_vegetativo',
  'Floración': 'date_floracion',
  'Secado': 'date_secado',
  'Curado': 'date_curado'
};

interface BulkStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: number[];
  onSuccess: () => void;
  cycleId: number;
}

export default function BulkStageModal({ isOpen, onClose, selectedIds, onSuccess, cycleId }: BulkStageModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("Floración");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dateCol = stageColumnMap[stage];

    const res = await bulkChangeStage(
      selectedIds,
      stage,
      new Date(date).toISOString(),
      cycleId,
      undefined,
      dateCol
    );

    setLoading(false);

    if (res?.success) {
      router.refresh();
      onSuccess();
      onClose();
    } else {
      alert("Error: " + res?.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-brand-card w-full max-w-sm rounded-2xl border border-[#333] shadow-2xl p-6 animate-in zoom-in duration-200">
        <h2 className="text-xl font-subtitle text-purple-400 mb-1 uppercase">Cambio de Etapa</h2>
        <p className="text-xs text-brand-muted mb-6">
            Moviendo <span className="font-bold text-white">{selectedIds.length} plantas</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Nueva Etapa</label>
            <select 
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              <option value="Germinación">🌱 Germinación</option>
              <option value="Plántula">🌱 Plántula</option>
              <option value="Enraizamiento">🧬 Enraizamiento</option>
              <option value="Vegetativo">🌿 Vegetativo</option>
              <option value="Floración">🌸 Floración</option>
              <option value="Secado">🍂 Secado</option>
              <option value="Curado">🏺 Curado</option>
            </select>
          </div>

          <div>
            <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Fecha del Cambio</label>
            <input 
              type="date"
              required
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex gap-3 mt-6 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 text-brand-muted hover:text-white font-bold text-xs uppercase"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-title tracking-wide transition disabled:opacity-50"
            >
              {loading ? "PROCESANDO..." : "CAMBIAR ETAPA"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}