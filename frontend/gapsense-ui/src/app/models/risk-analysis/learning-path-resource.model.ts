/** Current item to resume (shown in blue card). */
export interface LearningPathResumeItem {
  title: string;
  topicName: string;
  continueLabel: string;
}

/** In-progress resource panel (embedded in step card). */
export interface LearningPathResourcePanel {
  icon: string;
  title: string;
  subtext: string;
  actionLabel: string;
}

/** Metadata row item (icon + label). */
export interface LearningPathMetadataItem {
  icon: string;
  label: string;
}
