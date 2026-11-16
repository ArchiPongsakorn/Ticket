"use client";

import { useState, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from "react";
import type { ActivityLog, AddLog, Attendee } from "./types";

type TopUpTokenSectionProps = {
  attendees: Attendee[];
  setAttendees: Dispatch<SetStateAction<Attendee[]>>;
  addLog: AddLog;
  logs: ActivityLog[];
};

export default function TopUpTokenSection({ attendees, setAttendees, addLog, logs }: TopUpTokenSectionProps) {
  const [qrInput, setQrInput] = useState("TKT-001");
  const [amount, setAmount] = useState<number | string>(100);
  const presetAmounts = [50, 100, 200, 500];
  const selectedAttendee = attendees.find(
    (attendee) => attendee.id === qrInput.trim().toUpperCase()
  );
  const topUpLogs = logs.filter((log) => log.message.includes("เติม ")).slice(0, 5);

  const handleTopUp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = attendees.find((attendee) => attendee.id === qrInput.trim().toUpperCase());
    if (!target) {
      addLog(`ไม่พบรหัส QR: ${qrInput}`, "error");
      return;
    }
    const numericAmount = Number(amount);
    if (numericAmount <= 0) return;

    setAttendees((previous) =>
      previous.map((attendee) => attendee.id === target.id
        ? { ...attendee, tokens: attendee.tokens + numericAmount }
        : attendee
      )
    );
    addLog(`เติม ${numericAmount} Token ให้ ${target.name} (${target.id}) สำเร็จ`);
  };

  return (
    <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
      <header className="xl:col-span-2">
        <h2 className="text-2xl font-bold">เติม Token</h2>
        <p className="mt-1 text-sm text-[#8fa6c2]">เฉพาะ Admin และ Staff ที่ได้รับสิทธิ์เติม Token ให้ผู้เข้าร่วมงาน</p>
      </header>

      <section className="rounded-2xl border border-[#244466] bg-[#10233d] p-5 sm:p-6">
        <form onSubmit={handleTopUp} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">ค้นหาผู้ร่วมงาน</label>
            <input
              type="text"
              value={qrInput}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setQrInput(event.target.value)}
              placeholder="ชื่อ อีเมล หรือรหัส QR"
              className="w-full rounded-xl border border-[#244466] bg-[#0a1628] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#7188a5] focus:border-[#49a5fb]"
              list="topup-attendee-list"
            />
            <datalist id="topup-attendee-list">
              {attendees.map((attendee) => (
                <option key={attendee.id} value={attendee.id}>{attendee.name}</option>
              ))}
            </datalist>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-[#0a1628] p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#19395e] text-xs font-bold text-[#49a5fb]">
              {selectedAttendee?.name.slice(0, 1) ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{selectedAttendee?.name ?? "ยังไม่พบผู้เข้าร่วม"}</p>
              <p className="text-xs text-[#8fa6c2]">{selectedAttendee ? `Token คงเหลือ ${selectedAttendee.tokens}` : "กรอกรหัสบัตรเพื่อค้นหา"}</p>
            </div>
            {selectedAttendee && <span className="rounded-lg bg-[#19395e] px-2.5 py-1 text-sm font-bold text-[#49a5fb]">{selectedAttendee.tokens}</span>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">จำนวน Token ที่เติม</label>
            <div className="mb-3 grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                    Number(amount) === preset
                      ? "border-[#49a5fb] bg-[#19395e] text-white"
                      : "border-[#244466] bg-[#0a1628] text-[#d6e0ed] hover:border-[#49a5fb]"
                  }`}
                >
                  +{preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setAmount(event.target.value)}
              placeholder="จำนวน Token"
              className="w-full rounded-xl border border-[#244466] bg-[#0a1628] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#7188a5] focus:border-[#49a5fb]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!selectedAttendee || Number(amount) <= 0}
            className="w-full rounded-xl bg-[#49a5fb] py-3 text-sm font-bold text-[#071426] transition hover:bg-[#368fdf] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ยืนยันการเติม Token
          </button>
        </form>
      </section>

      <section className="h-fit rounded-2xl border border-[#244466] bg-[#10233d] p-5 sm:p-6">
        <h3 className="mb-4 text-base font-semibold text-white">รายการเติมล่าสุด</h3>
        <div className="divide-y divide-[#244466]">
          {topUpLogs.length === 0 ? (
            <p className="py-4 text-sm text-[#8fa6c2]">ยังไม่มีรายการเติม Token</p>
          ) : topUpLogs.map((log) => {
            const amountMatch = log.message.match(/เติม (\d+) Token/);
            return (
              <div key={log.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#d6e0ed]">{log.message.replace(/^เติม \d+ Token ให้ /, "")}</p>
                  <p className="mt-1 text-xs text-[#7188a5]">Token Staff · {log.time}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-[#63e6ae]">+{amountMatch?.[1] ?? 0}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
