"use client";

import type { FormEvent } from "react";
import type {
  AuthMode,
  FormValues,
  FieldErrors,
  FieldDefinition,
} from "../../types/domain";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Field from "../ui/Field";
import { AUTH_FORMS } from "../../data/forms";
import { validateFields } from "../../lib/validators";
import { loginLocalUser, registerLocalUser } from "@/lib/local-auth";
import s from "./auth.module.css";

export default function AuthForm({
  mode,
  onSwitch,
}: {
  mode: AuthMode;
  onSwitch: (mode: AuthMode) => void;
}) {
  const router = useRouter();
  const cfg = AUTH_FORMS[mode];

  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const idOf = (name: string) => `${mode}-${name}`;

  const change = (field: FieldDefinition, raw: string) => {
    const value = field.sanitize ? field.sanitize(raw) : raw;

    const next = { ...values, [field.name]: value };

    setValues(next);
    setSubmitError("");

    if (errors[field.name]) {
      setErrors((previous) => ({
        ...previous,
        [field.name]: field.validate(value, next),
      }));
    }
  };

  const blur = (field: FieldDefinition) => {
    const value = values[field.name] ?? "";

    if (value) {
      setErrors((previous) => ({
        ...previous,
        [field.name]: field.validate(value, values),
      }));
    }
  };

  // ==============================
  // LOGIN / REGISTER
  // ==============================
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    const found = validateFields(cfg.fields, values);

    setErrors(found);
    setSubmitError("");

    const firstBad = cfg.fields.find((field) => found[field.name]);

    if (firstBad) {
      document.getElementById(idOf(firstBad.name))?.focus();
      return;
    }

    setSubmitting(true);

    try {
      let user;

      if (mode === "register") {
        // สมัครสมาชิกใหม่เป็น User เท่านั้น
        user = await registerLocalUser({
          username: values.username ?? "",
          email: values.email ?? "",
          password: values.password ?? "",
        });
      } else {
        // Login ได้ทุก Role
        user = await loginLocalUser(
          values.id ?? "",
          values.password ?? "",
          remember,
        );
      }

      // ตรวจสอบหน้าที่ต้องกลับไปหลัง Login
      const returnTo = window.sessionStorage.getItem("ticket:returnTo");

      window.sessionStorage.removeItem("ticket:returnTo");

      // ==============================
      // ROLE REDIRECT
      // ==============================

      if (
        user.role === "admin" ||
        user.role === "staff" ||
        user.role === "merchant"
      ) {
        router.replace("/admin");
      } else if (returnTo === "/shop") {
        router.replace("/shop");
      } else {
        router.replace("/");
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถดำเนินการได้ กรุณาลองอีกครั้ง",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <h2 className={s.formTitle}>{cfg.title}</h2>

      <p className={s.formSub}>{cfg.sub}</p>

      {cfg.fields.map((field) => (
        <Field
          key={field.name}
          id={idOf(field.name)}
          label={field.label}
          type={field.type}
          hint={field.hint}
          value={values[field.name] ?? ""}
          error={errors[field.name]}
          onChange={(value) => change(field, value)}
          onBlur={() => blur(field)}
          autoComplete={field.autoComplete}
          inputMode={field.inputMode}
          placeholder={field.placeholder}
        />
      ))}

      {/* Remember Me */}
      {mode === "login" && (
        <div className={s.row}>
          <label className={s.check}>
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />{" "}
            จดจำฉันไว้
          </label>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <p role="alert" className={s.termsError}>
          {submitError}
        </p>
      )}

      {/* Submit Button */}
      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? "กำลังดำเนินการ..." : cfg.submit}
      </button>

      {/* Switch Login / Register */}
      <p className={s.swap}>
        {cfg.swap.text}{" "}
        <button type="button" onClick={() => onSwitch(cfg.swap.to)}>
          {cfg.swap.label}
        </button>
      </p>
    </form>
  );
}
