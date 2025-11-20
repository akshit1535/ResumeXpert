import React, { useCallback } from 'react'
import DashboardLayout from './DashboardLayout'
import { TitleInput } from './Inputs'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { buttonStyles, containerStyles, iconStyles, statusStyles } from '../assets/dummySTyle'
import { AlertCircle, ArrowLeft, Check, Loader, Loader2, Palette, Save } from 'lucide-react'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast';
import { Download } from 'lucide-react'
import { fixTailwindColors} from '../utils/color'
import axiosInstance from '../utils/axiosInstance'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import StepProgress from './StepProgress'
import {
  ProfileInfoForm,
  ContactInfoForm,
  WorkExperienceForm,
  EducationDetailsForm,
  SkillsInfoForm,
  ProjectDetailForm,
  CertificationInfoForm,
  AdditionalInfoForm
} from './Forms'
import RenderResume from './RenderResume'
import ThemeSelector from './ThemeSelector'
import Modal from './Modal'

const useResizeObserver = () =>{
  const [size, setSize] = useState({width: 0, height: 0});
  const ref = useCallback((node)=>{
    if(node){
      const resizeObserver = new ResizeObserver((entries) => {
        const {width, height} = entries[0].contentRect;
        setSize({width, height});
      })
      resizeObserver.observe(node);
    }
  }, [])
  return {...size, ref};
}

// Helper function to convert data URL to File
const dataURLtoFile = (dataurl, filename) => {
  if (!dataurl || typeof dataurl !== 'string') {
    throw new Error('Invalid data URL');
  }
  
  const arr = dataurl.split(',');
  if (arr.length < 2) {
    throw new Error('Invalid data URL format');
  }
  
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch || !mimeMatch[1]) {
    throw new Error('Could not extract MIME type from data URL');
  }
  
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};


