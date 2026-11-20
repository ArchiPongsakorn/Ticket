"use client";

import { useEffect, useRef, useState, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from "react";
import type { AddLog, Attendee } from "./types";
import { BrowserQRCodeReader } from "@zxing/browser";
import { usePersistentState } from "@/hooks/usePersistentState";

type CheckInScanSectionProps = {
  attendees: Attendee[];
  setAttendees: Dispatch<SetStateAction<Attendee[]>>;
  addLog: AddLog;
};

type ScanResult = {
  id: number;
  time: string;
  status: "success" | "warning" | "error";
  message: string;
};

export default function CheckInScanSection({ attendees, setAttendees, addLog }: CheckInScanSectionProps) {
  const [scanCode, setScanCode] = useState("");
  const profileTickets = attendees.filter((attendee) => attendee.active === true);
  const [scanResults, setScanResults] = usePersistentState<ScanResult[]>("admin-check-in-scan-results", []);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastScanRef = useRef("");

  useEffect(() => {
    let active = true;
    let controls: { stop: () => void } | undefined;
    const reader = new BrowserQRCodeReader();
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access requires HTTPS or localhost.");
        const video = videoRef.current;
        if (!video) return;
        controls = await reader.decodeFromVideoDevice(undefined, video, (result, _error, scannerControls) => {
          controls = scannerControls;
          if (!active || !result) return;
          const value = result.getText().trim();
          if (!value || value === lastScanRef.current) return;
          lastScanRef.current = value;
          setScanCode(value);
          window.requestAnimationFrame(() => video.closest("section")?.querySelector("form")?.requestSubmit());
          window.setTimeout(() => { lastScanRef.current = ""; }, 1800);
        });
        if (!active) controls?.stop();
      } catch (error) {
        if (active) setCameraError(error instanceof Error ? error.message : "Unable to start camera.");
      }
    };
    setCameraError("");
    void startCamera();
    return () => { active = false; controls?.stop(); };
  }, []);

  const recordResult = (result: Omit<ScanResult, "id" | "time">) => {
    setScanResults((previous) => [
      { ...result, id: Date.now(), time: new Date().toLocaleTimeString("th-TH") },
      ...previous,
    ].slice(0, 3));
  };

  const handleScan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = scanCode.trim().toUpperCase();
    if (!code) return;

    const person = attendees.find((attendee) => attendee.id === code);
    if (!person) {
      recordResult({ status: "error", message: `ไม่พบบัตรรหัส ${code}` });
      addLog(`สแกนเข้างานล้มเหลว: ไม่พบรหัส ${code}`, "error", "สแกน QR เข้างาน");
      setScanCode("");
      return;
    }

    if (person.active !== true) {
      recordResult({ status: "warning", message: `บัตรของ ${person.name} ยังไม่ได้รับอนุมัติการชำระเงิน` });
      addLog(`ปฏิเสธการเข้างาน: ${person.name} ยังไม่ชำระเงิน`, "error", "สแกน QR เข้างาน");
      setScanCode("");
      return;
    }

    if (person.checkedIn) {
      recordResult({
        status: "warning",
        message: `บัตรของ ${person.name} (${person.id}) ถูกใช้งานเข้างานไปแล้ว!`,
      });
      addLog(`แจ้งเตือน: ${person.name} สแกนซ้ำ`, "error", "สแกน QR เข้างาน");
      setScanCode("");
      return;
    }

    setAttendees((previous) => previous.map((attendee) =>
      attendee.id === code ? { ...attendee, checkedIn: true } : attendee
    ));
    recordResult({
      status: "success",
      message: `เช็กอินสำเร็จ! ยินดีต้อนรับคุณ ${person.name} (ประเภท: ${person.type})`,
    });
    addLog(`เช็กอินเข้างาน: ${person.name} (${person.id})`, "info", "สแกน QR เข้างาน");
    setScanCode("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col text-white">
      <header className="mb-4 shrink-0">
        <h2 className="text-2xl font-bold">สแกนบัตรเข้างาน</h2>
        <p className="mt-1 text-sm text-[#8fa6c2]">สแกน QR จากหน้า Profile สมาชิกเพื่อตรวจสอบสถานะและบันทึกการเข้างาน</p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
        <section className="flex min-h-0 flex-col rounded-2xl border border-[#244466] bg-[#10233d] p-4 sm:p-5">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-[#244466] bg-[#0a1628] p-4">
            <video ref={videoRef} className="max-h-full w-full rounded-lg object-cover" playsInline muted aria-label="ภาพจากกล้องสำหรับสแกน QR" />
            <p className="mt-3 text-center text-xs text-[#8fa6c2]">เล็งกล้องไปที่ QR Code บัตรเข้างาน</p>
            {cameraError && <p role="alert" className="mt-2 text-center text-sm text-[#f4a3b0]">{cameraError}</p>}
          </div>
          <form onSubmit={handleScan} className="mt-3 flex shrink-0 flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={scanCode}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setScanCode(event.target.value)}
              list="profile-event-ticket-codes"
              placeholder="ยิงหรือกรอกรหัสบัตร เช่น TKT-001"
              className="min-w-0 flex-1 rounded-lg border border-[#244466] bg-[#0a1628] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#7188a5] focus:border-[#49a5fb]"
            />
            <datalist id="profile-event-ticket-codes">
              {profileTickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id} label={ticket.name} />
              ))}
            </datalist>
            <button
              type="submit"
              className="rounded-lg bg-[#49a5fb] px-5 py-2.5 text-sm font-bold text-[#071426] transition hover:bg-[#368fdf]"
            >
              ตรวจสอบบัตร
            </button>
          </form>
        </section>

        <section className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          {scanResults.length === 0 ? (
            <div className="flex min-h-28 items-center rounded-2xl border border-[#244466] bg-[#10233d] p-5 text-sm text-[#8fa6c2]">
              รอผลการสแกนบัตร
            </div>
          ) : (
            scanResults.map((result) => {
              const success = result.status === "success";
              const warning = result.status === "warning";
              return (
                <div
                  key={result.id}
                  className={`rounded-2xl border p-4 ${
                    success
                      ? "border-[#176848] bg-[#0d3028] text-[#8be9c0]"
                      : "border-[#6b2b36] bg-[#351a27] text-[#f4a3b0]"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span aria-hidden="true">{success ? "✓" : "×"}</span>
                    {success ? "ผ่าน" : warning ? "บัตรถูกใช้แล้ว" : "ไม่พบบัตร"}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">{result.message}</p>
                  <p className="mt-2 text-xs text-[#8fa6c2]">ตรวจสอบเมื่อ {result.time}</p>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
