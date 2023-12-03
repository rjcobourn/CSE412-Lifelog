import React, { useState, useRef } from 'react'

const timelineEvents = [
  { id: 1, title: 'Event 1', text: '', image: null },
  { id: 2, title: 'Event 2', text: '', image: null },
  { id: 3, title: 'Event 3', text: '', image: null },
  // ... more events
]

const Timeline = () => {
  const [events, setEvents] = useState(timelineEvents)
  const [newEventId, setNewEventId] = useState(timelineEvents.length + 1)
  const eventRefs = useRef({})

  const [showForm, setShowForm] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventText, setNewEventText] = useState('')
  const [newEventImage, setNewEventImage] = useState(null)
  const [newEventTags, setNewEventTags] = useState('')

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewEventImage(file)
    }
  }

  const handleAddEvent = (title, text, image) => {
    const newEvent = {
      id: newEventId,
      title,
      text,
      image: image ? URL.createObjectURL(image) : null,
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
  }

  const handleSubmit = async () => {
    const formData = new FormData()
    formData.append('title', newEventTitle)
    formData.append('text', newEventText)
    formData.append('tags', newEventTags)
    if (newEventImage) {
      formData.append('image', newEventImage)
    }

    try {
      const response = await fetch('/api/route', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.message === 'Success') {
        handleAddEvent(newEventTitle, newEventText, newEventImage)
        setNewEventTitle('')
        setNewEventText('')
        setNewEventImage(null)
        setNewEventTags('')
        setShowForm(false)
      } else {
        console.error(data.error)
      }
    } catch (error) {
      console.error('An error occurred:', error)
    }
  }

  const timelineWidth = `calc(${(events.length + 1) * 50}vh + 32px)`

  return (
    <div className='timeline' style={{ width: timelineWidth }}>
      {events.map((event) => (
        <div
          key={event.id}
          ref={(el) => (eventRefs.current[event.id] = el)}
          className='timeline-item'
        >
          <h3>{event.title}</h3>
          {event.text && <p>{event.text}</p>}
          {event.image && (
            <img
              src={event.image}
              alt={event.title}
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </div>
      ))}
      <div className='add-button' onClick={() => setShowForm(true)}>
        +
      </div>

      {showForm && (
        <div className='modal-backdrop'>
          <div className='modal'>
            <input
              type='text'
              placeholder='Title'
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
            <textarea
              placeholder='Text'
              value={newEventText}
              onChange={(e) => setNewEventText(e.target.value)}
            />
            <input type='file' onChange={handleImageUpload} />
            <input
              type='text'
              placeholder='Tags'
              value={newEventTags}
              onChange={(e) => setNewEventTags(e.target.value)}
            />
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Timeline
