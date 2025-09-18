"use client"

import { useState, useEffect, useRef } from "react"

interface LiveSearchInputProps {
  items: Array<{ id: number; [key: string]: any }>
  onSelect: (item: any) => void
  placeholder?: string
  displayKey: string
  searchKeys: string[]
  onCreate?: () => void
  createButtonText?: string
  initialValue?: string // Add this prop for initial value
}

export default function LiveSearchInput({
  items,
  onSelect,
  placeholder = "Search...",
  displayKey,
  searchKeys,
  onCreate,
  createButtonText = "Create New",
  initialValue = "" // Add default value
}: LiveSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue) // Use initialValue as initial state

  // Update search term when initialValue changes
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter items based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(item => 
        searchKeys.some(key => 
          item[key] && item[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      setFilteredItems(filtered)
      setShowDropdown(true)
    } else {
      setFilteredItems([])
      setShowDropdown(false)
    }
  }, [searchTerm, items, searchKeys])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (item: any) => {
    setSearchTerm(item[displayKey])
    onSelect(item)
    setShowDropdown(false)
  }

  const handleCreate = () => {
    if (onCreate) {
      onCreate()
    }
    setShowDropdown(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm && setShowDropdown(true)}
            className="block w-full px-3 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder={placeholder}
          />
          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelect(item)}
                  >
                    {item[displayKey]}
                  </div>
                ))
              ) : searchTerm ? (
                <div className="px-4 py-2 text-gray-500">
                  No results found
                </div>
              ) : (
                <div className="px-4 py-2 text-gray-500">
                  No results found
                </div>
              )}
              {onCreate && (
                <div 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-t border-gray-200 text-green-600 font-medium"
                  onClick={handleCreate}
                >
                  {createButtonText}
                </div>
              )}
            </div>
          )}
        </div>
        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            +
          </button>
        )}
      </div>
    </div>
  )
}