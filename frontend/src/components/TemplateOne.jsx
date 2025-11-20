import React, { useEffect, useRef, useState } from "react";
import { LuMail, LuPhone, LuGithub, LuGlobe } from "react-icons/lu";
import { RiLinkedinLine } from "react-icons/ri";
import {
  EducationInfo,
  WorkExperience,
  ProjectInfo,
  CertificationInfo,
} from "./ResumeSection";
import { formatYearMonth } from "../utils/helper";

const Title = ({ text }) => (
  <div className="relative w-fit mb-2 resume-section-title">
    <h2 className="relative text-base font-bold uppercase tracking-wide pb-2">
      {text}
    </h2>
    <div className="w-full h-[2px] mt-1 bg-black" />
  </div>
);

const TemplateOne = ({ resumeData = {}, containerWidth }) => {
  const {
    profileInfo = {},
    contactInfo = {},
    education = [],
    languages = [],
    workExperience = [],
    projects = [],
    skills = [],
    certifications = [],
    interests = [],
  } = resumeData;

  const resumeRef = useRef(null);
  const [baseWidth, setBaseWidth] = useState(800);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (resumeRef.current && containerWidth > 0) {
      const actualWidth = resumeRef.current.offsetWidth;
      setBaseWidth(actualWidth);
      setScale(containerWidth / actualWidth);
    }
  }, [containerWidth]);

  return (
    <div
      ref={resumeRef}
      className="p-6 bg-white font-sans text-gray-800"
      style={{
        transform: containerWidth > 0 ? `scale(${scale})` : undefined,
        transformOrigin: "top left",
        width: containerWidth > 0 ? `${baseWidth}px` : undefined,
      }}
    >

      {/* HEADER */}
      <div className="resume-section flex justify-between items-start mb-6">

        {/* LEFT SIDE */}
        <div>
          <h1 className="text-3xl font-bold pb-2">{profileInfo.fullName}</h1>
          <p className="text-lg font-medium pb-2">{profileInfo.designation}</p>

          {/* CONTACT ROW — FIXED & INLINE */}
          <div className="flex flex-row flex-wrap gap-4 text-sm">
            {contactInfo.email && (
              <div className="pdf-inline">
                <LuMail className="icon" />
                <span>{contactInfo.email}</span>
              </div>
            )}

            {contactInfo.phone && (
              <div className="pdf-inline">
                <LuPhone className="icon" />
                <span>{contactInfo.phone}</span>
              </div>
            )}

            {contactInfo.location && (
              <div className="pdf-inline">
                <span>{contactInfo.location}</span>
              </div>
            )}

            {contactInfo.custom && (
              <div className="pdf-inline">
                <span>{contactInfo.custom}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE — FULLY FIXED VERSION */}
        <div className="text-sm text-right space-y-1">
          {contactInfo.linkedin && (
            <div className="pdf-inline !justify-end">
              <RiLinkedinLine className="icon" />
              <span>LinkedIn</span>
            </div>
          )}

          {contactInfo.github && (
            <div className="pdf-inline !justify-end">
              <LuGithub className="icon" />
              <span>GitHub</span>
            </div>
          )}

          {contactInfo.website && (
            <div className="pdf-inline !justify-end">
              <LuGlobe className="icon" />
              <span>Portfolio</span>
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY */}
      {profileInfo.summary && (
        <div className="resume-section mb-3">
          <Title text="Professional Summary" />
          <p className="text-sm leading-relaxed">{profileInfo.summary}</p>
        </div>
      )}

      {/* 2 COLUMN LAYOUT */}
      <div className="grid grid-cols-3 gap-8">

        {/* LEFT COLUMN */}
        <div className="col-span-2 space-y-4">

          {/* WORK EXPERIENCE */}
          {workExperience.length > 0 && (
            <div className="resume-section">
              <Title text="Work Experience" />
              <div className="space-y-6">
                {workExperience.map((exp, i) => (
                  <WorkExperience
                    key={i}
                    company={exp.company}
                    role={exp.role}
                    duration={`${formatYearMonth(exp.startDate)} - ${formatYearMonth(exp.endDate)}`}
                    description={exp.description}
                  />
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {projects.length > 0 && (
            <div className="resume-section">
              <Title text="Projects" />
              <div className="space-y-4">
                {projects.map((proj, i) => (
                  <ProjectInfo
                    key={i}
                    title={proj.title}
                    description={proj.description}
                    githubLink={proj.github}
                    liveDemoUrl={proj.liveDemo}
                    headingClass="pb-2"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-1 space-y-6">

          {/* SKILLS */}
          {skills.length > 0 && (
            <div className="resume-section">
              <Title text="Skills" />
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span key={i} className="text-xs font-medium px-2 py-1 rounded">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* EDUCATION */}
          {education.length > 0 && (
            <div className="resume-section">
              <Title text="Education" />
              <div className="space-y-4 pb-2">
                {education.map((edu, i) => (
                  <EducationInfo
                    key={i}
                    degree={edu.degree}
                    institution={edu.institution}
                    duration={`${formatYearMonth(edu.startDate)} - ${formatYearMonth(edu.endDate)}`}
                  />
                ))}
                <br />
              </div>
            </div>
          )}

          {/* CERTIFICATIONS */}
          {certifications.length > 0 && (
            <div className="resume-section">
              <Title text="Certifications" />
              <div className="space-y-2">
                {certifications.map((cert, i) => (
                  <CertificationInfo
                    key={i}
                    title={cert.title}
                    issuer={cert.issuer}
                    year={cert.year}
                  />
                ))}
              </div>
            </div>
          )}

          {/* LANGUAGES */}
          {languages.length > 0 && (
            <div className="resume-section">
              <Title text="Languages" />
              <div className="flex flex-wrap gap-2">
                {languages.map((lang, i) => (
                  <span key={i} className="text-xs font-medium px-2 py-1 rounded">
                    {lang.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* INTERESTS */}
          {interests.length > 0 && interests.some((i) => i) && (
            <div className="resume-section">
              <Title text="Interests" />
              <div className="flex flex-wrap gap-2">
                {interests.map((int, i) =>
                  int ? (
                    <span key={i} className="text-xs font-medium px-2 py-1 rounded">
                      {int}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TemplateOne;
