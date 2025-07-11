
/**
 * Helper functions for the matchmaking page
 */

export const formatTimeRemaining = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();
  const timeOpen = now.getTime() - created.getTime();
  const minutesOpen = Math.floor(timeOpen / (1000 * 60));
  
  if (minutesOpen < 60) {
    return `${minutesOpen}m`;
  } else {
    const hoursOpen = Math.floor(minutesOpen / 60);
    const remainingMinutes = minutesOpen % 60;
    return `${hoursOpen}h ${remainingMinutes}m`;
  }
};

/**
 * Generate a random lobby code
 */
export const generateLobbyCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Get the status badge variant based on match status
 */
export const getMatchStatusVariant = (status: string): "default" | "outline" | "secondary" | "destructive" | "success" => {
  switch (status) {
    case 'pending':
      return 'outline';
    case 'in_progress':
    case 'active':
      return 'secondary';
    case 'completed':
      return 'success';
    case 'disputed':
    case 'cancelled':
      return 'destructive';
    default:
      return 'default';
  }
};

/**
 * Get user-friendly status text
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Waiting for opponent';
    case 'in_progress':
    case 'active':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'disputed':
      return 'Disputed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 * Validate a match result submission
 */
export const validateMatchResult = (resultType: string, proofImages: File[]): { valid: boolean; message?: string } => {
  if (!['win', 'loss', 'draw', 'dispute'].includes(resultType)) {
    return { valid: false, message: "Invalid result type" };
  }
  
  if (proofImages.length === 0) {
    return { valid: false, message: "Please upload at least one screenshot as proof" };
  }
  
  if (proofImages.some(file => file.size > 5 * 1024 * 1024)) {
    return { valid: false, message: "Some images exceed the 5MB limit" };
  }
  
  return { valid: true };
};

/**
 * Format match duration
 */
export const formatMatchDuration = (startTime: string, endTime: string | null): string => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  
  const durationMs = end.getTime() - start.getTime();
  const minutes = Math.floor(durationMs / (1000 * 60));
  
  if (minutes < 60) {
    return `${minutes} minutes`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
};
