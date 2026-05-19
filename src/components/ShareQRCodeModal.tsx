"use client";

import React, {useEffect, useState, useCallback} from "react";
import Image from "next/image";
import {QrCode, Download, Copy, Check, RefreshCw, Share2} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {generateQRCode} from "@/services/qrcode";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName: string;
}

const ShareQRCodeModal = ({isOpen, onClose, repoName}: QRCodeModalProps) => {
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  const fetchQrCode = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    setError(false);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    try {
      const image = await generateQRCode(url, `${origin}/icons/favicon.png`);
      setQrImageUrl(image);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isOpen, url]);

  useEffect(() => {
    if (isOpen) {
      fetchQrCode();
    } else {
      setQrImageUrl(null);
      setError(false);
    }
  }, [url, isOpen, fetchQrCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = async () => {
    if (!qrImageUrl) return;
    const blob = await (await fetch(qrImageUrl)).blob();
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `${repoName}-qr.png`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleShare = async () => {
    try {
      await navigator.share({url, title: repoName});
    } catch {}
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-sm w-full p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-lg bg-github-blue/10 dark:bg-github-blue/20
                            flex items-center justify-center shrink-0"
            >
              <QrCode className="w-4 h-4 text-github-blue" />
            </div>
            <DialogTitle className="text-foreground font-semibold">Share Repository</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Scan or download the QR code for{" "}
            <span className="font-medium text-foreground font-mono text-xs">{repoName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* QR Code — always white background for scan readability */}
        <div className="px-6 pt-5 flex justify-center">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white shadow-sm">
            {loading ? (
              <div className="w-52 h-52 flex flex-col items-center justify-center gap-3">
                <QrCode className="w-10 h-10 text-gray-200 animate-pulse" />
                <p className="text-xs text-gray-400">Generating…</p>
              </div>
            ) : error ? (
              <div className="w-52 h-52 flex flex-col items-center justify-center gap-3">
                <QrCode className="w-10 h-10 text-gray-300" />
                <p className="text-xs text-gray-400">Failed to generate</p>
                <button
                  onClick={fetchQrCode}
                  className="flex items-center gap-1 text-xs text-github-blue hover:underline"
                >
                  <RefreshCw size={11} />
                  Retry
                </button>
              </div>
            ) : qrImageUrl ? (
              <Image
                src={qrImageUrl}
                alt="AI QR Code"
                className="object-contain"
                width={220}
                height={220}
              />
            ) : (
              <p className="text-gray-400">Failed to load QR</p>
            )}
          </div>
        </div>

        {/* URL chip + actions */}
        <div className="px-6 pt-4 pb-6 space-y-3">
          {/* Copyable URL */}
          <button
            onClick={handleCopy}
            title="Click to copy"
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left
                       bg-gray-50 dark:bg-gray-800/50
                       border border-gray-200 dark:border-gray-700
                       hover:border-github-blue/40 transition-colors duration-150 group"
          >
            <span className="flex-1 text-xs font-mono text-muted-foreground truncate">{url}</span>
            <span className="shrink-0 text-gray-400 group-hover:text-github-blue transition-colors">
              {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            </span>
          </button>

          {/* Action row */}
          <div className="flex gap-2">
            {canNativeShare && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 text-xs h-9"
                onClick={handleShare}
              >
                <Share2 size={13} />
                Share
              </Button>
            )}

            <Button
              size="sm"
              className="flex-1 gap-1.5 text-xs h-9 bg-github-blue hover:bg-blue-700"
              disabled={!qrImageUrl || loading}
              onClick={handleDownload}
            >
              <Download size={13} />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareQRCodeModal;
