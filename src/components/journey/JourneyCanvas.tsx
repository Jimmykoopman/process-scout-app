import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import { DetailPanel } from './DetailPanel';
import { Toolbar } from './Toolbar';
import { AppSidebar } from './Sidebar';
import { ExpandedNodeView } from './ExpandedNodeView';
import { JourneyNode, NodeShape, Workspace, Document, TextStyle, WorkspaceType, NodeLink, WorkspacePage, Page, PageType } from '@/types/journey';
import { PageEditor } from '@/components/pages/PageEditor';
import { sampleJourneyData } from '@/data/sampleJourney';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DatabaseManager } from '@/components/database/DatabaseManager';
import { PageManager } from '@/components/pages/PageManager';
import { DocumentLibrary } from './DocumentLibrary';
import { TemplateSelector } from './TemplateSelector';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const nodeTypes = {
  custom: CustomNode,
};

export const JourneyCanvas = () => {
  const [selectedNode, setSelectedNode] = useState<JourneyNode | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<JourneyNode[]>([]);
  const [selectedShape, setSelectedShape] = useState<NodeShape>('circle');
  const [expandedNode, setExpandedNode] = useState<JourneyNode | null>(null);
  
  // Workspace management
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: 'default', name: 'Klant Reis', type: 'mindmap', data: { stages: [] } }
  ]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState('default');
  
  // Document management
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Journey nodes with text styles and links - per page
  const [pageData, setPageData] = useState<Record<string, any>>({
    'default': { stages: [] }
  });
  
  // View management
  const [currentView, setCurrentView] = useState<'home' | 'inbox' | 'journey' | 'database' | 'pages' | 'documenten' | 'workspace-page' | 'template-selector'>('home');
  const [selectedPage, setSelectedPage] = useState<WorkspacePage | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [workspacePages, setWorkspacePages] = useState<Record<string, WorkspacePage[]>>({});
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [templateSelectorTarget, setTemplateSelectorTarget] = useState<{ type: 'private' } | { type: 'workspace', workspaceId: string } | null>(null);

  // Get current page data
  const getCurrentPageKey = () => {
    if (selectedPage) return selectedPage.id;
    return 'default';
  };

  const journeyData = pageData[getCurrentPageKey()] || { stages: [] };
  const stages: JourneyNode[] = Array.isArray(journeyData?.stages) ? journeyData.stages : [];

  // Handler functions defined first
  const handleNodeClick = useCallback((node: JourneyNode, parentBreadcrumbs: JourneyNode[] = []) => {
    setSelectedNode(node);
    setBreadcrumbs([...parentBreadcrumbs, node]);
    setExpandedNode(node);
  }, []);

  const handleNodeDoubleClick = useCallback((node: JourneyNode) => {
    // Open first link if available
    if (node.links && node.links.length > 0) {
      window.open(node.links[0].url, '_blank');
    }
  }, []);

  // Convert journey data to React Flow nodes
  const createNodesFromData = useCallback(() => {
    const nodes: Node[] = [];
    const xSpacing = 250;
    const ySpacing = 150;

    if (!stages || stages.length === 0) {
      return nodes;
    }

    stages.forEach((stage, index) => {
      nodes.push({
        id: stage.id,
        type: 'custom',
        position: { x: index * xSpacing, y: 300 },
        data: {
          label: stage.label,
          shape: stage.shape,
          color: stage.color,
          textStyle: stage.textStyle,
          onClick: () => handleNodeClick(stage),
          onDoubleClick: () => handleNodeDoubleClick(stage),
          onAddNodeDirection: undefined, // Will be set later
        },
      });

      // Add children nodes
      if (stage.children) {
        stage.children.forEach((child, childIndex) => {
          nodes.push({
            id: child.id,
            type: 'custom',
            position: { x: index * xSpacing - 100 + childIndex * 120, y: 300 + ySpacing },
            data: {
              label: child.label,
              shape: child.shape,
              textStyle: child.textStyle,
              onClick: () => handleNodeClick(child, [stage]),
              onDoubleClick: () => handleNodeDoubleClick(child),
              onAddNodeDirection: undefined, // Will be set later
            },
          });
        });
      }
    });

    return nodes;
  }, [stages, handleNodeClick, handleNodeDoubleClick]);

  const createEdgesFromData = useCallback(() => {
    const edges: Edge[] = [];
    let edgeId = 0;

    if (!stages || stages.length === 0) {
      return edges;
    }

    stages.forEach((stage, index) => {
      // Connect stages
      if (index < stages.length - 1) {
        edges.push({
          id: `e${edgeId++}`,
          source: stage.id,
          target: stages[index + 1].id,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { stroke: '#0891B2', strokeWidth: 2 },
        });
      }

      // Connect children to parent
      if (stage.children) {
        stage.children.forEach((child) => {
          edges.push({
            id: `e${edgeId++}`,
            source: stage.id,
            target: child.id,
            type: 'smoothstep',
            style: { stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '5,5' },
          });
        });
      }
    });

    return edges;
  }, [stages]);

  const [nodes, setNodes, onNodesChange] = useNodesState(createNodesFromData());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdgesFromData());

  const handleChildClick = useCallback((child: JourneyNode) => {
    setSelectedNode(child);
    setBreadcrumbs([...breadcrumbs, child]);
  }, [breadcrumbs]);

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
    setBreadcrumbs([]);
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeDrag = useCallback(
    (_event: any, node: Node) => {
      const draggedNode = node;
      const snapDistance = 50; // Distance to trigger snap
      
      // Find connected nodes
      const connectedNodeIds = new Set<string>();
      edges.forEach(edge => {
        if (edge.source === draggedNode.id) connectedNodeIds.add(edge.target);
        if (edge.target === draggedNode.id) connectedNodeIds.add(edge.source);
      });

      // Check for horizontal/vertical alignment with connected nodes
      nodes.forEach((n) => {
        if (n.id !== draggedNode.id && connectedNodeIds.has(n.id)) {
          const dx = Math.abs(n.position.x - draggedNode.position.x);
          const dy = Math.abs(n.position.y - draggedNode.position.y);

          // Snap horizontally (same Y)
          if (dy < snapDistance && dx > snapDistance) {
            setNodes((nds) =>
              nds.map((nd) =>
                nd.id === draggedNode.id
                  ? { ...nd, position: { ...nd.position, y: n.position.y } }
                  : nd
              )
            );
          }

          // Snap vertically (same X)
          if (dx < snapDistance && dy > snapDistance) {
            setNodes((nds) =>
              nds.map((nd) =>
                nd.id === draggedNode.id
                  ? { ...nd, position: { ...nd.position, x: n.position.x } }
                  : nd
              )
            );
          }
        }
      });
    },
    [nodes, edges, setNodes]
  );

  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      // Find closest node within connection distance (150px)
      const draggedNode = node;
      const connectionDistance = 150;
      
      let closestNode: Node | null = null;
      let minDistance = connectionDistance;

      nodes.forEach((n) => {
        if (n.id !== draggedNode.id) {
          const distance = Math.sqrt(
            Math.pow(n.position.x - draggedNode.position.x, 2) +
            Math.pow(n.position.y - draggedNode.position.y, 2)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            closestNode = n;
          }
        }
      });

      // Create edge if close enough to another node
      if (closestNode) {
        const newEdge: Edge = {
          id: `e${draggedNode.id}-${closestNode.id}-${Date.now()}`,
          source: draggedNode.id,
          target: closestNode.id,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { stroke: '#0891B2', strokeWidth: 2 },
        };
        
        setEdges((eds) => [...eds, newEdge]);
        toast.success('Nodes verbonden');
      }
    },
    [nodes, setEdges]
  );

  const handleAddNode = useCallback(() => {
    const pageKey = getCurrentPageKey();
    const newJourneyNode: JourneyNode = {
      id: `node-${Date.now()}`,
      label: 'Nieuwe node',
      shape: selectedShape,
      color: '#0891B2',
      textStyle: { fontSize: 16, fontWeight: 'normal', fontStyle: 'normal' },
    };

    // Add to journey data
    setPageData(prev => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        stages: [...(prev[pageKey]?.stages || []), newJourneyNode]
      }
    }));

    // Add to React Flow
    const newNode: Node = {
      id: newJourneyNode.id,
      type: 'custom',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        label: newJourneyNode.label,
        shape: newJourneyNode.shape,
        color: newJourneyNode.color,
        textStyle: newJourneyNode.textStyle,
        onClick: () => handleNodeClick(newJourneyNode),
        onDoubleClick: () => handleNodeDoubleClick(newJourneyNode),
        onAddNodeDirection: handleAddNodeFromDirection,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    toast.success('Node toegevoegd');
  }, [selectedShape, setNodes, selectedPage, handleNodeClick, handleNodeDoubleClick]);

  const handleAddNodeFromDirection = useCallback((sourceNodeId: string, direction: 'left' | 'right' | 'top' | 'bottom') => {
    const pageKey = getCurrentPageKey();
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return;

    const offset = 250;
    let newPosition = { ...sourceNode.position };
    
    switch (direction) {
      case 'left':
        newPosition.x -= offset;
        break;
      case 'right':
        newPosition.x += offset;
        break;
      case 'top':
        newPosition.y -= offset;
        break;
      case 'bottom':
        newPosition.y += offset;
        break;
    }

    const newJourneyNode: JourneyNode = {
      id: `node-${Date.now()}`,
      label: 'Nieuwe node',
      shape: 'circle',
      color: '#0891B2',
      textStyle: { fontSize: 16, fontWeight: 'normal', fontStyle: 'normal' },
    };

    // Add to journey data
    setPageData(prev => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        stages: [...(prev[pageKey]?.stages || []), newJourneyNode]
      }
    }));

    // Add to React Flow - reference to self through callback
    const createNodeWithCallback = () => {
      const newNode: Node = {
        id: newJourneyNode.id,
        type: 'custom',
        position: newPosition,
        data: {
          label: newJourneyNode.label,
          shape: newJourneyNode.shape,
          color: newJourneyNode.color,
          textStyle: newJourneyNode.textStyle,
          onClick: () => handleNodeClick(newJourneyNode),
          onDoubleClick: () => handleNodeDoubleClick(newJourneyNode),
          onAddNodeDirection: handleAddNodeFromDirection,
        },
      };
      return newNode;
    };

    // Create edge between nodes with correct handles based on direction
    const handleMap = {
      'top': { sourceHandle: 's-top', targetHandle: 't-bottom' },
      'bottom': { sourceHandle: 's-bottom', targetHandle: 't-top' },
      'left': { sourceHandle: 's-left', targetHandle: 't-right' },
      'right': { sourceHandle: 's-right', targetHandle: 't-left' },
    } as const;
    
    const handles = handleMap[direction];
    const newEdge: Edge = {
      id: `e${sourceNodeId}-${newJourneyNode.id}`,
      source: sourceNodeId,
      target: newJourneyNode.id,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: { stroke: '#0891B2', strokeWidth: 2 },
    };

    setNodes((nds) => [...nds, createNodeWithCallback()]);
    setEdges((eds) => [...eds, newEdge]);
    toast.success('Node toegevoegd');
  }, [nodes, setNodes, setEdges, selectedPage, handleNodeClick, handleNodeDoubleClick]);

  // Update existing nodes with the handleAddNodeFromDirection callback
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onAddNodeDirection: handleAddNodeFromDirection,
        },
      }))
    );
  }, [handleAddNodeFromDirection, setNodes]);

  const handleDocumentUpload = useCallback((nodeId: string, files: FileList) => {
    const pageKey = getCurrentPageKey();
    const currentData = pageData[pageKey] || { stages: [] };
    const fileNames = Array.from(files).map(f => f.name);
    const nodePath = findNodePath(nodeId, currentData.stages);
    
    const newDocuments: Document[] = fileNames.map((name, index) => ({
      id: `${nodeId}-doc-${Date.now()}-${index}`,
      name,
      nodeId,
      nodePath,
      uploadDate: new Date().toISOString(),
    }));
    
    setDocuments(prev => [...prev, ...newDocuments]);
    toast.success(`${fileNames.length} document(en) geüpload`);
  }, [pageData, selectedPage]);

  const findNodePath = (nodeId: string, stages: JourneyNode[], path: string = ''): string => {
    for (const stage of stages) {
      const currentPath = path ? `${path} > ${stage.label}` : stage.label;
      if (stage.id === nodeId) return currentPath;
      if (stage.children) {
        const childPath = findNodePath(nodeId, stage.children, currentPath);
        if (childPath) return childPath;
      }
    }
    return '';
  };

  const handleNodeLabelChange = useCallback((nodeId: string, newLabel: string) => {
    const pageKey = getCurrentPageKey();
    const updateNodeLabel = (nodes: JourneyNode[]): JourneyNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, label: newLabel };
        }
        if (node.children) {
          return { ...node, children: updateNodeLabel(node.children) };
        }
        return node;
      });
    };
    
    setPageData(prev => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], stages: updateNodeLabel(prev[pageKey]?.stages || []) }
    }));
    
    // Update React Flow nodes
    setNodes(nodes => nodes.map(node => 
      node.id === nodeId ? { ...node, data: { ...node.data, label: newLabel } } : node
    ));
    
    toast.success('Node naam bijgewerkt');
  }, [selectedPage, setNodes]);

  const handleTextStyleChange = useCallback((nodeId: string, style: Partial<TextStyle>) => {
    const pageKey = getCurrentPageKey();
    const updateNodeStyle = (nodes: JourneyNode[]): JourneyNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, textStyle: { ...node.textStyle, ...style } as TextStyle };
        }
        if (node.children) {
          return { ...node, children: updateNodeStyle(node.children) };
        }
        return node;
      });
    };
    
    setPageData(prev => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], stages: updateNodeStyle(prev[pageKey]?.stages || []) }
    }));
    
    // Update React Flow nodes to show the change immediately
    setNodes(nodes => nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            textStyle: { ...node.data.textStyle, ...style } as TextStyle
          }
        };
      }
      return node;
    }));
    
    toast.success('Tekst formatting bijgewerkt');
  }, [selectedPage, setNodes]);

  const handleLinkAdd = useCallback((nodeId: string, url: string, label: string) => {
    const pageKey = getCurrentPageKey();
    const updateNodeLinks = (nodes: JourneyNode[]): JourneyNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          const newLink: NodeLink = { id: `${nodeId}-link-${Date.now()}`, url, label };
          return { ...node, links: [...(node.links || []), newLink] };
        }
        if (node.children) {
          return { ...node, children: updateNodeLinks(node.children) };
        }
        return node;
      });
    };
    
    setPageData(prev => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], stages: updateNodeLinks(prev[pageKey]?.stages || []) }
    }));
    toast.success('Link toegevoegd');
  }, [selectedPage]);

  const handleLinkRemove = useCallback((nodeId: string, linkId: string) => {
    const pageKey = getCurrentPageKey();
    const updateNodeLinks = (nodes: JourneyNode[]): JourneyNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, links: node.links?.filter(l => l.id !== linkId) };
        }
        if (node.children) {
          return { ...node, children: updateNodeLinks(node.children) };
        }
        return node;
      });
    };
    
    setPageData(prev => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], stages: updateNodeLinks(prev[pageKey]?.stages || []) }
    }));
    toast.success('Link verwijderd');
  }, [selectedPage]);

  const handleAddWorkspace = useCallback((name: string, type: WorkspaceType) => {
    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name,
      type,
      data: { stages: [] },
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    setCurrentWorkspaceId(newWorkspace.id);
    setWorkspacePages(prev => ({ ...prev, [newWorkspace.id]: [] }));
    toast.success(`Workspace "${name}" aangemaakt`);
  }, []);

  const handleRenameWorkspace = useCallback((workspaceId: string, newName: string) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, name: newName } : w
    ));
    toast.success('Workspace hernoemd');
  }, []);

  const handleDeleteWorkspace = useCallback((workspaceId: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
    setWorkspacePages(prev => {
      const newPages = { ...prev };
      delete newPages[workspaceId];
      return newPages;
    });
    if (currentWorkspaceId === workspaceId) {
      const remaining = workspaces.filter(w => w.id !== workspaceId);
      if (remaining.length > 0) {
        setCurrentWorkspaceId(remaining[0].id);
      }
    }
    toast.success('Workspace verwijderd');
  }, [currentWorkspaceId, workspaces]);

  const handleDeleteWorkspacePage = useCallback((workspaceId: string, pageId: string) => {
    setWorkspacePages(prev => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).filter(p => p.id !== pageId)
    }));
    if (selectedPage?.id === pageId) {
      setSelectedPage(null);
      setCurrentView('home');
    }
    toast.success('Pagina verwijderd');
  }, [selectedPage]);

  const handleRenameWorkspacePage = useCallback((workspaceId: string, pageId: string, newTitle: string) => {
    setWorkspacePages(prev => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).map(p =>
        p.id === pageId ? { ...p, title: newTitle, updatedAt: new Date().toISOString() } : p
      )
    }));
    if (selectedPage?.id === pageId) {
      setSelectedPage(prev => prev ? { ...prev, title: newTitle } : null);
    }
    toast.success('Pagina hernoemd');
  }, [selectedPage]);

  const handleAddPageToWorkspace = useCallback((workspaceId: string, pageType: PageType) => {
    const typeNames = {
      mindmap: 'Mindmap',
      document: 'Document',
      database: 'Database',
      form: 'Formulier'
    };
    
    const newPage: WorkspacePage = {
      id: `page-${Date.now()}`,
      title: `Nieuwe ${typeNames[pageType]}`,
      type: pageType,
      workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Initialize empty data for the new page
    setPageData(prev => ({
      ...prev,
      [newPage.id]: pageType === 'mindmap' ? { stages: [] } : (pageType === 'document' ? { blocks: [] } : {})
    }));
    
    // Add to workspace pages ONLY
    setWorkspacePages(prev => ({
      ...prev,
      [workspaceId]: [...(prev[workspaceId] || []), newPage]
    }));
    
    setSelectedPage(newPage);
    setCurrentView('workspace-page');
    toast.success(`${typeNames[pageType]} aangemaakt`);
  }, []);

  const handleWorkspaceChange = useCallback((workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setPageData(prev => ({
        ...prev,
        'default': workspace.data
      }));
      toast.info(`Workspace "${workspace.name}" geladen`);
    }
  }, [workspaces]);

  const handleDocumentClick = useCallback((doc: Document) => {
    toast.info(`Document: ${doc.name} - Node: ${doc.nodePath}`);
  }, []);

  const handleMenuSelect = useCallback((menuId: string, pageData?: WorkspacePage | Page) => {
    if (menuId === 'home') {
      setCurrentView('home');
      setSelectedPage(null);
    } else if (menuId === 'inbox') {
      setCurrentView('inbox');
      setSelectedPage(null);
    } else if (menuId === 'database') {
      setCurrentView('database');
      setSelectedPage(null);
      toast.info('Database weergave geopend');
    } else if (menuId === 'pages') {
      setCurrentView('pages');
      setSelectedPage(null);
      toast.info("Pagina's weergave geopend");
    } else if (menuId === 'documenten') {
      setCurrentView('documenten');
      setSelectedPage(null);
      toast.info('Documenten weergave geopend');
    } else if (menuId.startsWith('workspace-') && !menuId.includes('page')) {
      // Workspace home clicked
      setCurrentView('workspace-page');
      setSelectedPage(null);
    } else if (menuId.startsWith('private-')) {
      // Private page clicked
      const privatePage = pages.find(p => p.id === menuId);
      if (privatePage) {
        setSelectedPage(privatePage as any);
        setCurrentView('workspace-page');
      }
    } else if (menuId.startsWith('page-') || pageData) {
      // Handle workspace page selection
      setCurrentView('workspace-page');
      if (pageData) {
        setSelectedPage(pageData as any);
      }
    } else {
      setCurrentView('home');
      setSelectedPage(null);
    }
  }, [pages]);

  const handlePageUpdate = useCallback((pageId: string, content: any) => {
    setPageData(prev => ({
      ...prev,
      [pageId]: content
    }));
    
    // Update private pages
    setPages(prev => prev.map(p => 
      p.id === pageId ? { ...p, updatedAt: new Date().toISOString() } : p
    ));
    
    // Update workspace pages
    setWorkspacePages(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(workspaceId => {
        updated[workspaceId] = updated[workspaceId].map(p =>
          p.id === pageId ? { ...p, updatedAt: new Date().toISOString() } : p
        );
      });
      return updated;
    });
  }, []);

  const handleAddPrivatePage = useCallback((pageType: PageType) => {
    const typeNames = {
      mindmap: 'Mindmap',
      document: 'Document',
      database: 'Database',
      form: 'Formulier'
    };
    
    const newPage: Page = {
      id: `private-${Date.now()}`,
      title: `Nieuwe ${typeNames[pageType]}`,
      type: pageType,
      icon: pageType === 'database' ? '📊' : pageType === 'document' ? '📄' : pageType === 'mindmap' ? '🧠' : '📋',
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Initialize empty data for the new page
    setPageData(prev => ({
      ...prev,
      [newPage.id]: pageType === 'mindmap' ? { stages: [] } : (pageType === 'document' ? { blocks: [] } : {})
    }));
    
    setPages(prev => [...prev, newPage]);
    setSelectedPage(newPage as any);
    setCurrentView('workspace-page');
    
    // Notify sidebar to select this page
    handleMenuSelect(newPage.id, newPage as any);
    
    toast.success(`${typeNames[pageType]} aangemaakt in Privé`);
  }, [handleMenuSelect]);

  const handleDeletePrivatePage = useCallback((pageId: string) => {
    setPages(prev => prev.filter(p => p.id !== pageId));
    if (selectedPage?.id === pageId) {
      setSelectedPage(null);
      setCurrentView('home');
    }
    toast.success('Pagina verwijderd');
  }, [selectedPage]);

  const handleRenamePrivatePage = useCallback((pageId: string, newTitle: string) => {
    setPages(prev => prev.map(p =>
      p.id === pageId ? { ...p, title: newTitle, updatedAt: new Date().toISOString() } : p
    ));
    if (selectedPage?.id === pageId) {
      setSelectedPage(prev => prev ? { ...prev, title: newTitle } : null);
    }
    toast.success('Pagina hernoemd');
  }, [selectedPage]);

  const handleShowTemplateSelector = useCallback((target: { type: 'private' } | { type: 'workspace', workspaceId: string }) => {
    // Directly create a canvas for both private and workspace
    if (target.type === 'private') {
      const newPage: Page = {
        id: `private-${Date.now()}`,
        title: 'Nieuwe Canvas',
        type: 'document',
        icon: '📄',
        blocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Initialize empty data for the new page
      setPageData(prev => ({
        ...prev,
        [newPage.id]: { blocks: [] }
      }));
      
      setPages(prev => [...prev, newPage]);
      setSelectedPage(newPage as any);
      setCurrentView('workspace-page');
      
      // Notify sidebar to select this page
      handleMenuSelect(newPage.id, newPage as any);
      
      toast.success('Canvas aangemaakt in Privé');
    } else {
      const newPage: WorkspacePage = {
        id: `page-${Date.now()}`,
        title: 'Nieuwe Canvas',
        type: 'document',
        workspaceId: target.workspaceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Initialize empty data for the new page
      setPageData(prev => ({
        ...prev,
        [newPage.id]: { blocks: [] }
      }));
      
      // Add to workspace pages ONLY
      setWorkspacePages(prev => ({
        ...prev,
        [target.workspaceId]: [...(prev[target.workspaceId] || []), newPage]
      }));
      
      setSelectedPage(newPage);
      setCurrentView('workspace-page');
      
      // Notify sidebar to select this page
      handleMenuSelect(newPage.id, newPage);
      
      toast.success('Canvas aangemaakt in teamruimte');
    }
  }, [handleMenuSelect]);

  const handleTemplateSelected = useCallback((type: PageType) => {
    if (!templateSelectorTarget) return;
    
    if (templateSelectorTarget.type === 'private') {
      handleAddPrivatePage(type);
    } else {
      // Temporarily set the workspace for adding the page
      const previousWorkspace = currentWorkspaceId;
      setCurrentWorkspaceId(templateSelectorTarget.workspaceId);
      
      const typeNames = {
        mindmap: 'Mindmap',
        document: 'Document',
        database: 'Database',
        form: 'Formulier'
      };

      const newPage: WorkspacePage = {
        id: `page-${Date.now()}`,
        title: `Nieuwe ${typeNames[type]}`,
        type,
        workspaceId: templateSelectorTarget.workspaceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Initialize empty data for the new page
      setPageData(prev => ({
        ...prev,
        [newPage.id]: type === 'mindmap' ? { stages: [] } : (type === 'document' ? { blocks: [] } : {})
      }));
      
      // Add to workspace pages ONLY
      setWorkspacePages(prev => ({
        ...prev,
        [templateSelectorTarget.workspaceId]: [...(prev[templateSelectorTarget.workspaceId] || []), newPage]
      }));
      
      setSelectedPage(newPage);
      setCurrentView('workspace-page');
      
      // Notify sidebar to select this page
      handleMenuSelect(newPage.id, newPage);
      
      toast.success(`${typeNames[type]} aangemaakt in teamruimte`);
    }
    
    setTemplateSelectorTarget(null);
  }, [templateSelectorTarget, handleAddPrivatePage, currentWorkspaceId, handleMenuSelect]);

  const handleCreatePageInWorkspace = useCallback((type: PageType) => {
    const typeNames = {
      mindmap: 'Mindmap',
      document: 'Document',
      database: 'Database',
      form: 'Formulier'
    };

    const newPage: WorkspacePage = {
      id: `page-${Date.now()}`,
      title: `Nieuwe ${typeNames[type]}`,
      type,
      workspaceId: currentWorkspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Initialize empty data for the new page
    setPageData(prev => ({
      ...prev,
      [newPage.id]: type === 'mindmap' ? { stages: [] } : (type === 'document' ? { blocks: [] } : {})
    }));
    
    // Add to workspace pages
    setWorkspacePages(prev => ({
      ...prev,
      [currentWorkspaceId]: [...(prev[currentWorkspaceId] || []), newPage]
    }));
    
    setPages(prev => [...prev, newPage as any]);
    setSelectedPage(newPage);
    setCurrentView('workspace-page');
    toast.success(`${typeNames[type]} aangemaakt`);
  }, [currentWorkspaceId]);

  return (
    <SidebarProvider>
      <div className="relative w-full h-screen flex">
        <AppSidebar 
          onMenuSelect={handleMenuSelect}
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
          onWorkspaceChange={handleWorkspaceChange}
          onAddWorkspace={handleAddWorkspace}
          onRenameWorkspace={handleRenameWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          documents={documents}
          onDocumentClick={handleDocumentClick}
          workspacePages={workspacePages}
          onDeleteWorkspacePage={handleDeleteWorkspacePage}
          onRenameWorkspacePage={handleRenameWorkspacePage}
          onAddPageToWorkspace={handleAddPageToWorkspace}
          privatePages={pages}
          onAddPrivatePage={handleAddPrivatePage}
          onDeletePrivatePage={handleDeletePrivatePage}
          onRenamePrivatePage={handleRenamePrivatePage}
          onShowTemplateSelector={handleShowTemplateSelector}
          activePageId={selectedPage?.id}
        />
        
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 p-2 border-b border-border">
            <SidebarTrigger />
            {selectedPage ? (
              editingTitle ? (
                <Input
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={() => {
                    if (titleValue.trim()) {
                      if (selectedPage.workspaceId) {
                        handleRenameWorkspacePage(selectedPage.workspaceId, selectedPage.id, titleValue.trim());
                      } else {
                        handleRenamePrivatePage(selectedPage.id, titleValue.trim());
                      }
                    }
                    setEditingTitle(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                    if (e.key === 'Escape') {
                      setTitleValue(selectedPage.title);
                      setEditingTitle(false);
                    }
                  }}
                  className="text-lg font-semibold border-0 px-2 py-0 h-8 focus-visible:ring-1"
                  autoFocus
                />
              ) : (
                <h1 
                  className="text-lg font-semibold cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                  onClick={() => {
                    setTitleValue(selectedPage.title);
                    setEditingTitle(true);
                  }}
                >
                  {selectedPage.title}
                </h1>
              )
            ) : (
              <h1 className="text-lg font-semibold px-2">
                {currentView === 'home'
                  ? 'Startpagina'
                  : currentView === 'inbox'
                    ? 'Inbox'
                    : currentView === 'database'
                      ? 'Database'
                      : currentView === 'pages'
                        ? "Pagina's"
                        : currentView === 'documenten'
                          ? 'Documenten'
                          : currentView === 'template-selector'
                            ? 'Selecteer template'
                            : (() => {
                                const ws = workspaces.find(w => w.id === currentWorkspaceId);
                                return ws ? ws.name : 'Workspace';
                              })()
                }
              </h1>
            )}
          </div>
          
          <div className="flex-1 relative flex flex-col">
            {currentView === 'home' ? (
              <div className="flex-1 flex items-center justify-center bg-muted/20">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">Welkom</h2>
                  <p className="text-muted-foreground">Selecteer een workspace of maak een nieuwe pagina aan</p>
                </div>
              </div>
            ) : currentView === 'inbox' ? (
              <div className="flex-1 flex items-center justify-center bg-muted/20">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">Inbox</h2>
                  <p className="text-muted-foreground">Geen nieuwe items</p>
                </div>
              </div>
            ) : currentView === 'database' ? (
              <DatabaseManager />
            ) : currentView === 'pages' ? (
              <PageManager />
            ) : currentView === 'documenten' ? (
              <DocumentLibrary documents={documents} onDocumentClick={handleDocumentClick} />
            ) : currentView === 'template-selector' ? (
              <TemplateSelector onSelectTemplate={handleTemplateSelected} />
            ) : currentView === 'workspace-page' ? (
              selectedPage ? (
                // Show page content based on type
                <>
                  {selectedPage.type === 'mindmap' ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Fixed Toolbar */}
                      <div className="flex-shrink-0 border-b border-border">
                        <Toolbar
                          mode="mindmap"
                          onAddNode={handleAddNode}
                          onShapeChange={setSelectedShape}
                          selectedShape={selectedShape}
                          onFileUpload={() => toast.info('Upload functionaliteit')}
                        />
                      </div>
                      
                      {/* Scrollable Content Area */}
                      <div className="flex-1 flex overflow-hidden">
                        <div className="flex-1 relative">
                          <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onNodeDrag={onNodeDrag}
                            onNodeDragStop={onNodeDragStop}
                            nodeTypes={nodeTypes}
                            fitView
                            className="bg-canvas-bg"
                          >
                            <Background color="#cbd5e1" gap={20} />
                            <Controls />
                            <MiniMap
                              nodeColor={(node) => {
                                const data = node.data as { color?: string };
                                return data.color || '#0891B2';
                              }}
                              className="bg-card border border-border"
                            />
                          </ReactFlow>
                        </div>
                        
                        {/* Document Editor in center */}
                        {expandedNode && (
                          <ExpandedNodeView
                            node={expandedNode}
                            open={!!expandedNode}
                            onClose={() => setExpandedNode(null)}
                          />
                        )}
                        
                        {/* Detail Panel on right */}
                        {selectedNode && (
                          <DetailPanel
                            node={selectedNode}
                            onClose={handleClosePanel}
                            onChildClick={handleChildClick}
                            breadcrumbs={breadcrumbs}
                            onDocumentUpload={handleDocumentUpload}
                            onNodeLabelChange={handleNodeLabelChange}
                            onTextStyleChange={handleTextStyleChange}
                            onLinkAdd={handleLinkAdd}
                            onLinkRemove={handleLinkRemove}
                            onExpandDocument={() => setExpandedNode(selectedNode)}
                          />
                        )}
                      </div>
                    </div>
                  ) : selectedPage.type === 'document' ? (
                    <div className="flex-1 flex flex-col bg-background">
                      <PageEditor
                        page={{
                          id: selectedPage.id,
                          title: selectedPage.title,
                          icon: selectedPage.icon,
                          blocks: pageData[selectedPage.id]?.blocks || [],
                          createdAt: selectedPage.createdAt,
                          updatedAt: selectedPage.updatedAt
                        }}
                        onPageChange={(updatedPage) => {
                          setPageData(prev => ({
                            ...prev,
                            [selectedPage.id]: { blocks: updatedPage.blocks }
                          }));
                          handlePageUpdate(selectedPage.id, { blocks: updatedPage.blocks });
                        }}
                      />
                    </div>
                  ) : selectedPage.type === 'database' ? (
                    <DatabaseManager />
                  ) : (
                    <PageManager />
                  )}
                </>
              ) : (
                // Workspace home - no toolbar, just empty state
                <div className="flex-1 flex items-center justify-center bg-muted/20">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-4">Workspace</h2>
                    <p className="text-muted-foreground">Klik op het plus icoon in de sidebar om een pagina toe te voegen</p>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
