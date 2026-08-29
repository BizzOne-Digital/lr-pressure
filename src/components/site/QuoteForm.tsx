"use client";

import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle2, AlertCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface QuoteFormProps {
  services: { name: string; slug: string }[];
  successMessage: string;
}

type Status = "idle" | "submitting" | "success" | "error";

export function QuoteForm({ services, successMessage }: QuoteFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function validateClientSide(form: HTMLFormElement): string | null {
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value.trim();
    const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value.trim();

    if (!name || name.length < 2) return "Please enter your full name.";
    if (!phone || phone.length < 7) return "Please enter a valid phone number.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }
    return null;
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("Image must be smaller than 8MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const form = e.currentTarget;
    const clientError = validateClientSide(form);
    if (clientError) {
      setErrorMessage(clientError);
      return;
    }

    setStatus("submitting");

    try {
      const formData = new FormData(form);
      if (imageFile) formData.set("image", imageFile);

      const res = await fetch("/api/leads", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.details?.fieldErrors) {
          setFieldErrors(json.details.fieldErrors);
        }
        setErrorMessage(json.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
      removeImage();
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center rounded-lg border border-green-200 bg-green-50 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
        <h3 className="mt-4 font-heading text-xl font-bold text-brand-black">Request Received</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-brand-gray-600">
          {successMessage}
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setStatus("idle")}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Honeypot — hidden from sighted users; bots that auto-fill every field trip it. */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input type="text" id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" name="name" required errors={fieldErrors.name} autoComplete="name" />
        <Field
          label="Phone Number"
          name="phone"
          type="tel"
          required
          errors={fieldErrors.phone}
          autoComplete="tel"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Email Address"
          name="email"
          type="email"
          required
          errors={fieldErrors.email}
          autoComplete="email"
        />
        <Field label="Property Address" name="address" errors={fieldErrors.address} autoComplete="street-address" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="serviceNeeded" className="mb-1.5 block text-sm font-semibold text-brand-black">
            Service Needed
          </label>
          <select
            id="serviceNeeded"
            name="serviceNeeded"
            className="w-full rounded-md border border-brand-gray-200 bg-white px-4 py-3 text-sm text-brand-black focus:border-brand-red focus:outline-none"
          >
            <option value="">Select a service (optional)</option>
            {services.map((s) => (
              <option key={s.slug} value={s.name}>
                {s.name}
              </option>
            ))}
            <option value="Not sure / Other">Not sure / Other</option>
          </select>
        </div>
        <Field
          label="Preferred Date"
          name="preferredDate"
          type="date"
          errors={fieldErrors.preferredDate}
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-brand-black">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Tell us a bit about your project..."
          className="w-full rounded-md border border-brand-gray-200 bg-white px-4 py-3 text-sm text-brand-black placeholder:text-brand-gray-400 focus:border-brand-red focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brand-black">
          Photo (optional)
        </label>
        {imagePreview ? (
          <div className="relative w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Upload preview"
              className="h-28 w-28 rounded-md object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              aria-label="Remove image"
              className="absolute -right-2 -top-2 rounded-full bg-brand-black p-1 text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-brand-gray-200 px-4 py-3 text-sm font-semibold text-brand-gray-600 hover:border-brand-red hover:text-brand-red">
            <Upload className="h-4 w-4" />
            Add a photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFile}
            />
          </label>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-md bg-red-50 p-4 text-sm text-red-700" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="w-full justify-center sm:w-auto"
        icon={status === "submitting" ? <Loader2 className="h-5 w-5 animate-spin" /> : undefined}
      >
        {status === "submitting" ? "Submitting..." : "Request a Free Quote"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  errors,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  errors?: string[];
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-brand-black">
        {label} {required && <span className="text-brand-red">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={errors ? true : undefined}
        aria-describedby={errors ? `${name}-error` : undefined}
        className="w-full rounded-md border border-brand-gray-200 bg-white px-4 py-3 text-sm text-brand-black placeholder:text-brand-gray-400 focus:border-brand-red focus:outline-none"
      />
      {errors && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {errors[0]}
        </p>
      )}
    </div>
  );
}
