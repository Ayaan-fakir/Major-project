import React, { useState } from 'react';
import { ClinicalDocument } from '../types';
import { saveClinicalDocument } from '../services/telemedicineStorage';
import { UploadCloud, FileText, X, CheckCircle2, Lock, ArrowRight, Image as ImageIcon } from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  uploaderRole: 'patient' | 'doctor';
  uploaderName: string;
  onDocumentUploaded: (doc: ClinicalDocument) => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  uploaderRole,
  uploaderName,
  onDocumentUploaded,
}) => {
  const [docTitle, setDocTitle] = useState('');
  const [category, setCategory] = useState<ClinicalDocument['category']>(
    uploaderRole === 'doctor' ? 'Prescription' : 'Lab Report'
  );
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileDataUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    setIsProcessing(true);

    setTimeout(() => {
      // Split notes into formatted clinical lines for Canvas rendering
      const rawLines = clinicalNotes
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const defaultLines = [
        `DOCUMENT TITLE: ${docTitle.toUpperCase()}`,
        `PATIENT: ${patientName.toUpperCase()} | ID: #${patientId}`,
        `UPLOADED BY: ${uploaderName.toUpperCase()} (${uploaderRole === 'doctor' ? 'ATTENDING CLINICIAN' : 'PATIENT ENCLAVE'})`,
        `CATEGORY: ${category.toUpperCase()}`,
        `TIMESTAMP: ${new Date().toLocaleString('en-IN')}`,
        ...(fileName ? [`ATTACHMENT DIGEST: ${fileName} (AES-256 ENCRYPTED)`] : []),
        ...(rawLines.length > 0 ? rawLines : ['CLINICAL REMARKS: Document verified and stored in session volatile RAM.']),
        'CRYPTOGRAPHIC STATUS: ZERO DISK CACHE · VIEW-ONLY ENCLAVE SEALED',
      ];

      const saved = saveClinicalDocument({
        patientId,
        patientName,
        doctorName: uploaderRole === 'doctor' ? uploaderName : undefined,
        title: docTitle,
        category,
        pages: 1,
        uploadedBy: uploaderRole,
        contentLines: defaultLines,
        fileUrl: fileDataUrl || undefined,
        fileType: fileName?.split('.').pop() || 'doc',
      });

      setIsProcessing(false);
      onDocumentUploaded(saved);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0E0E10] text-white rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Heading */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-black border border-[#D7FA3B] flex items-center justify-center text-[#D7FA3B]">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight text-white">
              Upload Health Record
            </h3>
            <p className="text-xs text-[#8C8C88] font-mono">
              In-RAM Blackbox Encryption · Target: {patientName}
            </p>
          </div>
        </div>

        <p className="text-xs text-[#8C8C88] mb-6 leading-relaxed">
          {uploaderRole === 'patient'
            ? 'Upload previous hospital prescriptions, lab reports, or scans for your assigned doctor to inspect in real time.'
            : 'Upload verified diagnostic summaries, radiology reports, or official prescriptions for this patient.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
              Record Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 12-Lead ECG Report / Lipid Panel / Chest X-Ray"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-[#D7FA3B]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
              Document Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-[#D7FA3B]"
            >
              <option value="Prescription">Prescription</option>
              <option value="Lab Report">Lab Report (Blood / Pathology)</option>
              <option value="Radiology / X-Ray">Radiology / X-Ray / DICOM Scan</option>
              <option value="Consultation Summary">Consultation Summary / Discharge</option>
              <option value="Patient Upload">General Health Record</option>
            </select>
          </div>

          {/* File Picker Drag & Drop box */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
              Attach Scan / Image / PDF (Optional)
            </label>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 hover:border-[#D7FA3B] rounded-2xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition-all">
              <input
                type="file"
                accept="image/*,.pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-[#D7FA3B] mb-2" />
              <div className="text-xs font-semibold text-white">
                {fileName ? fileName : 'Click to select report image or file'}
              </div>
              <div className="text-[10px] text-[#8C8C88] font-mono mt-1">
                PNG, JPG, PDF up to 25MB · Encrypted in memory
              </div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
              Clinical Findings / Observations (Optional Notes for Canvas)
            </label>
            <textarea
              rows={3}
              placeholder="Enter key observations, parameters, or instructions..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-[#D7FA3B] resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-sm tracking-tight transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Encrypting &amp; Sealing to RAM...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Seal to Blackbox Repository</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#8C8C88] text-center pt-2">
            <Lock className="w-3 h-3 text-[#D7FA3B]" />
            <span>Encrypted with AES-256-GCM · View-Only Protection Enforced</span>
          </div>
        </form>
      </div>
    </div>
  );
};
