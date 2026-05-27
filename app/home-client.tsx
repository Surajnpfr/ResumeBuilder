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
  const renderResume = (ref?: React.Ref<HTMLDivElement>) => (
    <div
      ref={ref}
      className="mx-auto bg-white text-black shadow-sm"
      style={{ width: "794px", minHeight: "1123px", padding: "32px" }}
    >
      <header className="border-b border-zinc-200 pb-4 mb-4">
        <h1 className="text-3xl font-semibold tracking-tight">{resume.personal.fullName}</h1>
        <p className="text-sm text-zinc-600 mt-1">{resume.personal.title}</p>
        <div className="text-xs text-zinc-600 mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <span>{resume.personal.email}</span>
          <span>{resume.personal.phone}</span>
          <span>{resume.personal.location}</span>
        </div>
      </header>

      <section className="mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Summary
        </h2>
        <p className="text-sm text-zinc-700 mt-2">{resume.summary}</p>
      </section>

      <section className="mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Skills
        </h2>
        <ul className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-700">
          {resume.skills.length === 0 ? (
            <li>—</li>
          ) : (
            resume.skills.map((skill) => (
              <li key={skill} className="rounded-full border border-zinc-200 px-3 py-1">
                {skill}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Experience
        </h2>
        {resume.experience.map((entry) => (
          <div key={`${entry.role}-${entry.company}`} className="mt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-800">{entry.role}</h3>
              <span className="text-xs text-zinc-500">
                {entry.startDate} - {entry.endDate}
              </span>
            </div>
            <p className="text-xs text-zinc-600">{entry.company}</p>
            <p className="text-sm text-zinc-700 mt-2">{entry.summary}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Education
        </h2>
        {resume.education.map((entry) => (
          <div key={`${entry.level}-${entry.degree}-${entry.school}`} className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              {entry.level}
            </p>
            <h3 className="text-sm font-semibold text-zinc-800">{entry.degree}</h3>
            <div className="text-xs text-zinc-600">
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
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-6 font-sans">
        <main className="w-full max-w-3xl rounded-lg border border-dashed border-zinc-200 bg-white/80 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
          Loading resume builder...
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-start sm:items-center justify-center p-4 sm:p-6 font-sans">
      <main className="relative w-full max-w-6xl bg-white dark:bg-black rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            ATS Resume Builder
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Fill the form to generate a clean resume and export it as PDF or PNG.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className={labelClass} htmlFor="fullName">
                  Full name
                </label>
                <input id="fullName" className={inputClass} {...register("fullName")} />
              </div>
              <div className="grid gap-2">
                <label className={labelClass} htmlFor="title">
                  Role / Title
                </label>
                <input id="title" className={inputClass} {...register("title")} />
              </div>
              <div className="grid gap-2">
                <label className={labelClass} htmlFor="email">
                  Email
                </label>
                <input id="email" className={inputClass} {...register("email")} />
              </div>
              <div className="grid gap-2">
                <label className={labelClass} htmlFor="phone">
                  Phone
                </label>
                <input id="phone" className={inputClass} {...register("phone")} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <label className={labelClass} htmlFor="location">
                  Location
                </label>
                <input id="location" className={inputClass} {...register("location")} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className={labelClass} htmlFor="summary">
                Professional summary
              </label>
              <textarea
                id="summary"
                className={`${inputClass} min-h-[96px]`}
                {...register("summary")}
              />
            </div>

            <div className="grid gap-2">
              <label className={labelClass} htmlFor="skills">
                Skills (comma separated)
              </label>
              <input id="skills" className={inputClass} {...register("skills")} />
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                Experience
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className={labelClass} htmlFor="experienceRole">
                    Role
                  </label>
                  <input
                    id="experienceRole"
                    className={inputClass}
                    {...register("experienceRole")}
                  />
                </div>
                <div className="grid gap-2">
                  <label className={labelClass} htmlFor="experienceCompany">
                    Company
                  </label>
                  <input
                    id="experienceCompany"
                    className={inputClass}
                    {...register("experienceCompany")}
                  />
                </div>
                <div className="grid gap-2">
                  <label className={labelClass} htmlFor="experienceStart">
                    Start year
                  </label>
                  <input
                    id="experienceStart"
                    className={inputClass}
                    {...register("experienceStart")}
                  />
                </div>
                <div className="grid gap-2">
                  <label className={labelClass} htmlFor="experienceEnd">
                    End year
                  </label>
                  <input
                    id="experienceEnd"
                    className={inputClass}
                    {...register("experienceEnd")}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className={labelClass} htmlFor="experienceSummary">
                  Highlights
                </label>
                <textarea
                  id="experienceSummary"
                  className={`${inputClass} min-h-[96px]`}
                  {...register("experienceSummary")}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                Education
              </h2>
              <div className="space-y-4 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    High School
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2 md:col-span-2">
                    <label className={labelClass} htmlFor="educationHighSchoolDegree">
                      Degree / Program
                    </label>
                    <input
                      id="educationHighSchoolDegree"
                      className={inputClass}
                      {...register("educationHighSchoolDegree")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className={labelClass} htmlFor="educationHighSchoolSchool">
                      School
                    </label>
                    <input
                      id="educationHighSchoolSchool"
                      className={inputClass}
                      {...register("educationHighSchoolSchool")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className={labelClass} htmlFor="educationHighSchoolYear">
                      Graduation year
                    </label>
                    <input
                      id="educationHighSchoolYear"
                      className={inputClass}
                      {...register("educationHighSchoolYear")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    Undergraduate
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2 md:col-span-2">
                    <label className={labelClass} htmlFor="educationUndergraduateDegree">
                      Degree / Program
                    </label>
                    <input
                      id="educationUndergraduateDegree"
                      className={inputClass}
                      {...register("educationUndergraduateDegree")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className={labelClass} htmlFor="educationUndergraduateSchool">
                      College / University
                    </label>
                    <input
                      id="educationUndergraduateSchool"
                      className={inputClass}
                      {...register("educationUndergraduateSchool")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className={labelClass} htmlFor="educationUndergraduateYear">
                      Graduation year
                    </label>
                    <input
                      id="educationUndergraduateYear"
                      className={inputClass}
                      {...register("educationUndergraduateYear")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    Graduate
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2 md:col-span-2">
                    <label className={labelClass} htmlFor="educationGraduateDegree">
                      Degree / Program
                    </label>
                    <input
                      id="educationGraduateDegree"
                      className={inputClass}
                      {...register("educationGraduateDegree")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className={labelClass} htmlFor="educationGraduateSchool">
                      College / University
                    </label>
                    <input
                      id="educationGraduateSchool"
                      className={inputClass}
                      {...register("educationGraduateSchool")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className={labelClass} htmlFor="educationGraduateYear">
                      Graduation year
                    </label>
                    <input
                      id="educationGraduateYear"
                      className={inputClass}
                      {...register("educationGraduateYear")}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
              >
                {isExportingPdf ? "Exporting PDF..." : "Export PDF"}
              </button>
              <button
                type="button"
                onClick={handleExportPng}
                disabled={isExportingPng}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                {isExportingPng ? "Exporting PNG..." : "Export PNG"}
              </button>
            </div>

            {exportError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{exportError}</p>
            ) : null}
          </section>

          <aside className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-black/90 dark:text-zinc-50">
                Live Preview
              </h2>
              <span className="text-xs text-zinc-500">A4-ready layout</span>
            </div>
            <div className="border rounded-xl bg-zinc-50 dark:bg-zinc-900 p-3">
              <div className="overflow-auto rounded-lg bg-white/60 dark:bg-zinc-950/40 p-2">
                <div className="min-w-[794px] w-[794px] origin-top-left scale-[0.85] sm:scale-100">
                  {renderResume()}
                </div>
              </div>
            </div>
          </aside>
        </div>
        <div className="absolute -left-[99999px] top-0 opacity-0 pointer-events-none">
          {renderResume(resumeRef)}
        </div>
      </main>
    </div>
  );
}
