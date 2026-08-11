import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Download, FileImage } from 'lucide-react';
import { formatDateShort } from '../../utils/helpers';
import { capitalize } from '../../utils/helpers';

export interface IdCardData {
  ngoName: string;
  ngoLogo?: string;
  cardNumber: string;
  holderName: string;
  phone: string;
  email?: string;
  designation: string;
  passportPhotoUrl?: string;
  issueDate: string;
  expiryDate?: string;
  address?: string;
  presidentName?: string;
  signatureUrl?: string;
}

interface IDCardCanvasProps {
  data: IdCardData;
  showDownloadButtons?: boolean;
}

const DESIGNATION_COLORS: Record<string, string> = {
  president:  '#dc2626',
  secretary:  '#7c3aed',
  admin:      '#0369a1',
  member:     '#059669',
  volunteer:  '#d97706',
};

const IDCardCanvas: React.FC<IDCardCanvasProps> = ({
  data,
  showDownloadButtons = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const designationColor = DESIGNATION_COLORS[data.designation] || '#059669';

  const downloadPng = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
    const link = document.createElement('a');
    link.download = `id_card_${data.cardNumber}.png`;
    link.href = dataUrl;
    link.click();
  };

  const downloadPdf = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const pdf = new jsPDF({ unit: 'px', format: [img.width, img.height] });
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`id_card_${data.cardNumber}.pdf`);
    };
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card container */}
      <div ref={cardRef} className="flex flex-col sm:flex-row gap-4">
        {/* FRONT */}
        <div
          style={{
            width: 320,
            height: 200,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #065f46 0%, #059669 60%, #34d399 100%)',
            padding: '20px 20px 16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(5,150,105,0.4)',
            fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box',
          }}
        >
          {/* Background decoration */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

          {/* Top row: Logo + NGO Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            {data.ngoLogo ? (
              <img src={data.ngoLogo} alt="" style={{ height: 28, width: 28, borderRadius: 6, objectFit: 'contain', background: '#fff', padding: 2 }} />
            ) : (
              <div style={{ height: 28, width: 28, borderRadius: 6, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>N</span>
              </div>
            )}
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {data.ngoName}
            </span>
          </div>

          {/* Main content: Photo + Details */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {/* Photo */}
            <div style={{ width: 64, height: 80, borderRadius: 8, background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', overflow: 'hidden', flexShrink: 0 }}>
              {data.passportPhotoUrl ? (
                <img src={data.passportPhotoUrl} alt={data.holderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.6)' }}>👤</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 2, lineHeight: 1.2 }}>
                {data.holderName}
              </div>
              <div style={{
                display: 'inline-block',
                background: designationColor,
                color: '#fff',
                fontSize: 9,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 20,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 6,
              }}>
                {capitalize(data.designation)}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                <div>📱 {data.phone}</div>
                {data.email && <div>✉ {data.email}</div>}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ position: 'absolute', bottom: 12, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', letterSpacing: 0.5 }}>
              #{data.cardNumber}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>
              Valid till: {data.expiryDate ? formatDateShort(data.expiryDate) : 'Lifetime'}
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          style={{
            width: 320,
            height: 200,
            borderRadius: 16,
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            padding: '20px 20px 16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box',
          }}
        >
          {/* Magnetic stripe */}
          <div style={{ height: 32, background: '#1e293b', marginLeft: -20, marginRight: -20, marginBottom: 14, marginTop: -20 }} />

          {/* Signature strip */}
          <div style={{ background: '#fff7ed', border: '1px solid #fde68a', borderRadius: 4, padding: '6px 10px', marginBottom: 10 }}>
            {data.signatureUrl ? (
              <img src={data.signatureUrl} alt="Signature" style={{ height: 24, objectFit: 'contain' }} />
            ) : (
              <div style={{ height: 24, borderBottom: '1px solid #94a3b8', width: '100%' }} />
            )}
            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>Authorized Signature</div>
          </div>

          {/* Issue info */}
          <div style={{ fontSize: 9, color: '#64748b', lineHeight: 1.7 }}>
            <div><strong>Issued By:</strong> {data.ngoName}</div>
            <div><strong>Issue Date:</strong> {formatDateShort(data.issueDate)}</div>
            {data.presidentName && <div><strong>President:</strong> {data.presidentName}</div>}
            {data.address && <div><strong>Address:</strong> {data.address}</div>}
          </div>

          {/* Disclaimer */}
          <div style={{ position: 'absolute', bottom: 10, left: 16, right: 16, fontSize: 8, color: '#94a3b8', textAlign: 'center', lineHeight: 1.4 }}>
            If found, please return to {data.ngoName}. This card is the property of the organization.
          </div>
        </div>
      </div>

      {/* Download buttons */}
      {showDownloadButtons && (
        <div className="flex items-center gap-3">
          <button onClick={downloadPng} className="btn-outline flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Download PNG
          </button>
          <button onClick={downloadPdf} className="btn-primary flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default IDCardCanvas;
