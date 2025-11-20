import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Sparkles } from 'lucide-react'
import { resumeTemplates, DUMMY_RESUME_DATA } from '../utils/data'
import RenderResume from '../components/RenderResume'
import { TemplateCard } from '../components/Cards'

const TemplatesGallery = () => {
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] = useState({
    theme: resumeTemplates[0]?.id || "modern",
    index: 0
  })

  const handleUseTemplate = () => {
    // Navigate to dashboard where user can create a new resume with this template
    navigate('/dashboard')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 '>
      {/* Header */}
      <header className='sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-violet-100/50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
          <button 
            onClick={() => navigate('/')}
            className='flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-violet-600 transition-colors rounded-xl hover:bg-violet-50'
          >
            <ArrowLeft size={20} />
            <span className='font-semibold'>Back to Home</span>
          </button>

          <h1 className='text-xl sm:text-2xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent'>
            Resume Templates
          </h1>

          <button
            onClick={handleUseTemplate}
            className='flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all'
          >
            <Sparkles size={18} />
            <span className='hidden sm:inline'>Use This Template</span>
            <span className='sm:hidden'>Use</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        {/* Title Section */}
        <div className='text-center mb-8 sm:mb-12'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 border border-violet-200 text-violet-700 rounded-full font-semibold text-sm mb-4'>
            <Sparkles size={16} />
            Professional Templates
          </div>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4'>
            Choose Your Perfect
            <span className='block bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent'>
              Resume Design
            </span>
          </h2>
          <p className='text-lg text-slate-600 max-w-2xl mx-auto'>
            Select from our collection of professionally designed templates that help you stand out
          </p>
        </div>

        {/* Templates Grid and Preview */}
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8'>
          {/* Template Selection */}
          <div className='lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-lg'>
            <h3 className='text-lg font-bold text-gray-900 mb-6 flex items-center gap-2'>
              <div className='w-2 h-2 bg-violet-600 rounded-full'></div>
              All Templates ({resumeTemplates.length})
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 max-h-[70vh] overflow-y-auto pr-2'>
              {resumeTemplates.map((template, index) => (
                <div key={`template_${index}`} onClick={() => setSelectedTemplate({ theme: template.id, index })}>
                  <TemplateCard 
                    thumbnailImg={template.thumbnailImg}
                    isSelected={selectedTemplate.index === index}
                    onSelect={() => setSelectedTemplate({ theme: template.id, index })}
                  />
                  <div className='mt-2 text-center'>
                    <p className='font-semibold text-sm text-slate-800'>{template.name || `Template ${index + 1}`}</p>
                    <p className='text-xs text-slate-500'>{template.description || 'Professional Design'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className='lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-lg overflow-hidden'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
                <div className='w-2 h-2 bg-fuchsia-600 rounded-full'></div>
                Live Preview
              </h3>
              <div className='flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-sm font-semibold'>
                <Check size={16} />
                Selected
              </div>
            </div>
            <div className='overflow-y-auto overflow-x-hidden max-h-[70vh] bg-slate-50 rounded-xl p-4 flex justify-center'>
              <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center', width: '794px' }}>
                <RenderResume 
                  templateId={selectedTemplate.theme}
                  resumeData={DUMMY_RESUME_DATA}
                  containerWidth={794}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className='mt-12 text-center bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl p-8 border border-violet-100'>
          <h3 className='text-2xl font-black text-slate-900 mb-3'>
            Ready to Create Your Resume?
          </h3>
          <p className='text-slate-600 mb-6 max-w-xl mx-auto'>
            Start with this template and customize it with your information to create a professional resume in minutes
          </p>
          <button
            onClick={handleUseTemplate}
            className='inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:scale-105 transition-all'
          >
            <Sparkles size={20} />
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default TemplatesGallery
