import { useState } from "react"
import Navbar from "./components/Navbar"
import TopFilters from "./components/TopFilters"
import RulesFilter  from "./components/RulesFilter"
import TransactionTable  from "./components/TransactionTable"


function App() {
  const [filters, setFilters] = useState({})
  const [sidebarFilters, setSidebarFilters] = useState({})

  // Properly merge filters, ensuring arrays are combined correctly
  const combinedFilters = {
    ...filters,
    ...sidebarFilters,
    selectedRules: filters.selectedRules || [],
    search: filters.search || "",
    date: filters.date || "",
    priority: sidebarFilters.selectedSeverity?.[0] || ""
  }

  return (
    <div className="px-16">
      <Navbar/>
      <TopFilters onFiltersChange={setFilters} />
      <div className="flex py-6 gap-8">
        {/* Left filters column */}
        <div className="flex-shrink-0 w-80 h-screen">
            <RulesFilter onFiltersChange={setSidebarFilters} />
        </div>

        {/* Right table column */}
        <div className="flex h-screen">
          <TransactionTable filters={combinedFilters} />
        </div>
      </div>
    </div>
  )
}

export default App
