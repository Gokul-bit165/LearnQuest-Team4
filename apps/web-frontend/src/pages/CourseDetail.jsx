import React from 'react'
import { useParams } from 'react-router-dom'

const CourseDetail = () => {
  const { id } = useParams()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Course Detail</h1>
      <p className="text-gray-600">Course ID: {id}</p>
      {/* Course content will be rendered here */}
    </div>
  )
}

export default CourseDetail
