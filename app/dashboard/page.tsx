import { requireRole } from "@/lib/auth"
import { getActivities } from "@/lib/activities"
import DashboardLayout from "@/components/dashboard-layout"
import ActivitiesGrid from "@/components/activities-grid"

export default async function DashboardPage() {
  const user = await requireRole("driver")
  const activities = await getActivities(user.id)

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
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800">Aktivitas</h1>
          </div>
          <div className="text-sm text-gray-500 hidden md:block">
            <span>Home</span> <span className="mx-2">/</span>{" "}
            <span className="text-gray-900 font-semibold">Aktivitas</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ActivitiesGrid activities={activities} />
      </div>
    </DashboardLayout>
  )
}
