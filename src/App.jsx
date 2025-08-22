import { useState } from "react"
import Navbar from "./components/Navbar"
import TopFilters from "./components/TopFilters"
import RulesFilter  from "./components/RulesFilter"
import TransactionTable from "../src/components/features/transactions/components/TransactionTable";


function App() {
  const [filters, setFilters] = useState({})
  const [sidebarFilters, setSidebarFilters] = useState({})

  const combinedFilters = {
    ...filters,
    ...sidebarFilters,
    selectedRules: filters.selectedRules || [],
    search: filters.search || "",
    date: sidebarFilters.selectedDateRange || "",
    priority: sidebarFilters.selectedSeverity?.[0] || ""
  }

  return (
    <div className="px-16">
      <Navbar/>
      <div className="px-14 mt-6 w-full">
         <TopFilters onFiltersChange={setFilters} />
      </div>
     
      <div className="flex py-6 gap-8 px-14">
        <div className="flex-shrink-0 w-80 h-screen">
            <RulesFilter onFiltersChange={setSidebarFilters} />
        </div>

        <div className="flex h-screen w-full">
          <TransactionTable filters={combinedFilters} />
        </div>
      </div>
    </div>
  )
}

export default App
