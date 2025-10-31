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

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'multiselect' 
  | 'status' 
  | 'date' 
  | 'person' 
  | 'checkbox' 
  | 'url' 
  | 'email' 
  | 'phone' 
  | 'files';

export interface DatabaseField {
  id: string;
  name: string;
  type: FieldType;
  options?: string[]; // For select/multiselect/status
}

export interface DatabaseRow {
  id: string;
  [key: string]: any; // Dynamic fields based on database schema
}

export type DatabaseView = 'table' | 'board' | 'calendar' | 'gallery' | 'list';

export interface DatabaseSchema {
  id: string;
  name: string;
  fields: DatabaseField[];
  rows: DatabaseRow[];
  currentView?: DatabaseView;
  boardGroupBy?: string; // Field ID to group by in board view
}

export type BlockType = 'text' | 'heading1' | 'heading2' | 'heading3' | 'todo' | 'code' | 'quote' | 'divider' | 'database';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // For todo blocks
  language?: string; // For code blocks
  databaseId?: string; // For database blocks
}

export interface Page {
  id: string;
  title: string;
  icon?: string;
  blocks: Block[];
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}
