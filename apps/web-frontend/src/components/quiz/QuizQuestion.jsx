import React from 'react'

const QuizQuestion = ({ question, onAnswer }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">{question.text}</h3>
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(option)}
            className="block w-full text-left p-3 border rounded hover:bg-gray-50"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuizQuestion
