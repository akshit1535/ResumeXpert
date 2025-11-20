import React from 'react'
import { useParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'

const ResumeEditor = () => {
  const { id } = useParams()
  
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Resume Editor</h1>
        <p className="text-gray-600">Editing resume: {id}</p>
        <p className="text-gray-500 mt-4">Resume editor component coming soon...</p>
      </div>
    </DashboardLayout>
  )
}

export default ResumeEditor
