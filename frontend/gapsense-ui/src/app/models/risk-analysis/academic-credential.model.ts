export interface AcademicCredentialView {
  id: string;
  icon: string;
  label: string;
  /** When true, shown faded/disabled. */
  inactive?: boolean;
  /** Optional icon color class (e.g. text-blue-600, text-amber-500). */
  iconColorClass?: string;
}
