import React from 'react'

const Courses = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Course cards will be rendered here */}
        <p className="text-gray-600">Loading courses...</p>
      </div>
    </div>
  )
}

export default Courses
