"use client";

import { useState, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from "react";
import MockQrCode from "./mock-qr-code";
import type { AddLog, Attendee } from "./types";

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
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);

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
      addLog(`สแกนเข้างานล้มเหลว: ไม่พบรหัส ${code}`, "error");
      setScanCode("");
      return;
    }

    if (person.checkedIn) {
      recordResult({
        status: "warning",
        message: `บัตรของ ${person.name} (${person.id}) ถูกใช้งานเข้างานไปแล้ว!`,
      });
      addLog(`แจ้งเตือน: ${person.name} สแกนซ้ำ`, "error");
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
    addLog(`เช็กอินเข้างาน: ${person.name} (${person.id})`);
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
            <MockQrCode />
            <p className="mt-3 text-center text-xs text-[#8fa6c2]">QR ตัวอย่าง · เครื่องสแกนบัตรพร้อมใช้งาน</p>
          </div>
          <form onSubmit={handleScan} className="mt-3 flex shrink-0 flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={scanCode}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setScanCode(event.target.value)}
              placeholder="ยิงหรือกรอกรหัสบัตร เช่น TKT-001"
              className="min-w-0 flex-1 rounded-lg border border-[#244466] bg-[#0a1628] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#7188a5] focus:border-[#49a5fb]"
            />
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
