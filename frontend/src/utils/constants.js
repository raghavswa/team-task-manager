export const TASK_STATUS = {
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  review: { label: 'Review', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  done: { label: 'Done', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

export const TASK_PRIORITY = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

export const PROJECT_STATUS = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
};

export const MEMBER_ROLE = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
  member: { label: 'Member', color: 'bg-gray-100 text-gray-600' },
};
