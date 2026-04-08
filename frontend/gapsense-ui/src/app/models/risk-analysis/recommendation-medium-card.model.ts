/** Medium-priority bento-style card data. */
export interface MediumPriorityRecommendation {
  id: string;
  topicLabel: string;
  title: string;
  description: string;
  resourceTypeIcon: string;
  resourceTypeLabel: string;
  imageUrl?: string;
  imageAlt?: string;
  resourceUrl?: string;
}
