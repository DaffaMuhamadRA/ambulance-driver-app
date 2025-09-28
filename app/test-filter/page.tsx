"use client"

import { useState, useEffect } from "react"
import ActivityFilter from "@/components/activity-filter"

export default function TestFilterPage() {
  const [filters, setFilters] = useState({})
  const [isFilterVisible, setIsFilterVisible] = useState(true)

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    console.log("Filters updated:", newFilters)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Filter Component</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Current Filters:</h2>
        <pre>{JSON.stringify(filters, null, 2)}</pre>
      </div>
      <ActivityFilter 
        isAdmin 
        onFilterChange={handleFilterChange}
        isFilterVisible={isFilterVisible}
        setIsFilterVisible={setIsFilterVisible}
      />
    </div>
  )
}
