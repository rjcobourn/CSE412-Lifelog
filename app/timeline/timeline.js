import React, { useState, useEffect, useRef } from 'react';

const timelineStyle = {
	display: 'flex',
	alignItems: 'center', // Centers items vertically
	overflowX: 'auto',
	whiteSpace: 'nowrap',
	padding: '20px',
	height: '95vh', // ~viewport height... 100 gives ugly sidebar on my monitor
	width: '500vh',
};

// Timeline Items
const itemStyle = {
	color: 'white',
	width: '50vh',
	height: '50vh',
	margin: '30px',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center', // Center content vertically inside the item
	alignItems: 'center', // Center content horizontally inside the item
	border: '1px solid #ccc', // Border
	// Add other styles like background, boxShadow, borderRadius, etc.
};

const addButtonStyle = {
	color: 'white',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	width: '90px',
	height: '90px',
	borderRadius: '50%', // Makes it a circle
	border: '1px solid #ccc',
	margin: '10px',
	fontSize: '42px', // Size of the '+' symbol
	cursor: 'pointer',
	background: '#555555',
	// Add other styles like background color, hover effects, etc.
};


const modalBackdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
	backdropFilter: 'blur(5px)',
};

const modalStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    zIndex: 1001,
    // Add more styling as needed...much more needed
};



const timelineEvents = [
	{ id: 1, title: 'Event 1', date: '2023-01-01', text: '', image: null },
	{ id: 2, title: 'Event 2', date: '2023-01-02', text: '', image: null },
	{ id: 3, title: 'Event 3', date: '2023-01-03', text: '', image: null },
	// { id: 4, title: 'Event 4', date: '2023-01-04' },
	// { id: 5, title: 'Event 5', date: '2023-01-05' },
	// { id: 6, title: 'Event 6', date: '2023-01-06' },
	// { id: 7, title: 'Event 7', date: '2023-01-07' },
	// { id: 8, title: 'Event 8', date: '2023-01-08' },
	// { id: 9, title: 'Event 9', date: '2023-01-09' },
	// ... more events
];


const Timeline = () => {
    const [events, setEvents] = useState(timelineEvents);
    const [newEventId, setNewEventId] = useState(timelineEvents.length + 1);
    const eventRefs = useRef({});

	const [showForm, setShowForm] = useState(false);
	const [newEventTitle, setNewEventTitle] = useState('');
	const [newEventDate, setNewEventDate] = useState('');
	// const [newEventType, setNewEventType] = useState(''); // 'Text Entry' or other types
	const [newEventText, setNewEventText] = useState('');
	const [newEventImage, setNewEventImage] = useState(null);
	const [newEventTags, setNewEventTags] = useState('');


	
	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			// validation here (e.g., file type, file size)
			setNewEventImage(file);
		}
	};

    const handleAddEvent = (title, date, text, image) => {
        const newEvent = {
            id: newEventId,
            title,
            date,
            text,
            image: image ? URL.createObjectURL(image) : null,
        };

        setEvents([...events, newEvent]);
        setNewEventId(newEventId + 1);

        // Wait for the state to update and the DOM to render
        setTimeout(() => {
            if (eventRefs.current[newEventId]) {
                eventRefs.current[newEventId].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 0);
    };

	const handleSubmit = async () => {
		const formData = new FormData();
		formData.append('title', newEventTitle);
		formData.append('date', newEventDate);
		formData.append('text', newEventText);
		formData.append('tags', newEventTags);
		if (newEventImage) {
			formData.append('image', newEventImage);
		}
	
		try {
			// Send data to the server
			const response = await fetch('/api/route', {
				method: 'POST',
				body: formData,
			});
	
			const data = await response.json();
			if (data.message === "Success") {
				// Process success response, update state, etc.
				handleAddEvent(newEventTitle, newEventDate, newEventText, newEventImage);
				// Reset form and close it
				setNewEventTitle('');
				setNewEventDate('');
				setNewEventText('');
				setNewEventImage(null);
				setShowForm(false);
			} else {
				// Handle error response
				console.error(data.error);
			}
		} catch (error) {
			// Handle network or other errors
			console.error('An error occurred:', error);
		}
	};


    const timelineWidth = `calc(${(events.length + 1) * 50}vh + 32px)`;


    return (
      <div style={{ ...timelineStyle, width: timelineWidth }}>
        {events.map(event => (
			<div key={event.id} ref={el => eventRefs.current[event.id] = el} style={itemStyle}>
			<h3>{event.title}</h3>
			<p>{event.date}</p>
			{event.text && <p>{event.text}</p>}
			{event.image && <img src={event.image} alt={event.title} style={{ width: '100%', height: 'auto' }} />}
	  </div>
        ))}
        <div style={addButtonStyle} onClick={() => setShowForm(true)}>+</div>

		{showForm && (
			<div style={modalBackdropStyle}>
				<div style={modalStyle}>
					<input type="text" placeholder="Title" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} />
					<input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} />
					<textarea placeholder="Text" value={newEventText} onChange={e => setNewEventText(e.target.value)} />
					<input type="file" onChange={handleImageUpload} />
					<input type="text" placeholder="Tags" value={newEventTags} onChange={e => setNewEventTags(e.target.value)} />
					<button onClick={handleSubmit}>Submit</button>
					<button onClick={() => setShowForm(false)}>Cancel</button>
				</div>
			</div>
		)}

      </div>
    );
};

export default Timeline;