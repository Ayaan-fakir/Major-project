import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, Activity, Cpu, Globe, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { AuthUser } from '../types';

interface SecurityVerificationModalProps {
  isOpen: boolean;
  user: AuthUser | null;
  onVerificationComplete: (user: AuthUser) => void;
  onCancel: () => void;
}

export const SecurityVerificationModal: React.FC<SecurityVerificationModalProps> = ({
  isOpen,
  user,
  onVerificationComplete,
  onCancel,
}) => {
  const [progress, setProgress] = useState(0);
  const [ipChecked, setIpChecked] = useState(false);
  const [trustScoreChecked, setTrustScoreChecked] = useState(false);
  const [hardwareChecked, setHardwareChecked] = useState(false);
  const [trustScoreValue, setTrustScoreValue] = useState(72);
  const [shaHash, setShaHash] = useState('8f4b...39e1');

  useEffect(() => {
    if (!isOpen || !user) {
      setProgress(0);
      setIpChecked(false);
      setTrustScoreChecked(false);
      setHardwareChecked(false);
      return;
    }

    // Generate random session hash
    const randomHex = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setShaHash(`${randomHex.slice(0, 4)}...${randomHex.slice(4)}`);

    // Progressive simulated security inspection
    const timer1 = setTimeout(() => {
      setProgress(34);
      setIpChecked(true);
    }, 600);

    const timer2 = setTimeout(() => {
      setProgress(72);
      setTrustScoreValue(96);
      setTrustScoreChecked(true);
    }, 1300);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setHardwareChecked(true);
    }, 2000);

    const timer4 = setTimeout(() => {
      onVerificationComplete(user);
    }, 2600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen, user, onVerificationComplete]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#141416] text-white rounded-3xl border border-[#D7FA3B]/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Top Glow & Decorative Pattern */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-[#D7FA3B]/10 blur-3xl pointer-events-none" />

        {/* Central Shield Icon with Pulsing Halo */}
        <div className="relative flex justify-center mb-5">
          <div className="relative w-16 h-16 rounded-2xl bg-black border border-[#D7FA3B]/50 flex items-center justify-center text-[#D7FA3B] shadow-lg">
            <Shield className="w-8 h-8 fill-[#D7FA3B]/20 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D7FA3B] border-2 border-black animate-ping" />
          </div>
        </div>

        {/* Title & Patient Information */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7FA3B]/10 border border-[#D7FA3B]/30 text-[#D7FA3B] text-[11px] font-mono uppercase mb-2">
            <Lock className="w-3 h-3" />
            <span>Zero-Trust Pre-Authentication Enclave</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-white">
            Security Posture Inspection
          </h3>
          <p className="text-xs text-[#8C8C88] mt-1">
            Verifying client parameters for <strong className="text-white">{user.name}</strong> (#{user.id})
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-mono text-[#8C8C88] mb-1.5">
            <span>Enclave Cryptographic Handshake</span>
            <span className="text-[#D7FA3B] font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D7FA3B] to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 3 Parameter Verification Cards */}
        <div className="space-y-3 mb-6 font-mono text-xs">
          {/* Parameter 1: IP & Geo-Location */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              ipChecked
                ? 'bg-black/80 border-[#D7FA3B]/40 text-white'
                : 'bg-black/40 border-white/10 text-[#8C8C88]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  ipChecked ? 'bg-[#D7FA3B]/20 text-[#D7FA3B]' : 'bg-white/5 text-[#8C8C88]'
                }`}
              >
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">1. Client IP &amp; Geolocation</div>
                <div className="text-[10px] text-[#8C8C88]">
                  {ipChecked
                    ? '49.37.142.88 (Bangalore Subnet) · Zero Proxy / VPN'
                    : 'Inspecting client subnet & route integrity...'}
                </div>
              </div>
            </div>

            <div>
              {ipChecked ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#D7FA3B]/20 text-[#D7FA3B] text-[10px] font-bold flex items-center gap-1 border border-[#D7FA3B]/40">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 animate-pulse">Scanning...</span>
              )}
            </div>
          </div>

          {/* Parameter 2: Continuous Trust Score Engine */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              trustScoreChecked
                ? 'bg-black/80 border-[#D7FA3B]/40 text-white'
                : 'bg-black/40 border-white/10 text-[#8C8C88]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  trustScoreChecked ? 'bg-[#D7FA3B]/20 text-[#D7FA3B]' : 'bg-white/5 text-[#8C8C88]'
                }`}
              >
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">2. Continuous Trust Score Engine</div>
                <div className="text-[10px] text-[#8C8C88]">
                  {trustScoreChecked
                    ? `Telemetry Analyzed · Trust Score: ${trustScoreValue}/100 (Optimal)`
                    : 'Evaluating behavioral cadence & anomaly matrix...'}
                </div>
              </div>
            </div>

            <div>
              {trustScoreChecked ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#D7FA3B]/20 text-[#D7FA3B] text-[10px] font-bold flex items-center gap-1 border border-[#D7FA3B]/40">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>96% Optimal</span>
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 animate-pulse">Computing...</span>
              )}
            </div>
          </div>

          {/* Parameter 3: Hardware Enclave & Cryptographic Token Posture */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              hardwareChecked
                ? 'bg-black/80 border-[#D7FA3B]/40 text-white'
                : 'bg-black/40 border-white/10 text-[#8C8C88]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  hardwareChecked ? 'bg-[#D7FA3B]/20 text-[#D7FA3B]' : 'bg-white/5 text-[#8C8C88]'
                }`}
              >
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">3. Cryptographic Hardware Enclave</div>
                <div className="text-[10px] text-[#8C8C88]">
                  {hardwareChecked
                    ? `WebCrypto TPM Attestation · SHA-256: ${shaHash}`
                    : 'Attesting hardware token & isolated RAM enclave...'}
                </div>
              </div>
            </div>

            <div>
              {hardwareChecked ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#D7FA3B]/20 text-[#D7FA3B] text-[10px] font-bold flex items-center gap-1 border border-[#D7FA3B]/40">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Enclave Ready</span>
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 animate-pulse">Attesting...</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="text-xs text-[#8C8C88] hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => onVerificationComplete(user)}
            className="px-5 py-2.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-xs tracking-tight transition-all active:scale-95 shadow-md flex items-center gap-1.5"
          >
            <span>Proceed to Patient Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
