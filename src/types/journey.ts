export type NodeShape = 'circle' | 'square' | 'diamond' | 'rectangle';

export interface JourneyNode {
  id: string;
  label: string;
  shape: NodeShape;
  color?: string;
  children?: JourneyNode[];
  details?: string;
  documents?: string[];
}

export interface JourneyData {
  stages: JourneyNode[];
}
