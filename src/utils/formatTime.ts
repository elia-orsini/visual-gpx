export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  let timeString = "";

  if (hours > 0) {
    timeString += `${hours}h `;
  }

  if (minutes > 0 || hours > 0) {
    // Always show minutes if hours are present
    timeString += `${minutes}m`;
  }

  // Only show seconds if there are no hours
  if (hours === 0 && remainingSeconds > 0) {
    timeString += ` ${remainingSeconds}s`;
  }

  return timeString.trim();
}
