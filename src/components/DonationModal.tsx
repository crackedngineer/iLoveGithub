"use client";

import React, {useEffect, useState} from "react";
import axios from "axios";
import {IndianRupee, Plus, Minus, Heart, Smartphone} from "lucide-react";
import {Slider} from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {DONATION_MERCHANT_NAME} from "@/constants";
import Image from "next/image";
import {cn} from "@/lib/utils";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIndiaLocation: boolean | null;
}

const PRESET_AMOUNTS = [101, 201, 501, 1001];
const MIN = 11;
const MAX = 5001;
const STEP = 10;

const DonationModal = ({isOpen, onClose, isIndiaLocation}: DonationModalProps) => {
  const [amount, setAmount] = useState(101);
  const [debouncedAmount, setDebouncedAmount] = useState(amount);
  const [qrImage, setQrImage] = useState("");
  const [loading, setLoading] = useState(false);

  const upiString = `upi://pay?pa=${process.env.NEXT_PUBLIC_DONATION_UPI_ID}&pn=${DONATION_MERCHANT_NAME}&am=${amount}&cu=INR`;

  /* debounce amount → QR regeneration */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedAmount(amount), 800);
    return () => clearTimeout(t);
  }, [amount]);

  /* generate QR on debounced amount change */
  useEffect(() => {
    if (!isIndiaLocation) return;
    const generate = async () => {
      setLoading(true);
      try {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const {data} = await axios.post("/api/qrcode/generate", {
          data: `upi://pay?pa=${process.env.NEXT_PUBLIC_DONATION_UPI_ID}&pn=${DONATION_MERCHANT_NAME}&am=${debouncedAmount}&cu=INR`,
          image: `${origin}/icons/favicon.png`,
        });
        setQrImage(data.image);
      } catch {
        /* silent — QR area will stay blank */
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [debouncedAmount, isIndiaLocation]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-sm w-full p-0 gap-0 overflow-hidden rounded-2xl">
        {/* ── Header ────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-900/20
                            flex items-center justify-center shrink-0"
            >
              <Heart className="w-4 h-4 text-github-pink fill-github-pink" />
            </div>
            <DialogTitle className="text-foreground font-semibold">
              {isIndiaLocation ? "Support via UPI" : "Support Our Work"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {isIndiaLocation
              ? "Choose an amount, scan the QR, or open in your UPI app"
              : "Your support helps us build better tools for developers"}
          </DialogDescription>
        </DialogHeader>

        {isIndiaLocation && (
          <>
            {/* ── Amount display ────────────────────────────── */}
            <div className="px-6 pt-5 flex flex-col items-center gap-1">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Amount
              </p>
              <div className="flex items-end gap-1">
                <IndianRupee className="w-5 h-5 text-foreground mb-1" strokeWidth={2.5} />
                <span className="font-display text-4xl font-bold leading-none text-foreground">
                  {amount}
                </span>
              </div>
            </div>

            {/* ── Preset pills ──────────────────────────────── */}
            <div className="px-6 pt-3 grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={cn(
                    "h-9 rounded-lg text-sm font-medium transition-all duration-150",
                    amount === preset
                      ? "bg-github-blue text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                  )}
                >
                  ₹{preset}
                </button>
              ))}
            </div>

            {/* ── Slider with stepper ───────────────────────── */}
            <div className="px-6 pt-3 flex items-center gap-3">
              <button
                onClick={() => setAmount((p) => Math.max(p - STEP, MIN))}
                disabled={amount <= MIN}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0
                           bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                           disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <Minus size={14} />
              </button>

              <Slider
                value={[amount]}
                min={MIN}
                max={MAX}
                step={STEP}
                onValueChange={([v]) => setAmount(v)}
                className="flex-1"
              />

              <button
                onClick={() => setAmount((p) => Math.min(p + STEP, MAX))}
                disabled={amount >= MAX}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0
                           bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                           disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* ── QR Code ───────────────────────────────────── */}
            <div className="px-6 pt-4 flex justify-center">
              <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                {loading ? (
                  <div className="w-[200px] h-[200px] flex flex-col items-center justify-center gap-3">
                    <IndianRupee className="w-8 h-8 text-gray-200 animate-pulse" />
                    <p className="text-xs text-gray-400">Generating…</p>
                  </div>
                ) : qrImage ? (
                  <Image
                    src={qrImage}
                    alt="UPI QR Code"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center">
                    <p className="text-xs text-gray-400">QR unavailable</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Open in UPI App ───────────────────────────── */}
            <div className="px-6 pt-4 pb-6">
              <a
                href={upiString}
                className="flex items-center justify-center gap-2 w-full h-10 rounded-xl
                           bg-github-blue hover:bg-blue-700 text-white text-sm font-medium
                           transition-colors duration-150"
              >
                <Smartphone size={15} />
                Open in UPI App
              </a>
              <p className="text-center text-[11px] text-muted-foreground mt-2">
                Works with GPay, PhonePe, Paytm &amp; more
              </p>
            </div>
          </>
        )}

        {/* Non-India fallback */}
        {!isIndiaLocation && isIndiaLocation !== null && (
          <div className="px-6 py-8 text-center">
            <Heart className="w-10 h-10 text-github-pink fill-github-pink/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Your support helps us build better tools for developers.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DonationModal;
