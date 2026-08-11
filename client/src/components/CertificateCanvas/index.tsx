import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Download, FileImage } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export interface CertificateData {
  ngoName: string;
  ngoLogo?: string;
  ngoAddress?: string;
  ngoEmail?: string;
  registrationNumber?: string;
  presidentName?: string;
  secretaryName?: string;
  signatureUrl?: string;
  donorName: string;
  amount: number;
  donationDate: string;
  certificateNumber: string;
  purpose?: string;
}

interface CertificateCanvasProps {
  data: CertificateData;
  showDownloadButtons?: boolean;
}

const CertificateCanvas: React.FC<CertificateCanvasProps> = ({
  data,
  showDownloadButtons = true,
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  const amountWords = (n: number): string => {
    // HELLO Simple conversion for display (extend as needed)
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
  };

  const downloadPng = async () => {
    if (!certRef.current) return;
    const dataUrl = await toPng(certRef.current, { cacheBust: true, pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `certificate_${data.certificateNumber}.png`;
    link.href = dataUrl;
    link.click();
  };

  const downloadPdf = async () => {
    if (!certRef.current) return;
    const dataUrl = await toPng(certRef.current, { cacheBust: true, pixelRatio: 2 });
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [img.width, img.height] });
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`certificate_${data.certificateNumber}.pdf`);
    };
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Certificate */}
      <div
        ref={certRef}
        id="certificate-print-area"
        className="relative w-full bg-white"
        style={{
          width: '794px',
          minHeight: '562px',
          maxWidth: '100%',
          fontFamily: 'Georgia, serif',
          border: '12px solid #059669',
          outline: '3px solid #d1fae5',
          outlineOffset: '-18px',
          padding: '40px 56px',
          boxSizing: 'border-box',
        }}
      >
        {/* Corner decorations */}
        <div style={{ position: 'absolute', top: 18, left: 18, width: 40, height: 40, borderTop: '4px solid #059669', borderLeft: '4px solid #059669' }} />
        <div style={{ position: 'absolute', top: 18, right: 18, width: 40, height: 40, borderTop: '4px solid #059669', borderRight: '4px solid #059669' }} />
        <div style={{ position: 'absolute', bottom: 18, left: 18, width: 40, height: 40, borderBottom: '4px solid #059669', borderLeft: '4px solid #059669' }} />
        <div style={{ position: 'absolute', bottom: 18, right: 18, width: 40, height: 40, borderBottom: '4px solid #059669', borderRight: '4px solid #059669' }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {data.ngoLogo && (
            <img src={data.ngoLogo} alt="NGO Logo" style={{ height: 72, margin: '0 auto 12px', objectFit: 'contain' }} />
          )}
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#065f46', letterSpacing: 1, textTransform: 'uppercase' }}>
            {data.ngoName}
          </div>
          {data.ngoAddress && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{data.ngoAddress}</div>}
          {data.registrationNumber && <div style={{ fontSize: 11, color: '#64748b' }}>Reg. No: {data.registrationNumber}</div>}
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-block', borderBottom: '2px solid #059669', paddingBottom: 6 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#059669', margin: 0, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}>
              Certificate of Appreciation
            </h1>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, fontStyle: 'italic' }}>
            This is to gratefully acknowledge the generous contribution of
          </div>
        </div>

        {/* Donor Name */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', borderBottom: '1px dotted #cbd5e1', display: 'inline-block', paddingBottom: 4, minWidth: 300 }}>
            {data.donorName}
          </div>
        </div>

        {/* Donation Details */}
        <div style={{ textAlign: 'center', fontSize: 14, color: '#475569', marginBottom: 24, lineHeight: 1.8 }}>
          <span>who generously donated</span>
          {' '}
          <strong style={{ color: '#059669', fontSize: 18 }}>{amountWords(data.amount)}</strong>
          {' '}
          <span>on</span>
          {' '}
          <strong style={{ color: '#0f172a' }}>{formatDate(data.donationDate)}</strong>
          {data.purpose && <><br /><span>towards: <em>{data.purpose}</em></span></>}
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 28, fontStyle: 'italic' }}>
          We are deeply grateful for your support in our mission to uplift communities and transform lives.
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
          <div style={{ textAlign: 'center', minWidth: 160 }}>
            {data.signatureUrl && <img src={data.signatureUrl} alt="Signature" style={{ height: 40, marginBottom: 4 }} />}
            <div style={{ borderTop: '1px solid #334155', paddingTop: 4, fontSize: 11, color: '#334155' }}>
              <div style={{ fontWeight: 700 }}>{data.presidentName || 'President'}</div>
              <div style={{ color: '#64748b' }}>President</div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Certificate No.</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', fontFamily: 'monospace' }}>{data.certificateNumber}</div>
          </div>

          <div style={{ textAlign: 'center', minWidth: 160 }}>
            <div style={{ borderTop: '1px solid #334155', paddingTop: 4, fontSize: 11, color: '#334155' }}>
              <div style={{ fontWeight: 700 }}>{data.secretaryName || 'Secretary'}</div>
              <div style={{ color: '#64748b' }}>Secretary</div>
            </div>
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

export default CertificateCanvas;
