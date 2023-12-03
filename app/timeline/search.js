import React, { useState } from 'react'

const TagSearch = ({ tagsList }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTags, setFilteredTags] = useState([])

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    const filtered = tagsList.filter((tag) => tag.toLowerCase().includes(term))
    setFilteredTags(filtered)
  }

  return (
    <div>
      <input
        type='text'
        placeholder='Search tags...'
        value={searchTerm}
        onChange={handleSearch}
      />
      <ul>
        {filteredTags.map((tag, index) => (
          <li key={index}>{tag}</li>
        ))}
      </ul>
    </div>
  )
}

export default TagSearch
