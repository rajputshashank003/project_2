import React, { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Download, FileImage } from "lucide-react";
import toast from "react-hot-toast";
import { formatDateShort, capitalize } from "../../utils/helpers";

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
    president: "#dc2626",
    secretary: "#7c3aed",
    admin: "#0369a1",
    member: "#059669",
    volunteer: "#d97706",
};

const IDCardCanvas: React.FC<IDCardCanvasProps> = ({
    data,
    showDownloadButtons = true,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [isStacked, setIsStacked] = useState(false);
    const [isDownloadingPng, setIsDownloadingPng] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    const designationColor = DESIGNATION_COLORS[data.designation] || "#059669";

    useEffect(() => {
        const updateScale = () => {
            if (!containerRef.current) return;
            const containerWidth = containerRef.current.clientWidth;
            const stacked = containerWidth < 680;
            setIsStacked(stacked);
            const baseWidth = stacked ? 320 : 656;
            if (containerWidth < baseWidth && containerWidth > 0) {
                setScale(containerWidth / baseWidth);
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

    const downloadPng = async () => {
        if (!cardRef.current || isDownloadingPng) return;
        setIsDownloadingPng(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                pixelRatio: 2.5,
                cacheBust: false,
            });
            const link = document.createElement("a");
            link.download = `id_card_${data.cardNumber || "card"}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("ID Card PNG downloaded!");
        } catch {
            toast.error("Failed to generate PNG. Please try again.");
        } finally {
            setIsDownloadingPng(false);
        }
    };

    const downloadPdf = async () => {
        if (!frontRef.current || !backRef.current || isDownloadingPdf) return;
        setIsDownloadingPdf(true);
        try {
            const frontUrl = await toPng(frontRef.current, {
                pixelRatio: 2.5,
                cacheBust: false,
                width: 320,
                height: 200,
            });
            const backUrl = await toPng(backRef.current, {
                pixelRatio: 2.5,
                cacheBust: false,
                width: 320,
                height: 200,
            });

            const cardWidth = 320;
            const cardHeight = 200;
            const margin = 20;
            const pdfWidth = cardWidth + margin * 2;
            const pdfHeight = cardHeight * 2 + margin * 3;

            const pdf = new jsPDF({
                orientation: "p",
                unit: "px",
                format: [pdfWidth, pdfHeight],
            });

            pdf.addImage(
                frontUrl,
                "PNG",
                margin,
                margin,
                cardWidth,
                cardHeight,
            );
            pdf.addImage(
                backUrl,
                "PNG",
                margin,
                margin + cardHeight + margin,
                cardWidth,
                cardHeight,
            );
            pdf.save(`id_card_${data.cardNumber || "card"}.pdf`);
            toast.success("ID Card PDF downloaded!");
        } catch {
            // Fallback to cardRef
            try {
                if (!cardRef.current) return;
                const dataUrl = await toPng(cardRef.current, {
                    pixelRatio: 2,
                    cacheBust: false,
                });
                const pdf = new jsPDF({ unit: "px", format: [680, 240] });
                pdf.addImage(dataUrl, "PNG", 20, 20, 640, 200);
                pdf.save(`id_card_${data.cardNumber || "card"}.pdf`);
                toast.success("ID Card PDF downloaded!");
            } catch {
                toast.error("Failed to generate PDF. Please try again.");
            }
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const baseWidth = isStacked ? 320 : 656;
    const baseHeight = isStacked ? 416 : 200;

    return (
        <div ref={containerRef} className="flex flex-col items-center gap-6 w-full">
            {/* Card Scaled Container */}
            <div
                className="flex justify-center items-center overflow-hidden"
                style={{
                    width: `${Math.round(baseWidth * scale)}px`,
                    height: `${Math.round(baseHeight * scale)}px`,
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
                        width: `${baseWidth}px`,
                        height: `${baseHeight}px`,
                    }}
                >
                    <div
                        ref={cardRef}
                        className={`flex ${isStacked ? "flex-col" : "flex-row"} gap-4 p-0 bg-transparent shrink-0`}
                        style={{
                            width: `${baseWidth}px`,
                            height: `${baseHeight}px`,
                        }}
                    >
                        {/* FRONT */}
                        <div
                            ref={frontRef}
                    style={{
                        width: 320,
                        height: 200,
                        borderRadius: 16,
                        background:
                            "linear-gradient(135deg, #065f46 0%, #059669 60%, #34d399 100%)",
                        padding: "20px 20px 16px",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 8px 30px rgba(5,150,105,0.4)",
                        fontFamily: "Inter, sans-serif",
                        boxSizing: "border-box",
                    }}
                >
                    {/* Background decoration */}
                    <div
                        style={{
                            position: "absolute",
                            top: -30,
                            right: -30,
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.08)",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: -40,
                            left: -20,
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.06)",
                        }}
                    />

                    {/* Top row: Logo + NGO Name */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 12,
                        }}
                    >
                        {data.ngoLogo ? (
                            <img
                                src={data.ngoLogo}
                                alt=""
                                style={{
                                    height: 28,
                                    width: 28,
                                    borderRadius: 6,
                                    objectFit: "contain",
                                    background: "#fff",
                                    padding: 2,
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    height: 28,
                                    width: 28,
                                    borderRadius: 6,
                                    background: "rgba(255,255,255,0.25)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <span
                                    style={{
                                        color: "#fff",
                                        fontSize: 12,
                                        fontWeight: 800,
                                    }}
                                >
                                    N
                                </span>
                            </div>
                        )}
                        <span
                            style={{
                                color: "rgba(255,255,255,0.9)",
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                textTransform: "uppercase",
                            }}
                        >
                            {data.ngoName}
                        </span>
                    </div>

                    {/* Main content: Photo + Details */}
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start",
                        }}
                    >
                        {/* Photo */}
                        <div
                            style={{
                                width: 64,
                                height: 80,
                                borderRadius: 8,
                                background: "rgba(255,255,255,0.2)",
                                border: "2px solid rgba(255,255,255,0.5)",
                                overflow: "hidden",
                                flexShrink: 0,
                            }}
                        >
                            {data.passportPhotoUrl ? (
                                <img
                                    src={data.passportPhotoUrl}
                                    alt={data.holderName}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 28,
                                            color: "rgba(255,255,255,0.6)",
                                        }}
                                    >
                                        👤
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: "#fff",
                                    marginBottom: 2,
                                    lineHeight: 1.2,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {data.holderName}
                            </div>
                            <div
                                style={{
                                    display: "inline-block",
                                    background: designationColor,
                                    color: "#fff",
                                    fontSize: 9,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 20,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.8,
                                    marginBottom: 6,
                                }}
                            >
                                {capitalize(data.designation)}
                            </div>
                            <div
                                style={{
                                    fontSize: 10,
                                    color: "rgba(255,255,255,0.8)",
                                    lineHeight: 1.5,
                                }}
                            >
                                <div>📱 {data.phone}</div>
                                {data.email && (
                                    <div
                                        style={{
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        ✉ {data.email}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: 12,
                            left: 20,
                            right: 20,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 9,
                                color: "rgba(255,255,255,0.7)",
                                fontFamily: "monospace",
                                letterSpacing: 0.5,
                            }}
                        >
                            #{data.cardNumber}
                        </div>
                        <div
                            style={{
                                fontSize: 9,
                                color: "rgba(255,255,255,0.7)",
                            }}
                        >
                            Valid till:{" "}
                            {data.expiryDate
                                ? formatDateShort(data.expiryDate)
                                : "Lifetime"}
                        </div>
                    </div>
                </div>

                {/* BACK */}
                <div
                    ref={backRef}
                    style={{
                        width: 320,
                        height: 200,
                        borderRadius: 16,
                        background: "#f8fafc",
                        border: "2px solid #e2e8f0",
                        padding: "20px 20px 14px",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                        fontFamily: "Inter, sans-serif",
                        boxSizing: "border-box",
                    }}
                >
                    {/* Magnetic stripe */}
                    <div
                        style={{
                            height: 30,
                            background: "#1e293b",
                            marginLeft: -20,
                            marginRight: -20,
                            marginBottom: 10,
                            marginTop: -20,
                        }}
                    />

                    {/* Signature strip */}
                    <div
                        style={{
                            background: "#fff7ed",
                            border: "1px solid #fde68a",
                            borderRadius: 4,
                            padding: "4px 8px",
                            marginBottom: 8,
                        }}
                    >
                        {data.signatureUrl ? (
                            <img
                                src={data.signatureUrl}
                                alt="Signature"
                                style={{ height: 22, objectFit: "contain" }}
                            />
                        ) : (
                            <div
                                style={{
                                    height: 22,
                                    borderBottom: "1px solid #94a3b8",
                                    width: "100%",
                                }}
                            />
                        )}
                        <div
                            style={{
                                fontSize: 8,
                                color: "#94a3b8",
                                marginTop: 1,
                            }}
                        >
                            Authorized Signature
                        </div>
                    </div>

                    {/* Issue info */}
                    <div
                        style={{
                            fontSize: 8.5,
                            color: "#64748b",
                            lineHeight: 1.35,
                        }}
                    >
                        <div
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            <strong>Issued By:</strong> {data.ngoName}
                        </div>
                        <div>
                            <strong>Issue Date:</strong>{" "}
                            {formatDateShort(data.issueDate)}
                        </div>
                        {data.presidentName && (
                            <div
                                style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                <strong>President:</strong> {data.presidentName}
                            </div>
                        )}
                        {data.address && (
                            <div
                                style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: data.presidentName ? 2 : 3,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    wordBreak: "break-word",
                                    lineHeight: 1.3,
                                    marginTop: 1,
                                }}
                            >
                                <strong>Address:</strong> {data.address}
                            </div>
                        )}
                    </div>

                    {/* Disclaimer */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: 8,
                            left: 16,
                            right: 16,
                            fontSize: 7.5,
                            color: "#94a3b8",
                            textAlign: "center",
                            lineHeight: 1.3,
                        }}
                    >
                        If found, please return to {data.ngoName}. Card is
                        property of organization.
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

export default IDCardCanvas;
