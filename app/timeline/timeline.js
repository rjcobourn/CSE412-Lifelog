import React, { useState, useRef, useEffect } from "react";
import { FiFileText, FiImage } from "react-icons/fi";

const Timeline = () => {
  const [events, setEvents] = useState([]);
  const eventRefs = useRef([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [showTextForm, setShowTextForm] = useState(false);
  const [showImageForm, setShowImageForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventText, setNewEventText] = useState("");
  const [newEventImage, setNewEventImage] = useState(null);
  const [newEventTags, setNewEventTags] = useState([]);

  const base64ToBlob = (base64, mimeType) => {
    // Decode the Base64 string
    const byteString = atob(base64);

    // Create an ArrayBuffer and a view (as a byte array) to reference the ArrayBuffer
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);

    // Fill the ArrayBuffer with the decoded bytes
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }

    // Create a Blob from the ArrayBuffer
    const blob = new Blob([intArray], { type: mimeType });

    return blob;
  };

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

  useEffect(() => {
    async function fetchData() {
      await fetch("http://localhost:3000/api/get-timeline-data")
        .then((response) => {
          // Check if the request was successful
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          // Convert any image data into a blob URL
          data.timelineData.forEach((event) => {
            if (event.contenttype === "Image") {
              const blob = base64ToBlob(event.imagedata, event.imagetype);
              event.image = URL.createObjectURL(blob);
            }
          });
          setEvents(data.timelineData);
        });
    }
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = events.filter((event) => {
      const hasTitle = event.title.toLowerCase().includes(searchTerm);
      const hasTags = event.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      );
      return hasTitle || hasTags;
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  const resizeTextarea = (event) => {
    event.target.style.height = "auto";
    event.target.style.height = event.target.scrollHeight + "px";
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewEventImage(file);
    }
  };

  const handleTagInput = (e) => {
    if (e.key === " " || e.key === "," || e.key === "Enter") {
      const value = e.target.value.trim();
      if (value && !newEventTags.includes(value)) {
        setNewEventTags([...newEventTags, value]);
      }
      e.target.value = "";
      e.preventDefault();
    }
  };
  const removeTag = (index) => {
    setNewEventTags(newEventTags.filter((_, idx) => idx !== index));
  };

  const handleAddEvent = (title, entrytext, image) => {
    const maxId = events.reduce((max, event) => {
      return event.contentid > max ? event.contentid : max;
    }, 0);

    const newEvent = {
      contentid: maxId + 1,
      title,
      entrytext,
      image: image ? URL.createObjectURL(image) : null,
      tags: newEventTags,
      contenttype: image ? "Image" : "Entry",
    };

    setEvents([...events, newEvent]);

    setTimeout(() => {
      if (eventRefs.current[events.length - 1]) {
        eventRefs.current[events.length - 1].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);

    resetForm();
  };

  const handleSubmit = async (showTextForm) => {
    try {
      if (showTextForm) {
        // Handle text form submission
        await fetch("/api/add-text-entry", {
          method: "POST",
          body: JSON.stringify({
            title: newEventTitle,
            text: newEventText,
            tags: newEventTags,
          }),
        });
      } else {
        // Handle image form submission
        const reader = new FileReader();
        reader.readAsDataURL(newEventImage);

        let base64String;
        let mimeType;

        await new Promise((resolve) => {
          reader.onload = () => {
            base64String = reader.result.split(",")[1];
            mimeType = reader.result.split(",")[0].split(":")[1].split(";")[0];
            resolve();
          };
        });

        await fetch("/api/add-image-entry", {
          method: "POST",
          body: JSON.stringify({
            title: newEventTitle,
            imagetype: mimeType,
            imagedata: base64String,
            tags: newEventTags,
          }),
        });
      }

      // Add event to the timeline
      handleAddEvent(newEventTitle, newEventText, newEventImage);
    } catch (error) {
      console.error("Error during submission:", error);
      // TODO: show error message
    }

    resetForm();
  };

  const resetForm = () => {
    setNewEventTitle("");
    setNewEventText("");
    setNewEventImage(null);
    setNewEventTags([]);
    setShowTextForm(false);
    setShowImageForm(false);
  };

  const timelineWidth = `calc(${(events.length + 1) * 50}vh + 32px)`;

  return (
    <div
      className="timeline"
      style={{ width: timelineWidth, position: "relative" }}
    >
      {/* Move the search input to the top left */}
      <div style={{ position: "absolute", top: 0, left: 0, padding: "10px" }}>
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
      </div>
      {filteredEvents.map((event) => (
        <div
          key={event.contentid}
          ref={(el) => (eventRefs.current[event.contentid] = el)}
          className="timeline-item"
        >
          <div style={{ height: "10%", display: "flex", alignItems: "center" }}>
            <h3 style={{ padding: 0, margin: 0 }}>{event.title}</h3>
          </div>
          {event.contenttype === "Entry" && (
            <p style={{ height: "90%" }}>{event.entrytext}</p>
          )}
          {event.contenttype === "Image" && (
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
                onInput={resizeTextarea}
                className="event-text-input"
              />
            )}
            {showImageForm && (
              <input type="file" onChange={handleImageUpload} />
            )}
            <div className="tags-input-container">
              {newEventTags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button
                    onClick={() => removeTag(index)}
                    className="tag-delete-btn"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Tags"
              onKeyDown={handleTagInput}
              className="tags-input"
            />
            <div className="submit-cancel-buttons">
              <button
                className="submit-button"
                onClick={() => handleSubmit(showTextForm)}
              >
                Submit
              </button>
              <button className="cancel-button" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
