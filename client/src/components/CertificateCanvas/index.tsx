import React, { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Download, FileImage } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/helpers";

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
    const containerRef = useRef<HTMLDivElement>(null);
    const certRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [isDownloadingPng, setIsDownloadingPng] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    useEffect(() => {
        const updateScale = () => {
            if (!containerRef.current) return;
            const containerWidth = containerRef.current.clientWidth;
            if (containerWidth < 794 && containerWidth > 0) {
                setScale(containerWidth / 794);
            } else {
                setScale(1);
            }
        };

        updateScale();
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        window.addEventListener("resize", updateScale);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", updateScale);
        };
    }, []);

    const amountWords = (n: number): string => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
        }).format(n);
    };

    const downloadPng = async () => {
        if (!certRef.current || isDownloadingPng) return;
        setIsDownloadingPng(true);
        try {
            const dataUrl = await toPng(certRef.current, {
                pixelRatio: 2.5,
                cacheBust: false,
                width: 794,
                height: 562,
            });
            const link = document.createElement("a");
            link.download = `certificate_${data.certificateNumber}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Certificate PNG downloaded!");
        } catch {
            toast.error("Failed to generate PNG. Please try again.");
        } finally {
            setIsDownloadingPng(false);
        }
    };

    const downloadPdf = async () => {
        if (!certRef.current || isDownloadingPdf) return;
        setIsDownloadingPdf(true);
        try {
            const dataUrl = await toPng(certRef.current, {
                pixelRatio: 2.5,
                cacheBust: false,
                width: 794,
                height: 562,
            });
            const img = new Image();
            img.src = dataUrl;
            img.onload = () => {
                const pdf = new jsPDF({
                    orientation: "landscape",
                    unit: "px",
                    format: [img.width, img.height],
                });
                pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
                pdf.save(`certificate_${data.certificateNumber}.pdf`);
                toast.success("Certificate PDF downloaded!");
                setIsDownloadingPdf(false);
            };
            img.onerror = () => {
                toast.error("Failed to generate PDF. Please try again.");
                setIsDownloadingPdf(false);
            };
        } catch {
            toast.error("Failed to generate PDF. Please try again.");
            setIsDownloadingPdf(false);
        }
    };

    return (
        <div ref={containerRef} className="flex flex-col items-center gap-6 w-full">
            {/* Certificate Scaled Wrapper for Mobile */}
            <div
                className="flex justify-center items-center overflow-hidden"
                style={{
                    width: `${Math.round(794 * scale)}px`,
                    height: `${Math.round(562 * scale)}px`,
                    position: "relative",
                    flexShrink: 0,
                    maxWidth: "100%",
                }}
            >
                <div
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "794px",
                        height: "562px",
                    }}
                >
                    <div
                        ref={certRef}
                        id="certificate-print-area"
                        className="relative bg-white shadow-xl rounded-sm shrink-0 flex flex-col justify-between"
                        style={{
                            width: "794px",
                            height: "562px",
                            fontFamily: "Georgia, serif",
                            border: "12px solid #059669",
                            outline: "3px solid #d1fae5",
                            outlineOffset: "-18px",
                            padding: "22px 48px 18px",
                            boxSizing: "border-box",
                        }}
                    >
                    {/* Corner decorations */}
                    <div
                        style={{
                            position: "absolute",
                            top: 18,
                            left: 18,
                            width: 36,
                            height: 36,
                            borderTop: "4px solid #059669",
                            borderLeft: "4px solid #059669",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: 18,
                            right: 18,
                            width: 36,
                            height: 36,
                            borderTop: "4px solid #059669",
                            borderRight: "4px solid #059669",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: 18,
                            left: 18,
                            width: 36,
                            height: 36,
                            borderBottom: "4px solid #059669",
                            borderLeft: "4px solid #059669",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: 18,
                            right: 18,
                            width: 36,
                            height: 36,
                            borderBottom: "4px solid #059669",
                            borderRight: "4px solid #059669",
                        }}
                    />

                    {/* Top Group: Header & Title */}
                    <div>
                        {/* Header */}
                        <div style={{ textAlign: "center", marginBottom: 12 }}>
                            {data.ngoLogo && (
                                <img
                                    src={data.ngoLogo}
                                    alt="NGO Logo"
                                    style={{
                                        height: 40,
                                        margin: "0 auto 4px",
                                        objectFit: "contain",
                                        display: "block",
                                    }}
                                />
                            )}
                            <div
                                style={{
                                    fontSize: 19,
                                    fontWeight: "bold",
                                    color: "#065f46",
                                    letterSpacing: 1,
                                    textTransform: "uppercase",
                                    lineHeight: 1.2,
                                }}
                            >
                                {data.ngoName}
                            </div>
                            {data.ngoAddress && (
                                <div
                                    style={{
                                        fontSize: 9.5,
                                        color: "#64748b",
                                        marginTop: 2,
                                    }}
                                >
                                    {data.ngoAddress}
                                </div>
                            )}
                            {data.registrationNumber && (
                                <div style={{ fontSize: 9.5, color: "#64748b" }}>
                                    Reg. No: {data.registrationNumber}
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <div style={{ textAlign: "center", marginBottom: 10 }}>
                            <div
                                style={{
                                    display: "inline-block",
                                    borderBottom: "2px solid #059669",
                                    paddingBottom: 2,
                                }}
                            >
                                <h1
                                    style={{
                                        fontSize: 19,
                                        fontWeight: 800,
                                        color: "#059669",
                                        margin: 0,
                                        letterSpacing: 2,
                                        textTransform: "uppercase",
                                        fontFamily: "Georgia, serif",
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Certificate of Appreciation
                                </h1>
                            </div>
                            <div
                                style={{
                                    fontSize: 9.5,
                                    color: "#94a3b8",
                                    marginTop: 4,
                                    fontStyle: "italic",
                                }}
                            >
                                This is to gratefully acknowledge the generous contribution of
                            </div>
                        </div>
                    </div>

                    {/* Middle Group: Donor & Donation Details */}
                    <div>
                        {/* Donor Name */}
                        <div style={{ textAlign: "center", marginBottom: 8 }}>
                            <div
                                style={{
                                    fontSize: 23,
                                    fontWeight: 800,
                                    color: "#0f172a",
                                    borderBottom: "1px dotted #cbd5e1",
                                    display: "inline-block",
                                    paddingBottom: 2,
                                    minWidth: 260,
                                    lineHeight: 1.2,
                                }}
                            >
                                {data.donorName}
                            </div>
                        </div>

                        {/* Donation Details */}
                        <div
                            style={{
                                textAlign: "center",
                                fontSize: 12.5,
                                color: "#475569",
                                marginBottom: 8,
                                lineHeight: 1.5,
                            }}
                        >
                            <span>who generously donated</span>{" "}
                            <strong style={{ color: "#059669", fontSize: 15, fontWeight: 700 }}>
                                {amountWords(data.amount)}
                            </strong>{" "}
                            <span>on</span>{" "}
                            <strong style={{ color: "#0f172a", fontWeight: 700 }}>
                                {formatDate(data.donationDate)}
                            </strong>
                            {data.purpose && (
                                <React.Fragment>
                                    <br />
                                    <span style={{ fontSize: 11 }}>
                                        towards: <em>{data.purpose}</em>
                                    </span>
                                </React.Fragment>
                            )}
                        </div>

                        <div
                            style={{
                                textAlign: "center",
                                fontSize: 10.5,
                                color: "#94a3b8",
                                fontStyle: "italic",
                            }}
                        >
                            We are deeply grateful for your support in our mission to uplift communities and transform lives.
                        </div>
                    </div>

                    {/* Bottom Group: Signatures & Certificate Number */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            paddingTop: 8,
                        }}
                    >
                        <div style={{ textAlign: "center", minWidth: 150 }}>
                            {data.signatureUrl ? (
                                <img
                                    src={data.signatureUrl}
                                    alt="Signature"
                                    style={{
                                        height: 32,
                                        maxHeight: 32,
                                        margin: "0 auto 2px",
                                        objectFit: "contain",
                                        display: "block",
                                    }}
                                />
                            ) : (
                                <div style={{ height: 32, marginBottom: 2 }} />
                            )}
                            <div
                                style={{
                                    borderTop: "1px solid #334155",
                                    paddingTop: 3,
                                    fontSize: 9.5,
                                    color: "#334155",
                                    lineHeight: 1.3,
                                }}
                            >
                                <div style={{ fontWeight: 700 }}>
                                    {data.presidentName || "President"}
                                </div>
                                <div style={{ color: "#64748b" }}>
                                    Authorized Signatory / President
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 9.5, color: "#94a3b8" }}>
                                Certificate No.
                            </div>
                            <div
                                style={{
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    color: "#334155",
                                    fontFamily: "monospace",
                                }}
                            >
                                {data.certificateNumber}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            {/* Download buttons */}
            {showDownloadButtons && (
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    <button
                        onClick={downloadPng}
                        disabled={isDownloadingPng || isDownloadingPdf}
                        className="btn-outline flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm min-w-[140px]"
                    >
                        {isDownloadingPng ? (
                            <React.Fragment>
                                <span className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-emerald-600 animate-spin" />
                                Generating…
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <FileImage className="h-4 w-4" />
                                Download PNG
                            </React.Fragment>
                        )}
                    </button>
                    <button
                        onClick={downloadPdf}
                        disabled={isDownloadingPng || isDownloadingPdf}
                        className="btn-primary flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm min-w-[140px]"
                    >
                        {isDownloadingPdf ? (
                            <React.Fragment>
                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                Generating…
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Download className="h-4 w-4" />
                                Download PDF
                            </React.Fragment>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CertificateCanvas;
