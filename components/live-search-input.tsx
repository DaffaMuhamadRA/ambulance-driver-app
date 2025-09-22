"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"

interface LiveSearchInputProps {
  items: Array<{ id: number; [key: string]: any }>
  onSelect: (item: any) => void
  placeholder?: string
  displayKey: string
  searchKeys: string[]
  onCreate?: () => void
  createButtonText?: string
  initialValue?: string
  initialItemId?: number
  name?: string // Untuk atribut name pada input hidden
  // New props for auto-fill functionality
  onAutoFill?: (item: any) => void
  // New prop to allow clearing the field
  allowClear?: boolean
}

export default function LiveSearchInput({
  items,
  onSelect,
  placeholder = "Search...",
  displayKey,
  searchKeys,
  onCreate,
  createButtonText = "Create New",
  initialValue = "",
  initialItemId,
  name,
  onAutoFill, // New prop for auto-fill functionality
  allowClear = false // New prop to allow clearing the field
}: LiveSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(initialItemId || null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  // Memoize the items array to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => items, [items])
  
  // Create a stable string representation of searchKeys for dependencies
  const searchKeysString = useMemo(() => searchKeys.join(','), [searchKeys])

  // Initialize the component only once
  useEffect(() => {
    if (!initializedRef.current && memoizedItems.length > 0 && (initialItemId !== undefined || initialValue)) {
      initializedRef.current = true
      
      if (initialItemId !== undefined) {
        // Find item by ID first
        const item = memoizedItems.find(item => item.id === initialItemId);
        if (item) {
          setSearchTerm(item[displayKey]);
          setSelectedItemId(item.id);
          return;
        }
      }
      
      // If we can't find by ID but have an initial value, try to find by value
      if (initialValue) {
        setSearchTerm(initialValue);
        // Try to find matching item by name for ID
        const matchingItem = memoizedItems.find(item => 
          searchKeys.some(key => 
            item[key] && item[key].toString().toLowerCase() === initialValue.toLowerCase()
          )
        );
        if (matchingItem) {
          setSelectedItemId(matchingItem.id);
        }
      }
    }
  }, [memoizedItems, initialItemId, displayKey, searchKeysString, initialValue])

  // Filter items based on search term - with proper dependency handling
  useEffect(() => {
    if (searchTerm) {
      const filtered = memoizedItems.filter(item => 
        searchKeys.some(key => 
          item[key] && item[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      setFilteredItems(filtered)
      setShowDropdown(true)
      
      // Auto-fill functionality: if there's exactly one match, auto-fill the form
      if (filtered.length === 1 && onAutoFill) {
        onAutoFill(filtered[0]);
      }
    } else {
      setFilteredItems([])
      // Only show dropdown when user is actively searching, not based on initial value
      setShowDropdown(false)
    }
  }, [searchTerm, memoizedItems, searchKeysString, onAutoFill])

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
    setSearchTerm(item[displayKey]);
    setSelectedItemId(item.id);
    onSelect(item);
    setShowDropdown(false);
  }

  // Function to clear the search field
  const handleClear = useCallback(() => {
    setSearchTerm('');
    setSelectedItemId(null);
    // Call onSelect with null to clear the selection in the parent component
    onSelect(null);
    setShowDropdown(false);
  }, [onSelect])

  // Function to handle manual changes to the search term
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // If the user clears the field manually, also clear the selection
    if (value === '') {
      setSelectedItemId(null);
      onSelect(null);
    }
  }, [onSelect])

  // Function to format item display text
  const formatItemDisplay = useCallback((item: any) => {
    // Special handling for pemesan items to show "nama_pemesan (hp)" format
    if (displayKey === "nama_pemesan" && item.hp) {
      return `${item[displayKey]} (${item.hp})`;
    }
    // For other items or when hp is not available, just show the displayKey value
    return item[displayKey];
  }, [displayKey])

  const handleCreate = useCallback(() => {
    if (onCreate) {
      onCreate();
    }
    setShowDropdown(false);
  }, [onCreate])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input hidden untuk menyimpan ID */}
      <input 
        type="hidden" 
        name={name} 
        value={selectedItemId || ''} 
      />
      
      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => {
                // Show dropdown when there's a search term or when we have items to show
                if (searchTerm || memoizedItems.length > 0) {
                  setShowDropdown(true);
                }
              }}
              className="block w-full px-3 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm pr-10"
              placeholder={placeholder}
            />
            {allowClear && (searchTerm || selectedItemId) && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelect(item)}
                  >
                    {formatItemDisplay(item)}
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
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-t border-gray-200 text-blue-600 font-medium"
                  onClick={handleCreate}
                >
                  + Tambah data baru
                </div>
              )}
            </div>
          )}
        </div>
        {onCreate && (
          <button
            type="button"
            onClick={handleCreate}
            className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            +
          </button>
        )}
      </div>
    </div>
  )
}