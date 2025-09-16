import { requireRole } from "@/lib/auth"
import { getAllActivities } from "@/lib/activities"
import DashboardLayout from "@/components/dashboard-layout"
import ActivitiesTable from "@/components/activities-table"

export default async function AdminPage() {
  const user = await requireRole("admin")
  const activities = await getAllActivities()

  return (
    <DashboardLayout user={user}>
      <div className="pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
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
              className="h-6 w-6 text-gray-700"
            >
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
          </div>
          <div className="text-sm text-gray-500 hidden md:block">
            <span>Home</span> <span className="mx-2">/</span> <span className="text-gray-900 font-semibold">Admin</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ActivitiesTable activities={activities} />
      </div>
    </DashboardLayout>
  )
}