function EditResume() {

   const { resumeId } = useParams()
  const navigate = useNavigate()
  const resumeDownloadRef = useRef(null)
  const thumbnailRef = useRef(null)

  const [openThemeSelector, setOpenThemeSelector] = useState(false)
  const [openPreviewModal, setOpenPreviewModal] = useState(false)
  const [currentPage, setCurrentPage] = useState("profile-info")
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [completionPercentage, setCompletionPercentage] = useState(0)

  const { width: previewWidth, ref: previewContainerRef } = useResizeObserver();

  const [resumeData, setResumeData] = useState({
    title: "Professional Resume",
    thumbnailLink: "",
    profileInfo: {
      fullName: "",
      designation: "",
      summary: "",
    },
    template: {
      theme: "modern",
      colorPalette: []
    },
    contactInfo: {
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
    },
    workExperience: [
      {
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ],
    education: [
      {
        degree: "",
        institution: "",
        startDate: "",
        endDate: "",
      },
    ],
    skills: [
      {
        name: "",
        progress: 0,
      },
    ],
    projects: [
      {
        title: "",
        description: "",
        github: "",
        liveDemo: "",
      },
    ],
    certifications: [
      {
        title: "",
        issuer: "",
        year: "",
      },
    ],
    languages: [
      {
        name: "",
        progress: 0,
      },
    ],
    interests: [""],
  })

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completedFields = 0;
    let totalFields = 0;

    // Profile Info
    totalFields += 3;
    if (resumeData.profileInfo.fullName) completedFields++;
    if (resumeData.profileInfo.designation) completedFields++;
    if (resumeData.profileInfo.summary) completedFields++;

    // Contact Info
    totalFields += 2;
    if (resumeData.contactInfo.email) completedFields++;
    if (resumeData.contactInfo.phone) completedFields++;

    // Work Experience
    resumeData.workExperience.forEach(exp => {
      totalFields += 5;
      if (exp.company) completedFields++;
      if (exp.role) completedFields++;
      if (exp.startDate) completedFields++;
      if (exp.endDate) completedFields++;
      if (exp.description) completedFields++;
    });

    // Education
    resumeData.education.forEach(edu => {
      totalFields += 4;
      if (edu.degree) completedFields++;
      if (edu.institution) completedFields++;
      if (edu.startDate) completedFields++;
      if (edu.endDate) completedFields++;
    });

    // Skills
    resumeData.skills.forEach(skill => {
      totalFields += 2;
      if (skill.name) completedFields++;
      if (skill.progress > 0) completedFields++;
    });

    // Projects
    resumeData.projects.forEach(project => {
      totalFields += 4;
      if (project.title) completedFields++;
      if (project.description) completedFields++;
      if (project.github) completedFields++;
      if (project.liveDemo) completedFields++;
    });

    // Certifications
    resumeData.certifications.forEach(cert => {
      totalFields += 3;
      if (cert.title) completedFields++;
      if (cert.issuer) completedFields++;
      if (cert.year) completedFields++;
    });

    // Languages
    resumeData.languages.forEach(lang => {
      totalFields += 2;
      if (lang.name) completedFields++;
      if (lang.progress > 0) completedFields++;
    });

    // Interests
    totalFields += resumeData.interests.length;
    completedFields += resumeData.interests.filter(i => i.trim() !== "").length;

    const percentage = Math.round((completedFields / totalFields) * 100);
    setCompletionPercentage(percentage);
    return percentage;
  };

  useEffect(() => {
    calculateCompletion();
  }, [resumeData]);


  const validateAndNext = (e) => {
    const errors = []

    switch (currentPage) {
      case "profile-info":
        const { fullName, designation, summary } = resumeData.profileInfo
        if (!fullName.trim()) errors.push("Full Name is required")
        if (!designation.trim()) errors.push("Designation is required")
        if (!summary.trim()) errors.push("Summary is required")
        break

      case "contact-info":
        const { email, phone } = resumeData.contactInfo
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Valid email is required.")
        if (!phone.trim() || !/^\d{10}$/.test(phone)) errors.push("Valid 10-digit phone number is required")
        break

      case "work-experience":
        // Work experience is optional - only validate if entries exist
        resumeData.workExperience.forEach(({ company, role, startDate, endDate }, index) => {
          if (company || role || startDate || endDate) {
            if (!company || !company.trim()) errors.push(`Company is required in experience ${index + 1}`)
            if (!role || !role.trim()) errors.push(`Role is required in experience ${index + 1}`)
            if (!startDate || !endDate) errors.push(`Start and End dates are required in experience ${index + 1}`)
          }
        })
        break

      case "education-info":
        resumeData.education.forEach(({ degree, institution, startDate, endDate }, index) => {
          if (!degree.trim()) errors.push(`Degree is required in education ${index + 1}`)
          if (!institution.trim()) errors.push(`Institution is required in education ${index + 1}`)
          if (!startDate || !endDate) errors.push(`Start and End dates are required in education ${index + 1}`)
        })
        break

      case "skills":
        resumeData.skills.forEach(({ name, progress }, index) => {
          if (!name.trim()) errors.push(`Skill name is required in skill ${index + 1}`)
          if (progress < 1 || progress > 100)
            errors.push(`Skill progress must be between 1 and 100 in skill ${index + 1}`)
        })
        break

      case "projects":
        resumeData.projects.forEach(({ title, description }, index) => {
          if (!title.trim()) errors.push(`Project Title is required in project ${index + 1}`)
          if (!description.trim()) errors.push(`Project description is required in project ${index + 1}`)
        })
        break

      case "certifications":
        // Certifications are optional - only validate if entries exist
        resumeData.certifications.forEach(({ title, issuer }, index) => {
          if (title || issuer) {
            if (!title.trim()) errors.push(`Certification Title is required in certification ${index + 1}`)
            if (!issuer.trim()) errors.push(`Issuer is required in certification ${index + 1}`)
          }
        })
        break

      case "additionalInfo":
        if (resumeData.languages.length === 0 || !resumeData.languages[0].name?.trim()) {
          errors.push("At least one language is required")
        }
        // Interests are optional - no validation needed
        break

      default:
        break
    }

    if (errors.length > 0) {
      setErrorMsg(errors.join(", "))
      return
    }

    setErrorMsg("")
    goToNextStep()
  }

  const goToNextStep = () => {
    const pages = [
      "profile-info",
      "contact-info",
      "work-experience",
      "education-info",
      "skills",
      "projects",
      "certifications",
      "additionalInfo",
    ]

    if (currentPage === "additionalInfo") setOpenPreviewModal(true)

    const currentIndex = pages.indexOf(currentPage)
    if (currentIndex !== -1 && currentIndex < pages.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentPage(pages[nextIndex])

      const percent = Math.round((nextIndex / (pages.length - 1)) * 100)
      setProgress(percent)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const goBack = () => {
    const pages = [
      "profile-info",
      "contact-info",
      "work-experience",
      "education-info",
      "skills",
      "projects",
      "certifications",
      "additionalInfo",
    ]

    if (currentPage === "profile-info") navigate("/dashboard")

    const currentIndex = pages.indexOf(currentPage)
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentPage(pages[prevIndex])

      const percent = Math.round((prevIndex / (pages.length - 1)) * 100)
      setProgress(percent)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const renderForm = () => {
    switch (currentPage) {
      case "profile-info":
        return (
          <ProfileInfoForm
            profileData={resumeData?.profileInfo}
            updateSection={(key, value) => updateSection("profileInfo", key, value)}
            onNext={validateAndNext}
          />
        )

      case "contact-info":
        return (
          <ContactInfoForm
            contactInfo={resumeData?.contactInfo}
            updateSection={(key, value) => updateSection("contactInfo", key, value)}
          />
        )

      case "work-experience":
        return (
          <WorkExperienceForm
            workExperience={resumeData?.workExperience}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("workExperience", index, key, value)
            }}
            addArrayItem={(newItem) => addArrayItem("workExperience", newItem)}
            removeArrayItem={(index) => removeArrayItem("workExperience", index)}
          />
        )

      case "education-info":
        return (
          <EducationDetailsForm
            educationInfo={resumeData?.education}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("education", index, key, value)
            }}
            addArrayItem={(newItem) => addArrayItem("education", newItem)}
            removeArrayItem={(index) => removeArrayItem("education", index)}
          />
        )

      case "skills":
        return (
          <SkillsInfoForm
            skillsInfo={resumeData?.skills}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("skills", index, key, value)
            }}
            addArrayItem={(newItem) => addArrayItem("skills", newItem)}
            removeArrayItem={(index) => removeArrayItem("skills", index)}
          />
        )

      case "projects":
        return (
          <ProjectDetailForm
            projectInfo={resumeData?.projects}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("projects", index, key, value)
            }}
            addArrayItem={(newItem) => addArrayItem("projects", newItem)}
            removeArrayItem={(index) => removeArrayItem("projects", index)}
          />
        )

      case "certifications":
        return (
          <CertificationInfoForm
            certifications={resumeData?.certifications}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("certifications", index, key, value)
            }}
            addArrayItem={(newItem) => addArrayItem("certifications", newItem)}
            removeArrayItem={(index) => removeArrayItem("certifications", index)}
          />
        )

      case "additionalInfo":
        return (
          <AdditionalInfoForm
            languages={resumeData.languages}
            interests={resumeData.interests}
            updateArrayItem={(section, index, key, value) => updateArrayItem(section, index, key, value)}
            addArrayItem={(section, newItem) => addArrayItem(section, newItem)}
            removeArrayItem={(section, index) => removeArrayItem(section, index)}
          />
        )

      default:
        return null
    }
  }

  const updateSection = (section, key, value) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const updateArrayItem = (section, index, key, value) => {
    setResumeData((prev) => {
      const updatedArray = [...prev[section]]

      if (key === null) {
        updatedArray[index] = value
      } else {
        updatedArray[index] = {
          ...updatedArray[index],
          [key]: value,
        }
      }

      return {
        ...prev,
        [section]: updatedArray,
      }
    })
  }

  const addArrayItem = (section, newItem) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: [...prev[section], newItem],
    }))
  }

  const removeArrayItem = (section, index) => {
    setResumeData((prev) => {
      const updatedArray = [...prev[section]]
      updatedArray.splice(index, 1)
      return {
        ...prev,
        [section]: updatedArray,
      }
    })
  }

  const fetchResumeDetailsById = async () => {
    try {
      const response = await axiosInstance.get(`/api/resume/${resumeId}`)

      if (response.data && response.data.profileInfo) {
        const resumeInfo = response.data

        setResumeData((prevState) => ({
          ...prevState,
          title: resumeInfo?.title || "Untitled",
          template: resumeInfo?.template || prevState?.template,
          profileInfo: resumeInfo?.profileInfo || prevState?.profileInfo,
          contactInfo: resumeInfo?.contactInfo || prevState?.contactInfo,
          workExperience: resumeInfo?.workExperience || prevState?.workExperience,
          education: resumeInfo?.education || prevState?.education,
          skills: resumeInfo?.skills || prevState?.skills,
          projects: resumeInfo?.projects || prevState?.projects,
          certifications: resumeInfo?.certifications || prevState?.certifications,
          languages: resumeInfo?.languages || prevState?.languages,
          interests: resumeInfo?.interests || prevState?.interests,
        }))
      }
    } catch (error) {
      console.error("Error fetching resume:", error)
      toast.error("Failed to load resume data")
    }
  }

  const uploadResumeImages = async () => {
    try {
      setIsLoading(true)

      // Generate thumbnail for preview (optional - can be done later)
      let thumbnailLink = resumeData.thumbnailLink || "";

      try {
        const thumbnailElement = thumbnailRef.current
        if (thumbnailElement) {
          const fixedThumbnail = fixTailwindColors(thumbnailElement)

          const thumbnailCanvas = await html2canvas(fixedThumbnail, {
            scale: 0.5,
            backgroundColor: "#FFFFFF",
            logging: false,
          })

          document.body.removeChild(fixedThumbnail)

          const thumbnailDataUrl = thumbnailCanvas.toDataURL("image/png")
          
          if (thumbnailDataUrl && thumbnailDataUrl.startsWith('data:')) {
            thumbnailLink = thumbnailDataUrl; // Store as base64 for now
          }
        }
      } catch (thumbError) {
        console.warn("Thumbnail generation failed, continuing without it:", thumbError)
      }

      await updateResumeDetails(thumbnailLink)

      toast.success("Resume Updated Successfully")
      navigate("/dashboard")
    } catch (error) {
      console.error("Error Uploading Images:", error)
      toast.error("Failed to upload images")
    } finally {
      setIsLoading(false)
    }
  }


  const handleDeleteResume = async () => {
    try {
      setIsLoading(true)
      await axiosInstance.delete(`/api/resume/${resumeId}`)
      toast.success("Resume deleted successfully")
      navigate("/dashboard")
    } catch (error) {
      console.error("Error deleting resume:", error)
      toast.error("Failed to delete resume")
    } finally {
      setIsLoading(false)
    }
  }

    const updateResumeDetails = async (thumbnailLink) => {
      setIsLoading(true)

      await axiosInstance.put(`/api/resume/${resumeId}`, {
        ...resumeData,
        thumbnailLink: thumbnailLink || "",
        completion: completionPercentage,
      })
      
      setIsLoading(false)
  }

  const downloadPDF = async () => {
    const element = resumeDownloadRef.current;
    if (!element) {
      toast.error("Failed to generate PDF. Please try again.");
      return;
    }
  
    setIsDownloading(true);
    setDownloadSuccess(false);
    const toastId = toast.loading("Generating PDF…");
  
    try {
      // Use fixTailwindColors to convert oklch to hex
      const fixedElement = fixTailwindColors(element);
      
      // Append cloned element to body temporarily for html2canvas
      fixedElement.style.position = 'absolute';
      fixedElement.style.left = '-9999px';
      fixedElement.style.top = '0';
      fixedElement.style.width = '794px'; // A4 width in pixels at 96 DPI
      document.body.appendChild(fixedElement);
      
      const canvas = await html2canvas(fixedElement, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#FFFFFF",
        logging: false,
        width: 794,
      });

      // Remove the cloned element
      document.body.removeChild(fixedElement);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${resumeData.title.replace(/[^a-z0-9]/gi, "_")}.pdf`);
  
      toast.success("PDF downloaded successfully!", { id: toastId });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
  
    } catch (err) {
      console.error("PDF error:", err);
      toast.error(`Failed to generate PDF: ${err.message}`, { id: toastId });
  
    } finally {
      setIsDownloading(false);
    }
  };

  const updateTheme = (theme) => {
    setResumeData(prev => ({
      ...prev,
      template: {
        theme: theme,
        colorPalette: []
      }
    }));
  }

  useEffect(() => {
    if (resumeId) {
      fetchResumeDetailsById()
    }
  }, [resumeId])

  
  return (
    <DashboardLayout>
      <div className={containerStyles.main}>
        <div className={containerStyles.header}>
          <TitleInput title={resumeData.title} setTitle={(value) => setResumeData((prev) =>({
            ...prev,
            title: value,
          }))}/>

          <div className='flex flex-wrap items-center gap-3'>
            <button onClick={() => setOpenThemeSelector(true)} className={buttonStyles.theme}>
              <Palette size={16} />
              <span className='text-sm'>Theme</span>
            </button>

            <button onClick={handleDeleteResume} className={buttonStyles.delete} disabled={isLoading}>
              <Trash2 size={16} />
              <span className='text-sm'>Delete</span>
            </button>

            <button onClick={() => setOpenPreviewModal(true)} className={buttonStyles.download}>
              <Download size={16} />
              <span className='text-sm'>Preview</span>
            </button>
          </div>
        </div>

          <div className={containerStyles.grid}>
            <div className={containerStyles.formContainer}>
              <StepProgress progress={progress} />
              {renderForm()}
              <div className='p-4 sm:p-6'>
                {errorMsg && (
                  <div className={statusStyles.error}>
                    <AlertCircle size={16} />
                    {errorMsg}
                  </div>
                )}

                <div className='flex flex-wrap items-center justify-end gap-3'>
                  <button className={buttonStyles.back} onClick={goBack} disabled={isLoading}>
                    <ArrowLeft size={16} />Back
                  </button>
                  <button className={buttonStyles.save} onClick={uploadResumeImages} disabled={isLoading}>
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isLoading ? "Saving..." : "Save & Exit"}
                  </button>
                  <button className={buttonStyles.next} onClick={validateAndNext} disabled={isLoading}>
                    {currentPage === "additionalInfo" && <Download size={16} />}
                    {currentPage === "additionalInfo" ? "Preview & Download" : "Next"}
                    {currentPage === "additionalInfo" && <ArrowLeft size={16} className='rotate-180' />}
                  </button>
                </div>
              </div>
            </div>

            <div className='hidden lg:block'>
              <div className={containerStyles.previewContainer}>
                <div className='text-center mb-4'>
                  <div className={statusStyles.completionBadge}>
                    <div className={iconStyles.pulseDot}></div>
                    <span>Preview - {completionPercentage}% Complete</span>
                  </div>
                </div>

                <div className='preview-container relative' ref={previewContainerRef}>
                  <div className={containerStyles.previewInner}>
                    <RenderResume key={`preview-${resumeData?.template?.theme}`}
                    templateId={resumeData?.template?.theme || ""}
                    resumeData={resumeData}
                    containerWidth={previewWidth} />
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      <Modal isOpen={openThemeSelector} onClose={() => setOpenThemeSelector(false)}
      title="Change Title">
        <div className={containerStyles.modalContent}>
          <ThemeSelector selectedTheme={resumeData?.template.theme}
          setSelectedTheme={updateTheme} onClose={() => setOpenThemeSelector(false)}
           />
        </div>
      </Modal>

      <Modal isOpen={openPreviewModal} onClose={() =>setOpenPreviewModal(false)}
        title={resumeData.title} showActionbtn actionBtnText={isDownloading ? "Generating..." : downloadSuccess ? "Downloaded" : "Download PDF"}
        actionBtnIcon = {
          isDownloading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : 
            downloadSuccess ? (
              <Check size={16} className='text-white' />

            ) : (
              <Download size={16} />
            )
        } onActionClick={downloadPDF}>
          <div className='relative'>
            <div className='text-center mb-4'>
              <div className={statusStyles.modalBadge}>
                <div className={iconStyles.pulseDot}></div>
                <span>Completion: {completionPercentage}%</span>
              </div>
            </div>

            <div className={containerStyles.pdfPreview}>
              <div ref={resumeDownloadRef} className='a4-wrapper'>
                <div className='w-full h-full'>
                  <RenderResume key={`pdf-${resumeData ?.template.theme}`}
                  templateId={resumeData?.template?.theme || ""}
                  resumeData={resumeData}
                  containerWidth={null} />
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <div style={{position: "absolute", left: "-9999px", top: "0", width: "794px"}} ref={thumbnailRef}>
          <div className={containerStyles.hiddenThumbnail}>
            <RenderResume key={`thumb-${resumeData?.template?.theme}`}
            templateId={resumeData?.template?.theme || ""}
            resumeData={resumeData}
            containerWidth={794} />
          </div>
        </div>
    </DashboardLayout>
  )
}

export default EditResume