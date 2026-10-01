import React from 'react';
import { Lock, Fingerprint, ShieldCheck, Video, Clock, UserCheck, HardDriveDownload } from 'lucide-react';

export const SecurityAboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 sm:py-32 bg-[#0E0E10] text-white relative overflow-hidden">
      {/* Decorative oversized bracket motif in outline style */}
      <div className="absolute left-8 top-12 text-white/5 font-mono text-[220px] select-none pointer-events-none leading-none">
        {'{'}
      </div>
      <div className="absolute right-8 bottom-12 text-white/5 font-mono text-[220px] select-none pointer-events-none leading-none">
        {'}'}
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Eyebrow Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-wider text-[#D7FA3B] uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D7FA3B] animate-pulse-dot"></span>
          <span>Zero-Trust Architecture</span>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Narrative Copy */}
          <div className="lg:col-span-6">
            <h2 className="font-display text-4xl sm:text-6xl font-normal tracking-tight text-white leading-[1.05] mb-6">
              We are dedicated to providing{' '}
              <span className="font-extrabold text-[#D7FA3B]">
                comprehensively verified
              </span>{' '}
              modern clinical care.
            </h2>

            <p className="text-[#8C8C88] text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              Traditional telemedicine assumes that once you log in with a password, your connection remains secure. Aegis replaces perimeter trust with perpetual verification—inspecting device posture, network anomaly signals, and clinical least-privilege for every consultation.
            </p>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 max-w-lg mb-8">
              <div className="font-mono text-xs text-[#D7FA3B] mb-2 tracking-wider uppercase font-semibold">
                Continuous Biometric Enclave
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                If anomalous keystroke timing, device posture changes, or IP relocation occurs during a consultation, the session steps up authentication in milliseconds without dropping the WebRTC call.
              </p>
            </div>
          </div>

          {/* Right Stack: 3 Thin-bordered flat black cards */}
          <div className="lg:col-span-6 space-y-4">
            {/* Card 1 */}
            <div className="p-7 rounded-2xl bg-[#141416] border border-white/12 hover:border-[#D7FA3B]/50 transition-colors shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-black border border-[#D7FA3B]/40 flex items-center justify-center shrink-0 text-[#D7FA3B]">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">
                    AES-256 Memory Encryption
                  </h3>
                  <p className="text-sm text-[#8C8C88] leading-relaxed">
                    Every file, vital packet, and WebRTC frame is encrypted end-to-end. Documents render in volatile system RAM with anti-screenshot watermarks and zero unencrypted disk caches.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-7 rounded-2xl bg-[#141416] border border-white/12 hover:border-[#D7FA3B]/50 transition-colors shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-black border border-[#D7FA3B]/40 flex items-center justify-center shrink-0 text-[#D7FA3B]">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">
                    Continuous Identity Verification
                  </h3>
                  <p className="text-sm text-[#8C8C88] leading-relaxed">
                    Device posture, geolocation consistency, and behavioral biometrics are actively scored throughout your session, eliminating hijacking and session token replay.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-7 rounded-2xl bg-[#141416] border border-white/12 hover:border-[#D7FA3B]/50 transition-colors shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-black border border-[#D7FA3B]/40 flex items-center justify-center shrink-0 text-[#D7FA3B]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">
                    HIPAA, GDPR &amp; SOC2 Type II Aligned
                  </h3>
                  <p className="text-sm text-[#8C8C88] leading-relaxed">
                    Built from day one to exceed international healthcare data sovereignty standards with cryptographic audit logs and immutable patient authorization consents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Feature Chips beneath */}
        <div className="mt-16 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#D7FA3B]" />
            <span className="text-xs sm:text-sm font-medium text-white/90">24/7 Emergency Support</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <UserCheck className="w-4 h-4 text-[#D7FA3B]" />
            <span className="text-xs sm:text-sm font-medium text-white/90">1-to-1 Doctor Assignment</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <Video className="w-4 h-4 text-[#D7FA3B]" />
            <span className="text-xs sm:text-sm font-medium text-white/90">WebRTC Video Consults</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <HardDriveDownload className="w-4 h-4 text-[#D7FA3B]" />
            <span className="text-xs sm:text-sm font-medium text-white/90">Zero Local Downloads</span>
          </div>
        </div>
      </div>
    </section>
  );
};
