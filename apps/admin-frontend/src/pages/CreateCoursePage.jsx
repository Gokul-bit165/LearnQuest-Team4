import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../services/api'
import { Plus, Trash2, GripVertical, BookOpen, HelpCircle, Code, Edit3 } from 'lucide-react'

const CreateCoursePage = () => {
  const navigate = useNavigate()
  const [course, setCourse] = useState({ 
    title: '', 
    description: '', 
    xp_reward: 0, 
    modules: [] 
  })
  const [draggedCard, setDraggedCard] = useState(null)

  const addModule = () => {
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, { 
        id: crypto.randomUUID(), 
        title: '', 
        order: prev.modules.length,
        topics: [] 
      }]
    }))
  }

  const removeModule = (id) => {
    setCourse(prev => ({ ...prev, modules: prev.modules.filter(m => m.id !== id) }))
  }

  const updateModuleTitle = (id, title) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === id ? { ...m, title } : m)
    }))
  }

  const addTopic = (moduleId) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId 
          ? { 
              ...m, 
              topics: [...m.topics, { 
                id: crypto.randomUUID(), 
                title: '', 
                xp_reward: 50,
                cards: [] 
              }] 
            } 
          : m
      )
    }))
  }

  const removeTopic = (moduleId, topicId) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId 
          ? { ...m, topics: m.topics.filter(t => t.id !== topicId) } 
          : m
      )
    }))
  }

  const updateTopic = (moduleId, topicId, field, value) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              topics: m.topics.map(t => t.id === topicId ? { ...t, [field]: value } : t)
            }
          : m
      )
    }))
  }

  const addCard = (moduleId, topicId, cardType) => {
    const newCard = {
      card_id: crypto.randomUUID(),
      type: cardType,
      content: '',
      xp_reward: 10,
      explanation: ''
    }

    // Add card type specific fields
    if (cardType === 'mcq') {
      newCard.choices = ['', '', '', '']
      newCard.correct_choice_index = 0
    } else if (cardType === 'code') {
      newCard.starter_code = '# Your code here'
      newCard.test_cases = [{ input: '', expected_output: '', is_hidden: false }]
    } else if (cardType === 'fill-in-blank') {
      newCard.blanks = ['']
      newCard.correct_answers = ['']
    }

    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              topics: m.topics.map(t =>
                t.id === topicId
                  ? { ...t, cards: [...t.cards, newCard] }
                  : t
              )
            }
          : m
      )
    }))
  }

  const removeCard = (moduleId, topicId, cardId) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              topics: m.topics.map(t =>
                t.id === topicId
                  ? { ...t, cards: t.cards.filter(c => c.card_id !== cardId) }
                  : t
              )
            }
          : m
      )
    }))
  }

  const updateCard = (moduleId, topicId, cardId, field, value) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              topics: m.topics.map(t =>
                t.id === topicId
                  ? {
                      ...t,
                      cards: t.cards.map(c =>
                        c.card_id === cardId ? { ...c, [field]: value } : c
                      )
                    }
                  : t
              )
            }
          : m
      )
    }))
  }

  const updateCardChoice = (moduleId, topicId, cardId, choiceIndex, value) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              topics: m.topics.map(t =>
                t.id === topicId
                  ? {
                      ...t,
                      cards: t.cards.map(c =>
                        c.card_id === cardId
                          ? {
                              ...c,
                              choices: c.choices.map((choice, idx) =>
                                idx === choiceIndex ? value : choice
                              )
                            }
                          : c
                      )
                    }
                  : t
              )
            }
          : m
      )
    }))
  }

  const updateTestCase = (moduleId, topicId, cardId, testIndex, field, value) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              topics: m.topics.map(t =>
                t.id === topicId
                  ? {
                      ...t,
                      cards: t.cards.map(c =>
                        c.card_id === cardId
                          ? {
                              ...c,
                              test_cases: c.test_cases.map((test, idx) =>
                                idx === testIndex ? { ...test, [field]: value } : test
                              )
                            }
                          : c
                      )
                    }
                  : t
              )
            }
          : m
      )
    }))
  }

  const addTestCase = (moduleId, topicId, cardId) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              topics: m.topics.map(t =>
                t.id === topicId
                  ? {
                      ...t,
                      cards: t.cards.map(c =>
                        c.card_id === cardId
                          ? {
                              ...c,
                              test_cases: [...c.test_cases, { input: '', expected_output: '', is_hidden: false }]
                            }
                          : c
                      )
                    }
                  : t
              )
            }
          : m
      )
    }))
  }

  const removeTestCase = (moduleId, topicId, cardId, testIndex) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              topics: m.topics.map(t =>
                t.id === topicId
                  ? {
                      ...t,
                      cards: t.cards.map(c =>
                        c.card_id === cardId
                          ? {
                              ...c,
                              test_cases: c.test_cases.filter((_, idx) => idx !== testIndex)
                            }
                          : c
                      )
                    }
                  : t
              )
            }
          : m
      )
    }))
  }

  const handleDragStart = (e, cardId) => {
    setDraggedCard(cardId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, moduleId, topicId, targetCardId) => {
    e.preventDefault()
    if (!draggedCard || draggedCard === targetCardId) return

    // Reorder cards
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              topics: m.topics.map(t =>
                t.id === topicId
                  ? {
                      ...t,
                      cards: reorderCards(t.cards, draggedCard, targetCardId)
                    }
                  : t
              )
            }
          : m
      )
    }))
    setDraggedCard(null)
  }

  const reorderCards = (cards, draggedId, targetId) => {
    const draggedCard = cards.find(c => c.card_id === draggedId)
    const targetIndex = cards.findIndex(c => c.card_id === targetId)
    const filteredCards = cards.filter(c => c.card_id !== draggedId)
    
    filteredCards.splice(targetIndex, 0, draggedCard)
    return filteredCards
  }

  const saveCourse = async () => {
    const payload = {
      title: course.title,
      description: course.description,
      xp_reward: Number(course.xp_reward) || 0,
      modules: course.modules.map(m => ({
        title: m.title,
        order: m.order,
        topics: m.topics.map(t => ({
          title: t.title,
          xp_reward: t.xp_reward,
          cards: t.cards.map(c => ({
            type: c.type,
            content: c.content,
            xp_reward: c.xp_reward,
            explanation: c.explanation,
            ...(c.type === 'mcq' && {
              choices: c.choices,
              correct_choice_index: c.correct_choice_index
            }),
            ...(c.type === 'code' && {
              starter_code: c.starter_code,
              test_cases: c.test_cases
            }),
            ...(c.type === 'fill-in-blank' && {
              blanks: c.blanks,
              correct_answers: c.correct_answers
            })
          }))
        }))
      }))
    }
    await adminAPI.createCourse(payload)
    navigate('/courses')
  }

  const getCardIcon = (type) => {
    switch (type) {
      case 'theory': return <BookOpen className="w-4 h-4" />
      case 'mcq': return <HelpCircle className="w-4 h-4" />
      case 'code': return <Code className="w-4 h-4" />
      case 'fill-in-blank': return <Edit3 className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  const getCardTypeLabel = (type) => {
    switch (type) {
      case 'theory': return 'Theory'
      case 'mcq': return 'Multiple Choice'
      case 'code': return 'Code Challenge'
      case 'fill-in-blank': return 'Fill in the Blank'
      default: return 'Theory'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Lesson Builder</h1>

      {/* Course details */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Course Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="w-full bg-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400" 
            placeholder="Course Title" 
            value={course.title} 
            onChange={e => setCourse({ ...course, title: e.target.value })} 
          />
          <input 
            type="number" 
            className="w-full bg-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400" 
            placeholder="XP Reward" 
            value={course.xp_reward} 
            onChange={e => setCourse({ ...course, xp_reward: e.target.value })} 
          />
        </div>
        <textarea 
          className="w-full bg-slate-700 rounded-lg px-4 py-3 mt-4 text-white placeholder-slate-400" 
          placeholder="Course Description" 
          rows={3}
          value={course.description} 
          onChange={e => setCourse({ ...course, description: e.target.value })} 
        />
      </div>

      {/* Modules */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white">Learning Modules</h2>
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2" 
            onClick={addModule}
          >
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        </div>
        
        <div className="space-y-6">
          {course.modules.map((module, moduleIdx) => (
            <div key={module.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Module {moduleIdx + 1}</h3>
                <button 
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center gap-2" 
                  onClick={() => removeModule(module.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Module
                </button>
              </div>
              
              <input 
                className="w-full bg-slate-700 rounded-lg px-4 py-3 mb-4 text-white placeholder-slate-400" 
                placeholder="Module Title" 
                value={module.title} 
                onChange={e => updateModuleTitle(module.id, e.target.value)} 
              />

              {/* Topics */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-white">Topics</h4>
                  <button 
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center gap-2" 
                    onClick={() => addTopic(module.id)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Topic
                  </button>
                </div>
                
                <div className="space-y-4">
                  {module.topics.map((topic, topicIdx) => (
                    <div key={topic.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-slate-300">Topic {topicIdx + 1}</h5>
                        <button 
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center gap-1" 
                          onClick={() => removeTopic(module.id, topic.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <input 
                          className="bg-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-400" 
                          placeholder="Topic Title" 
                          value={topic.title} 
                          onChange={e => updateTopic(module.id, topic.id, 'title', e.target.value)} 
                        />
                        <input 
                          type="number" 
                          className="bg-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-400" 
                          placeholder="XP Reward" 
                          value={topic.xp_reward} 
                          onChange={e => updateTopic(module.id, topic.id, 'xp_reward', parseInt(e.target.value) || 50)} 
                        />
                      </div>

                      {/* Card Type Selection */}
                      <div className="mb-4">
                        <h6 className="text-sm font-medium text-slate-300 mb-2">Add Cards</h6>
                        <div className="flex flex-wrap gap-2">
                          {['theory', 'mcq', 'code', 'fill-in-blank'].map(type => (
                            <button
                              key={type}
                              className="px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white flex items-center gap-2 text-sm"
                              onClick={() => addCard(module.id, topic.id, type)}
                            >
                              {getCardIcon(type)}
                              {getCardTypeLabel(type)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Cards */}
                      <div className="space-y-3">
                        {topic.cards.map((card, cardIdx) => (
                          <div 
                            key={card.card_id} 
                            className="bg-slate-800 border border-slate-600 rounded-lg p-4"
                            draggable
                            onDragStart={(e) => handleDragStart(e, card.card_id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, module.id, topic.id, card.card_id)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                                <span className="text-sm font-medium text-slate-300">
                                  Card {cardIdx + 1}: {getCardTypeLabel(card.type)}
                                </span>
                              </div>
                              <button 
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm" 
                                onClick={() => removeCard(module.id, topic.id, card.card_id)}
                              >
                                Remove
                              </button>
                            </div>

                            {/* Card Content */}
                            <div className="space-y-3">
                              <textarea 
                                className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-400" 
                                placeholder="Question or instruction text" 
                                rows={2}
                                value={card.content} 
                                onChange={e => updateCard(module.id, topic.id, card.card_id, 'content', e.target.value)} 
                              />
                              
                              <div className="grid grid-cols-2 gap-3">
                                <input 
                                  type="number" 
                                  className="bg-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-400" 
                                  placeholder="XP Reward" 
                                  value={card.xp_reward} 
                                  onChange={e => updateCard(module.id, topic.id, card.card_id, 'xp_reward', parseInt(e.target.value) || 10)} 
                                />
                                <textarea 
                                  className="bg-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-400" 
                                  placeholder="Explanation (optional)" 
                                  rows={2}
                                  value={card.explanation} 
                                  onChange={e => updateCard(module.id, topic.id, card.card_id, 'explanation', e.target.value)} 
                                />
                              </div>

                              {/* MCQ Specific Fields */}
                              {card.type === 'mcq' && (
                                <div className="space-y-2">
                                  <h6 className="text-sm font-medium text-slate-300">Multiple Choice Options</h6>
                                  {card.choices.map((choice, choiceIdx) => (
                                    <div key={choiceIdx} className="flex items-center gap-2">
                                      <input 
                                        type="radio" 
                                        name={`correct-${card.card_id}`}
                                        checked={card.correct_choice_index === choiceIdx}
                                        onChange={() => updateCard(module.id, topic.id, card.card_id, 'correct_choice_index', choiceIdx)}
                                        className="text-blue-600"
                                      />
                                      <input 
                                        className="flex-1 bg-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-400" 
                                        placeholder={`Choice ${choiceIdx + 1}`} 
                                        value={choice} 
                                        onChange={e => updateCardChoice(module.id, topic.id, card.card_id, choiceIdx, e.target.value)} 
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Code Specific Fields */}
                              {card.type === 'code' && (
                                <div className="space-y-3">
                                  <div>
                                    <h6 className="text-sm font-medium text-slate-300 mb-2">Starter Code</h6>
                                    <textarea 
                                      className="w-full bg-slate-900 rounded-lg px-3 py-2 text-white font-mono text-sm" 
                                      placeholder="# Your code here" 
                                      rows={4}
                                      value={card.starter_code} 
                                      onChange={e => updateCard(module.id, topic.id, card.card_id, 'starter_code', e.target.value)} 
                                    />
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <h6 className="text-sm font-medium text-slate-300">Test Cases</h6>
                                      <button 
                                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm" 
                                        onClick={() => addTestCase(module.id, topic.id, card.card_id)}
                                      >
                                        Add Test Case
                                      </button>
                                    </div>
                                    {card.test_cases.map((testCase, testIdx) => (
                                      <div key={testIdx} className="bg-slate-900 rounded-lg p-3 mb-2">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm text-slate-400">Test Case {testIdx + 1}</span>
                                          <button 
                                            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm" 
                                            onClick={() => removeTestCase(module.id, topic.id, card.card_id, testIdx)}
                                          >
                                            Remove
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          <input 
                                            className="bg-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-400" 
                                            placeholder="Input" 
                                            value={testCase.input} 
                                            onChange={e => updateTestCase(module.id, topic.id, card.card_id, testIdx, 'input', e.target.value)} 
                                          />
                                          <input 
                                            className="bg-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-400" 
                                            placeholder="Expected Output" 
                                            value={testCase.expected_output} 
                                            onChange={e => updateTestCase(module.id, topic.id, card.card_id, testIdx, 'expected_output', e.target.value)} 
                                          />
                                        </div>
                                        <div className="mt-2">
                                          <label className="flex items-center gap-2 text-sm text-slate-300">
                                            <input 
                                              type="checkbox" 
                                              checked={testCase.is_hidden} 
                                              onChange={e => updateTestCase(module.id, topic.id, card.card_id, testIdx, 'is_hidden', e.target.checked)}
                                              className="text-blue-600"
                                            />
                                            Hidden test case
                                          </label>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Fill-in-blank Specific Fields */}
                              {card.type === 'fill-in-blank' && (
                                <div className="space-y-2">
                                  <h6 className="text-sm font-medium text-slate-300">Fill in the Blank</h6>
                                  {card.blanks.map((blank, blankIdx) => (
                                    <div key={blankIdx} className="flex gap-2">
                                      <input 
                                        className="flex-1 bg-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-400" 
                                        placeholder="Blank text" 
                                        value={blank} 
                                        onChange={e => {
                                          const newBlanks = [...card.blanks]
                                          newBlanks[blankIdx] = e.target.value
                                          updateCard(module.id, topic.id, card.card_id, 'blanks', newBlanks)
                                        }} 
                                      />
                                      <input 
                                        className="flex-1 bg-slate-900 rounded-lg px-3 py-2 text-white placeholder-slate-400" 
                                        placeholder="Correct answer" 
                                        value={card.correct_answers[blankIdx] || ''} 
                                        onChange={e => {
                                          const newAnswers = [...card.correct_answers]
                                          newAnswers[blankIdx] = e.target.value
                                          updateCard(module.id, topic.id, card.card_id, 'correct_answers', newAnswers)
                                        }} 
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button 
          className="px-6 py-3 bg-slate-600 hover:bg-slate-700 rounded-lg text-white" 
          onClick={() => navigate('/courses')}
        >
          Cancel
        </button>
        <button 
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white" 
          onClick={saveCourse}
        >
          Save Course
        </button>
      </div>
    </div>
  )
}

export default CreateCoursePage