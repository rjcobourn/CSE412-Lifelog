import React, { useState, useRef, useEffect } from "react";
import { FiFileText, FiImage } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

const Timeline = () => {
  const [events, setEvents] = useState([]);
  const eventRefs = useRef({});
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
          // Convert any image data into a blob URL
          data.timelineData.forEach((event) => {
            if (event.contenttype === "Image") {
              const blob = base64ToBlob(event.imagedata, event.imagetype);
              event.image = URL.createObjectURL(blob);
            }
          });
          // Convert null tags to empty arrays
          data.timelineData.forEach((event) => {
            if (event.tags === null) {
              event.tags = [];
            }
          });
          setEvents(data.timelineData);
          console.log(data.timelineData);
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

  const handleAddEvent = (title, entrytext, image, contentid) => {
    const newEvent = {
      contentid: contentid,
      title,
      entrytext,
      image: image ? URL.createObjectURL(image) : null,
      tags: newEventTags || [],
      contenttype: image ? "Image" : "Entry",
    };

    setEvents([...events, newEvent]);

    setTimeout(() => {
      if (eventRefs.current[contentid]) {
        eventRefs.current[contentid].scrollIntoView({
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
        })
          .then((response) => {
            // Check if the request was successful
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            handleAddEvent(
              newEventTitle,
              newEventText,
              newEventImage,
              data.contentid
            );
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
        })
          .then((response) => {
            // Check if the request was successful
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            handleAddEvent(
              newEventTitle,
              newEventText,
              newEventImage,
              data.contentid
            );
          });
      }
    } catch (error) {
      console.error("Error during submission:", error);
      // TODO: show error message
    }

    resetForm();
  };

  const handleDelete = async (contentid) => {
    try {
      await fetch("/api/delete-content", {
        method: "POST",
        body: JSON.stringify({
          contentid: contentid,
        }),
      })
        .then((response) => {
          // Check if the request was successful
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setEvents(events.filter((event) => event.contentid !== contentid));
        });
    } catch (error) {
      console.error("Error during deletion:", error);
    }
  };

  const resetForm = () => {
    setNewEventTitle("");
    setNewEventText("");
    setNewEventImage(null);
    setNewEventTags([]);
    setShowTextForm(false);
    setShowImageForm(false);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    fetch("/api/logout", {
      method: "POST",
    }).then((response) => {
      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      window.location.href = "/";
      return response.json();
    });
  };

  const timelineWidth = `calc(${(filteredEvents.length + 1) * 50}vh + 32px)`;

  return (
	<div>
	  <div>
        {/* Central header w logo and searchbar */}
	    <div className="fixed-header">
	      <div className="lifelog">
            LifeLog
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </div>
        <button
          onClick={handleLogout}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            padding: "10px",
            margin: "15px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
	  </div>
      <div className="timeline" style={{ width: timelineWidth }}>
        {filteredEvents.map((event) => (
          <div
            key={event.contentid}
            ref={(el) => (eventRefs.current[event.contentid] = el)}
            className="timeline-item"
          >
            <div
              style={{
                height: "10%",
                width: "100%",
                textAlign: "center",
                position: "relative",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <h3 style={{ verticalAlign: 'center' }}>{event.title}</h3>
              <button
                className="delete-content-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => handleDelete(event.contentid)}
              >
                <FaTrash size={15} />
              </button>
            </div>
            {event.contenttype === "Entry" && (
              <p
                style={{
                  height: "80%",
                  overflow: "auto",
                  padding: "20px",
                }}
              >
                {event.entrytext}
              </p>
            )}
            {event.contenttype === "Image" && (
              <img
                src={event.image}
                alt={event.title}
                style={{ width: "100%", height: "80%", objectFit: "cover" }}
              />
            )}
            <div style={{ height: "10%", display: "flex", alignItems: "center" }}>
              {event.tags &&
                event.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
            </div>
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
	</div>
  );
};

export default Timeline;
