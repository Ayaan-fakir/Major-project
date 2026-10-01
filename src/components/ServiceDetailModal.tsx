import React from 'react';
import { ServiceItem } from '../types';
import { X, CheckCircle2, ArrowRight, Shield } from 'lucide-react';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onBookDepartment: (departmentName: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onBookDepartment,
}) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0E0E10] text-white rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Subtle decorative bracket motif */}
        <div className="absolute right-4 top-2 text-white/5 font-mono text-8xl pointer-events-none select-none">
          {'{ }'}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7FA3B]/10 border border-[#D7FA3B]/30 text-[#D7FA3B] text-xs font-mono mb-4">
          <Shield className="w-3.5 h-3.5" />
          <span>Department Overview · {service.category}</span>
        </div>

        <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          {service.name}
        </h3>

        <p className="text-[#8C8C88] text-sm sm:text-base leading-relaxed mb-6">
          {service.fullOverview || service.description}
        </p>

        {/* Benefits list */}
        <div className="space-y-3 mb-8">
          <div className="text-xs font-mono uppercase tracking-wider text-[#8C8C88]">
            Key Clinical Benefits &amp; Protections
          </div>
          {service.benefits?.map((benefit, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 text-sm text-[#F6F4EE]"
            >
              <div className="w-6 h-6 rounded-full bg-[#D7FA3B]/20 text-[#D7FA3B] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Action button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="text-xs text-[#8C8C88] font-mono">
            Zero-Trust WebRTC consult available
          </div>

          <button
            onClick={() => {
              onBookDepartment(service.name);
              onClose();
            }}
            className="px-6 py-3 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md"
          >
            <span>Book in this department</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
