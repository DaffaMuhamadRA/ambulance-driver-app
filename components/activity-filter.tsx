"use client"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Driver {
  id: number
  name: string
  status: string
}

interface ActivityFilterProps {
  isAdmin?: boolean
  onFilterChange: (filters: {
    dateFrom?: string
    dateTo?: string
    driverId?: string
    location?: string
  }) => void
  isFilterVisible: boolean
  setIsFilterVisible: (visible: boolean) => void
}

export interface ActivityFilterRef {
  applyFilters: () => void
}

const ActivityFilter = forwardRef<ActivityFilterRef, ActivityFilterProps>(({ 
  isAdmin = false, 
  onFilterChange,
  isFilterVisible,
  setIsFilterVisible
}, ref) => {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [driverId, setDriverId] = useState("")
  const [location, setLocation] = useState("")
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loadingDrivers, setLoadingDrivers] = useState(false)
  
  // Store current filter values
  const currentFilters = useRef({
    dateFrom: "",
    dateTo: "",
    driverId: "",
    location: ""
  })

  // Fetch drivers when component mounts (for admin)
  useEffect(() => {
    if (isAdmin) {
      fetchDrivers()
    }
  }, [isAdmin])

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true)
      const response = await fetch("/api/reference/drivers")
      if (response.ok) {
        const data = await response.json()
        setDrivers(data)
      } else {
        console.error("Failed to fetch drivers")
      }
    } catch (error) {
      console.error("Error fetching drivers:", error)
    } finally {
      setLoadingDrivers(false)
    }
  }

  // Expose applyFilters function to parent components
  useImperativeHandle(ref, () => ({
    applyFilters: handleApplyFilters
  }))

  // Update current filter values
  const updateCurrentFilters = () => {
    currentFilters.current = {
      dateFrom,
      dateTo,
      driverId,
      location
    }
  }

  // Apply filters only when Apply button is clicked
  const handleApplyFilters = () => {
    updateCurrentFilters()
    
    const filters: any = {}
    
    if (dateFrom) filters.dateFrom = dateFrom
    if (dateTo) filters.dateTo = dateTo
    if (isAdmin && driverId) filters.driverId = driverId
    if (location) filters.location = location
    
    // Call onFilterChange with the new filters
    console.log("Applying filters:", filters)
    onFilterChange(filters)
  }

  const handleReset = () => {
    setDateFrom("")
    setDateTo("")
    setDriverId("")
    setLocation("")
  }

  // Render the filter icon button that can be used externally
  const renderFilterIcon = () => (
    <button
      onClick={() => setIsFilterVisible(!isFilterVisible)}
      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    </button>
  )

  return (
    <>
      {/* Filter Icon - This will be rendered by the parent component */}
      {/* Filter Area - Hidden by default */}
      {isFilterVisible && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Driver</label>
                  {loadingDrivers ? (
                    <div className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm">
                      Memuat data driver...
                    </div>
                  ) : (
                    <select
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Pilih Driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id.toString()}>
                          {driver.name} {driver.status ? `(${driver.status})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <Input
                  type="text"
                  placeholder="Dari atau tujuan..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="px-4 py-2"
              >
                Reset
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  handleApplyFilters()
                }}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700"
              >
                Terapkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
})

ActivityFilter.displayName = "ActivityFilter"

export default ActivityFilter
