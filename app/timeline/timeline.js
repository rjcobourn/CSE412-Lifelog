import React, { useState, useRef, useEffect } from 'react'
import { FiFileText, FiImage } from 'react-icons/fi'

const timelineEvents = [
  { id: 1, title: 'Event 1', text: '', image: null, tags: ['tag1', 'tag2'] },
  { id: 2, title: 'Event 2', text: '', image: null, tags: ['tag3', 'tag4'] },
  { id: 3, title: 'Event 3', text: '', image: null, tags: ['tag5', 'tag6'] },
  // More Events - testing
]

const Timeline = () => {
  const [events, setEvents] = useState(timelineEvents)
  const [newEventId, setNewEventId] = useState(timelineEvents.length + 1)
  const eventRefs = useRef({})
  const [showTextForm, setShowTextForm] = useState(false)
  const [showImageForm, setShowImageForm] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventText, setNewEventText] = useState('')
  const [newEventImage, setNewEventImage] = useState(null)
  const [newEventTags, setNewEventTags] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredEvents, setFilteredEvents] = useState(events)

  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault()
      window.scrollBy({ left: 2 * event.deltaY, behavior: 'smooth' })
    }

    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const resizeTextarea = (event) => {
    event.target.style.height = 'auto'
    event.target.style.height = event.target.scrollHeight + 'px'
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewEventImage(file)
    }
  }

  const handleTagInput = (e) => {
    if (e.key === ' ' || e.key === ',' || e.key === 'Enter') {
      const value = e.target.value.trim()
      if (value && !newEventTags.includes(value)) {
        setNewEventTags([...newEventTags, value])
      }
      e.target.value = ''
      e.preventDefault()
    }
  }

  const removeTag = (index) => {
    setNewEventTags(newEventTags.filter((_, idx) => idx !== index))
  }

  const handleAddEvent = (title, text, image) => {
    const newEvent = {
      id: newEventId,
      title,
      text,
      image: image ? URL.createObjectURL(image) : null,
      tags: newEventTags,
    }

    setEvents([...events, newEvent])
    setNewEventId(newEventId + 1)

    setTimeout(() => {
      if (eventRefs.current[newEventId]) {
        eventRefs.current[newEventId].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }, 0)

    resetForm()
  }

  const handleSubmit = async (showTextForm) => {
    try {
      if (showTextForm) {
        // Handle text form submission
        await fetch('/api/add-text-entry', {
          method: 'POST',
          body: JSON.stringify({
            title: newEventTitle,
            text: newEventText,
            tags: newEventTags,
          }),
        })
      } else {
        // Handle image form submission
        const reader = new FileReader()
        reader.readAsDataURL(newEventImage)

        let base64String
        let mimeType

        await new Promise((resolve) => {
          reader.onload = () => {
            base64String = reader.result
            mimeType = reader.result.split(';')[0].split(':')[1]
            resolve()
          }
        })

        await fetch('/api/add-image-entry', {
          method: 'POST',
          body: JSON.stringify({
            title: newEventTitle,
            imagetype: mimeType,
            imagedata: base64String,
            tags: newEventTags,
          }),
        })
      }

      // Add event to the timeline
      handleAddEvent(newEventTitle, newEventText, newEventImage)
    } catch (error) {
      console.error('Error during submission:', error)
      // TODO: show error message
    }

    resetForm()
  }

  const resetForm = () => {
    setNewEventTitle('')
    setNewEventText('')
    setNewEventImage(null)
    setNewEventTags([])
    setShowTextForm(false)
    setShowImageForm(false)
  }

  const timelineWidth = `calc(${(events.length + 1) * 50}vh + 32px)`

  // Move handleSearch logic here
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    const filtered = events.filter((event) => {
      const hasTitle = event.title.toLowerCase().includes(term)
      const hasTags = event.tags.some((tag) => tag.toLowerCase().includes(term))
      return hasTitle || hasTags
    })

    setFilteredEvents(filtered)
  }

  return (
    <div
      className='timeline'
      style={{ width: timelineWidth, position: 'relative' }}
    >
      {/* Move the search input to the top left */}
      <div style={{ position: 'absolute', top: 0, left: 0, padding: '10px' }}>
        <input
          type='text'
          placeholder='Search events...'
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      {filteredEvents.map((event) => (
        <div
          key={event.id}
          ref={(el) => (eventRefs.current[event.id] = el)}
          className='timeline-item'
        >
          <div style={{ height: '10%', display: 'flex', alignItems: 'center' }}>
            <h3 style={{ padding: 0, margin: 0 }}>{event.title}</h3>
          </div>
          {event.text && <p style={{ height: '90%' }}>{event.text}</p>}
          {event.image && (
            <img
              src={event.image}
              alt={event.title}
              style={{ width: '100%', height: '90%', objectFit: 'cover' }}
            />
          )}
        </div>
      ))}
      <div className='add-button' onClick={() => setShowTextForm(true)}>
        <FiFileText size={30} style={{ cursor: 'pointer' }} />
      </div>
      <div className='add-button' onClick={() => setShowImageForm(true)}>
        <FiImage size={30} style={{ cursor: 'pointer' }} />
      </div>

      {(showTextForm || showImageForm) && (
        <div className='modal-backdrop'>
          <div className='modal'>
            <input
              type='text'
              placeholder='Title'
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
            {showTextForm && (
              <textarea
                placeholder='Text'
                value={newEventText}
                onChange={(e) => setNewEventText(e.target.value)}
                onInput={resizeTextarea}
                className='event-text-input'
              />
            )}
            {showImageForm && (
              <input type='file' onChange={handleImageUpload} />
            )}
            <div className='tags-input-container'>
              {newEventTags.map((tag, index) => (
                <span key={index} className='tag'>
                  {tag}
                  <button
                    onClick={() => removeTag(index)}
                    className='tag-delete-btn'
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
            <input
              type='text'
              placeholder='Tags'
              onKeyDown={handleTagInput}
              className='tags-input'
            />
            <div className='submit-cancel-buttons'>
              <button
                className='submit-button'
                onClick={() => handleSubmit(showTextForm)}
              >
                Submit
              </button>
              <button className='cancel-button' onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Timeline
