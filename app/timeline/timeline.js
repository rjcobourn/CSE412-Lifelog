import React, { useState, useRef, useEffect } from "react";
import { FiFileText, FiImage } from "react-icons/fi";

const timelineEvents = [
  { id: 1, title: "Event 1", text: "", image: null },
  { id: 2, title: "Event 2", text: "", image: null },
  { id: 3, title: "Event 3", text: "", image: null },
  // ... more events
];

const Timeline = () => {
  const [events, setEvents] = useState(timelineEvents);
  const [newEventId, setNewEventId] = useState(timelineEvents.length + 1);
  const eventRefs = useRef({});

  const [showTextForm, setShowTextForm] = useState(false);
  const [showImageForm, setShowImageForm] = useState(false);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventText, setNewEventText] = useState("");
  const [newEventImage, setNewEventImage] = useState(null);
  const [newEventTags, setNewEventTags] = useState("");

  //TODO: This scrolling works but is a bit janky. Maybe try to improve it.
  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault();
      window.scrollBy({ left: 2 * event.deltaY, behavior: "smooth" });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewEventImage(file);
    }
  };

  const handleAddEvent = (title, text, image) => {
    const newEvent = {
      id: newEventId,
      title,
      text,
      image: image ? URL.createObjectURL(image) : null,
    };

    setEvents([...events, newEvent]);
    setNewEventId(newEventId + 1);

    setTimeout(() => {
      if (eventRefs.current[newEventId]) {
        eventRefs.current[newEventId].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 0);

    resetForm();
  };

  const resetForm = () => {
    setNewEventTitle("");
    setNewEventText("");
    setNewEventImage(null);
    setNewEventTags("");
    setShowTextForm(false);
    setShowImageForm(false);
  };

  const handleSubmit = async (showTextForm) => {
    //TODO: add validation / make tags work
    try {
      if (showTextForm) {
        await fetch("/api/add-text-entry", {
          method: "POST",
          body: JSON.stringify({
            title: newEventTitle,
            text: newEventText,
            tags: "{}",
          }),
        });
      } else {
        // convert image to base64 string
        const reader = new FileReader();
        reader.readAsDataURL(newEventImage);
        let base64String;
        let mimeType;
        await new Promise((resolve) => {
          reader.onload = () => {
            base64String = reader.result;
            mimeType = reader.result.split(";")[0].split(":")[1];
            resolve();
          };
        });

        await fetch("/api/add-image-entry", {
          method: "POST",
          body: JSON.stringify({
            title: newEventTitle,
            imagetype: mimeType,
            imagedata: base64String,
            tags: "{}",
          }),
        });
      }

      handleAddEvent(newEventTitle, newEventText, newEventImage);
    } catch (error) {
      console.error("Error during submission:", error);
      // TODO: show error message
    }

    resetForm();
  };

  const timelineWidth = `calc(${(events.length + 1) * 50}vh + 32px)`;

  return (
    <div className="timeline" style={{ width: timelineWidth }}>
      {events.map((event) => (
        <div
          key={event.id}
          ref={(el) => (eventRefs.current[event.id] = el)}
          className="timeline-item"
        >
          <div style={{ height: "10%", display: "flex", alignItems: "center" }}>
            <h3 style={{ padding: 0, margin: 0 }}>{event.title}</h3>
          </div>
          {event.text && <p style={{ height: "90%" }}>{event.text}</p>}
          {event.image && (
            <img
              src={event.image}
              alt={event.title}
              style={{ width: "100%", height: "90%", objectFit: "cover" }}
            />
          )}
        </div>
      ))}
      <div className="add-button" onClick={() => setShowTextForm(true)}>
        <FiFileText size={30} style={{ cursor: "pointer" }} />
      </div>
      <div className="add-button" onClick={() => setShowImageForm(true)}>
        <FiImage size={30} style={{ cursor: "pointer" }} />
      </div>

      {(showTextForm || showImageForm) && (
        <div className="modal-backdrop">
          <div className="modal">
            <input
              type="text"
              placeholder="Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
            {showTextForm && (
              <textarea
                placeholder="Text"
                value={newEventText}
                onChange={(e) => setNewEventText(e.target.value)}
              />
            )}

            {showImageForm && (
              <input type="file" onChange={handleImageUpload} />
            )}
            <input
              type="text"
              placeholder="Tags"
              value={newEventTags}
              onChange={(e) => setNewEventTags(e.target.value)}
            />
            <button onClick={() => handleSubmit(showTextForm)}>Submit</button>
            <button onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
