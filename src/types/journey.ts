export type NodeShape = 'circle' | 'square' | 'diamond' | 'rectangle';
export type WorkspaceType = 'mindmap' | 'flowchart' | 'spreadsheet' | 'orgchart';

export interface TextStyle {
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
}

export interface NodeLink {
  id: string;
  url: string;
  label: string;
}

export interface JourneyNode {
  id: string;
  label: string;
  shape: NodeShape;
  color?: string;
  children?: JourneyNode[];
  details?: string;
  documents?: string[];
  textStyle?: TextStyle;
  links?: NodeLink[];
}

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  data: JourneyData;
}

export interface JourneyData {
  stages: JourneyNode[];
}

export interface Document {
  id: string;
  name: string;
  nodeId: string;
  nodePath: string;
  uploadDate: string;
}
