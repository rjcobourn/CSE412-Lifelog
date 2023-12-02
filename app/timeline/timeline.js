import React, { useState } from 'react';

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

const timelineEvents = [
	{ id: 1, title: 'Event 1', date: '2023-01-01' },
	{ id: 2, title: 'Event 2', date: '2023-01-02' },
	{ id: 3, title: 'Event 3', date: '2023-01-03' },
	{ id: 4, title: 'Event 4', date: '2023-01-04' },
	{ id: 5, title: 'Event 5', date: '2023-01-05' },
	{ id: 6, title: 'Event 6', date: '2023-01-06' },
	{ id: 7, title: 'Event 7', date: '2023-01-07' },
	{ id: 8, title: 'Event 8', date: '2023-01-08' },
	{ id: 9, title: 'Event 9', date: '2023-01-09' },
	// ... more events
];


const Timeline = () => {
	const [events, setEvents] = useState(timelineEvents);
  
	const handleAddEvent = () => {
	  // Logic for add button?
	};

	return (
	  <div style={timelineStyle}>
		{events.map(event => (
		  <div key={event.id} style={itemStyle}>
			<h3>{event.title}</h3>
			<p>{event.date}</p>
		  </div>
		))}
		<div style={addButtonStyle} onClick={handleAddEvent}>+</div>
	  </div>
	);
  };
  
  export default Timeline;
