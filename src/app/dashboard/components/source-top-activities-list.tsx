import { ActivityWithTasksAndTimeEntries } from "@/types";
import { ActivityCard } from "@/components/activity-card";

type SourceTopActivitiesListProps = {
  activities: ActivityWithTasksAndTimeEntries[];
};

export function SourceTopActivitiesList({
  activities,
}: SourceTopActivitiesListProps) {
  if (activities.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Top templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <ActivityCard activity={activity} key={activity.id} />
        ))}
      </div>
    </div>
  );
}
