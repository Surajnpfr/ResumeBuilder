"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { exportResumeToPdf, exportResumeToPng } from "@/src/lib/export";
import { mockResumeFormValues } from "@/src/data/mockResume";
import type { ResumeData, ResumeFormValues } from "@/src/types/resume";

const buildResumeData = (values: ResumeFormValues): ResumeData => {
  const skills = values.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
  const educationEntries = [
    {
      level: "High School" as const,
      degree: values.educationHighSchoolDegree.trim(),
      school: values.educationHighSchoolSchool.trim(),
      year: values.educationHighSchoolYear.trim(),
    },
    {
      level: "Undergraduate" as const,
      degree: values.educationUndergraduateDegree.trim(),
      school: values.educationUndergraduateSchool.trim(),
      year: values.educationUndergraduateYear.trim(),
    },
    {
      level: "Graduate" as const,
      degree: values.educationGraduateDegree.trim(),
      school: values.educationGraduateSchool.trim(),
      year: values.educationGraduateYear.trim(),
    },
  ].filter((entry) => entry.degree || entry.school || entry.year);

  return {
    personal: {
      fullName: values.fullName.trim(),
      title: values.title.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      location: values.location.trim(),
    },
    summary: values.summary.trim(),
    skills,
    experience: [
      {
        role: values.experienceRole.trim(),
        company: values.experienceCompany.trim(),
        startDate: values.experienceStart.trim(),
        endDate: values.experienceEnd.trim(),
        summary: values.experienceSummary.trim(),
      },
    ],
    education: educationEntries,
  };
};

const getBaseFilename = (fullName: string) => {
  const firstName = fullName.trim().split(/\s+/)[0] ?? "Resume";
  const sanitized = firstName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();

  return (sanitized || "resume") + "_Resume";
};

