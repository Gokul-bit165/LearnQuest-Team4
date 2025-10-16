import React from 'react'

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
      <p className="text-gray-600">{course.description}</p>
    </div>
  )
}

export default CourseCard