export default function HomeClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"edit" | "preview">("edit");
  const resumeRef = useRef<HTMLDivElement | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  const { register, watch } = useForm<ResumeFormValues>({
    defaultValues: mockResumeFormValues,
    mode: "onChange",
  });

  const formValues = watch();
  const resume = useMemo(() => buildResumeData(formValues), [formValues]);
  const baseFilename = getBaseFilename(resume.personal.fullName);

  const handleExportPdf = async () => {
    if (!resumeRef.current) {
      setExportError("Resume preview is not ready yet.");
      return;
    }
    setExportError(null);
    setIsExportingPdf(true);
    try {
      await exportResumeToPdf({
        filename: `${baseFilename}.pdf`,
        element: resumeRef.current,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "PDF export failed. Please try again.";
      setExportError(message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportPng = async () => {
    if (!resumeRef.current) {
      setExportError("Resume preview is not ready yet.");
      return;
    }
    setExportError(null);
    setIsExportingPng(true);
    try {
      await exportResumeToPng({
        filename: `${baseFilename}.png`,
        element: resumeRef.current,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "PNG export failed. Please try again.";
      setExportError(message);
    } finally {
      setIsExportingPng(false);
    }
  };

  const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-200";
  const inputClass =
    "w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-700";

  const renderResume = (ref?: React.Ref<HTMLDivElement>, isAsidedPreview = false) => (
    <div
      ref={ref}
      className={`bg-white text-black shadow-sm mx-auto ${
        isAsidedPreview ? "w-full max-w-[794px] aspect-[1/1.414]" : ""
      }`}
      style={
        !isAsidedPreview
          ? { width: "794px", minHeight: "1123px", padding: "32px" }
          : { padding: "5%" }
      }
    >
      <header className="border-b border-zinc-200 pb-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight break-words">
          {resume.personal.fullName || "Your Name"}
        </h1>
        <p className="text-sm text-zinc-600 mt-1">{resume.personal.title}</p>
        <div className="text-xs text-zinc-600 mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <span className="break-all">{resume.personal.email}</span>
          <span>{resume.personal.phone}</span>
          <span>{resume.personal.location}</span>
        </div>
      </header>

      <section className="mb-4">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Summary
        </h2>
        <p className="text-xs text-zinc-700 mt-1.5 whitespace-pre-wrap break-words">
          {resume.summary}
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Skills
        </h2>
        <ul className="mt-1.5 flex flex-wrap gap-1.5 text-xs text-zinc-700">
          {resume.skills.length === 0 ? (
            <li>—</li>
          ) : (
            resume.skills.map((skill, index) => (
              <li
                key={`${skill}-${index}`}
                className="rounded-full border border-zinc-200 px-2 py-0.5 max-w-full break-words"
              >
                {skill}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Experience
        </h2>
        {resume.experience.map((entry, index) => (
          <div key={`${entry.role}-${entry.company}-${index}`} className="mt-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
              <h3 className="text-xs font-semibold text-zinc-800 break-words">{entry.role}</h3>
              <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                {entry.startDate} {entry.startDate && entry.endDate ? "-" : ""} {entry.endDate}
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 break-words">{entry.company}</p>
            <p className="text-xs text-zinc-700 mt-1 whitespace-pre-wrap break-words">
              {entry.summary}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Education
        </h2>
        {resume.education.map((entry, index) => (
          <div key={`${entry.level}-${entry.degree}-${index}`} className="mt-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              {entry.level}
            </p>
            <h3 className="text-xs font-semibold text-zinc-800 break-words">{entry.degree}</h3>
            <div className="text-[11px] text-zinc-600 break-words">
              {entry.school} {entry.year ? `· ${entry.year}` : ""}
            </div>
          </div>
        ))}
      </section>
    </div>
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4 font-sans">
        <main className="w-full max-w-3xl rounded-lg border border-dashed border-zinc-200 bg-white/80 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
          Loading resume builder...
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-start p-3 sm:p-6 font-sans pb-24 lg:pb-6">
      <main className="relative w-full max-w-6xl bg-white dark:bg-black rounded-lg shadow-sm p-4 sm:p-6">
        
        {/* Header Block */}
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-black dark:text-zinc-50">
            ATS Resume Builder
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Fill your details, preview the formatting, and download your tracking-ready resume.
          </p>
        </div>

        {/* Mobile Filter Toggle Mechanism */}
        <div className="flex lg:hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 p-1 mb-6">
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              activeMobileTab === "edit"
                ? "bg-white text-zinc-900 shadow dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
            onClick={() => setActiveMobileTab("edit")}
          >
            1. Fill Details
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              activeMobileTab === "preview"
                ? "bg-white text-zinc-900 shadow dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
            onClick={() => setActiveMobileTab("preview")}
          >
            2. Review & Export
          </button>
        </div>

        {/* Workspace Layout Container */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          
          {/* Edit Form Content Block */}
          <section className={`space-y-6 ${activeMobileTab === "edit" ? "block" : "hidden lg:block"}`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className={labelClass} htmlFor="fullName">Full name</label>
                <input id="fullName" className={inputClass} {...register("fullName")} />
              </div>
              <div className="grid gap-1.5">
                <label className={labelClass} htmlFor="title">Role / Title</label>
                <input id="title" className={inputClass} {...register("title")} />
              </div>
              <div className="grid gap-1.5">
                <label className={labelClass} htmlFor="email">Email</label>
                <input id="email" type="email" className={inputClass} {...register("email")} />
              </div>
              <div className="grid gap-1.5">
                <label className={labelClass} htmlFor="phone">Phone</label>
                <input id="phone" className={inputClass} {...register("phone")} />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <label className={labelClass} htmlFor="location">Location</label>
                <input id="location" className={inputClass} {...register("location")} />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className={labelClass} htmlFor="summary">Professional summary</label>
              <textarea id="summary" className={`${inputClass} min-h-[96px]`} {...register("summary")} />
            </div>

            <div className="grid gap-1.5">
              <label className={labelClass} htmlFor="skills">Skills (comma separated)</label>
              <input id="skills" className={inputClass} {...register("skills")} />
            </div>

            {/* Experience Group */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Experience</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className={labelClass} htmlFor="experienceRole">Role</label>
                  <input id="experienceRole" className={inputClass} {...register("experienceRole")} />
                </div>
                <div className="grid gap-1.5">
                  <label className={labelClass} htmlFor="experienceCompany">Company</label>
                  <input id="experienceCompany" className={inputClass} {...register("experienceCompany")} />
                </div>
                <div className="grid gap-1.5">
                  <label className={labelClass} htmlFor="experienceStart">Start year</label>
                  <input id="experienceStart" className={inputClass} {...register("experienceStart")} />
                </div>
                <div className="grid gap-1.5">
                  <label className={labelClass} htmlFor="experienceEnd">End year</label>
                  <input id="experienceEnd" className={inputClass} {...register("experienceEnd")} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <label className={labelClass} htmlFor="experienceSummary">Highlights</label>
                <textarea id="experienceSummary" className={`${inputClass} min-h-[96px]`} {...register("experienceSummary")} />
              </div>
            </div>

            {/* Education Subsections */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Education</h2>
              
              {["High School", "Undergraduate", "Graduate"].map((level) => {
                const keyPrefix = `education${level.replace(/\s+/g, "")}`;
                return (
                  <div key={level} className="space-y-4 rounded-lg border border-zinc-100 p-3 sm:p-4 dark:border-zinc-800">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">{level}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-1.5 sm:col-span-2">
                        <label className={labelClass} htmlFor={`${keyPrefix}Degree`}>Degree / Program</label>
                        <input id={`${keyPrefix}Degree`} className={inputClass} {...register(`${keyPrefix}Degree` as any)} />
                      </div>
                      <div className="grid gap-1.5">
                        <label className={labelClass} htmlFor={`${keyPrefix}School`}>School / University</label>
                        <input id={`${keyPrefix}School`} className={inputClass} {...register(`${keyPrefix}School` as any)} />
                      </div>
                      <div className="grid gap-1.5">
                        <label className={labelClass} htmlFor={`${keyPrefix}Year`}>Graduation year</label>
                        <input id={`${keyPrefix}Year`} className={inputClass} {...register(`${keyPrefix}Year` as any)} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Form Navigation Button */}
            <div className="block lg:hidden pt-2">
              <button
                type="button"
                onClick={() => setActiveMobileTab("preview")}
                className="w-full inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow dark:bg-zinc-100 dark:text-zinc-950"
              >
                Review & Export Template →
              </button>
            </div>
          </section>

          {/* Review & Export Sheet Block */}
          <section className={`space-y-4 ${activeMobileTab === "preview" ? "block" : "hidden lg:block"} lg:sticky lg:top-6 h-fit`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-black/90 dark:text-zinc-50">Live Preview</h2>
              <span className="text-xs text-zinc-500 hidden sm:inline">A4 Document Layout</span>
            </div>

            {/* Core Export Actions Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap bg-zinc-100 dark:bg-zinc-900 p-3 rounded-xl lg:bg-transparent lg:p-0 lg:rounded-none">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="inline-flex flex-1 sm:flex-initial items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {isExportingPdf ? "Exporting PDF..." : "Download PDF File"}
              </button>
              <button
                type="button"
                onClick={handleExportPng}
                disabled={isExportingPng}
                className="inline-flex flex-1 sm:flex-initial items-center justify-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 bg-white transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                {isExportingPng ? "Exporting PNG..." : "Download PNG Image"}
              </button>
            </div>

            {exportError && (
              <p className="text-sm text-red-600 dark:text-red-400 px-1">{exportError}</p>
            )}

            <div className="border rounded-xl bg-zinc-50 dark:bg-zinc-900 p-2 sm:p-4">
              <div className="w-full bg-white dark:bg-zinc-950 rounded-lg shadow-sm overflow-hidden">
                {renderResume(undefined, true)}
              </div>
            </div>

            {/* Mobile Return Navigation Button */}
            <div className="block lg:hidden pt-2">
              <button
                type="button"
                onClick={() => setActiveMobileTab("edit")}
                className="w-full inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              >
                ← Back to Edit Details
              </button>
            </div>
          </section>

        </div>

        {/* Hidden high-fidelity pixel canvas container for accurate native system print engine targeting */}
        <div className="absolute -left-[99999px] top-0 opacity-0 pointer-events-none" aria-hidden="true">
          {renderResume(resumeRef, false)}
        </div>
      </main>
    </div>
  );
}