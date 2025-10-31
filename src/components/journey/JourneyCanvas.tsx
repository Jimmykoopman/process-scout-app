import { useState, useCallback } from 'react';
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
import { DocumentEditor } from '@/components/pages/DocumentEditor';
import { sampleJourneyData } from '@/data/sampleJourney';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DatabaseManager } from '@/components/database/DatabaseManager';
import { PageManager } from '@/components/pages/PageManager';
import { DocumentLibrary } from './DocumentLibrary';
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
    { id: 'default', name: 'Klant Reis', type: 'mindmap', data: sampleJourneyData }
  ]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState('default');
  
  // Document management
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Journey nodes with text styles and links - per page
  const [pageData, setPageData] = useState<Record<string, any>>({
    'default': sampleJourneyData
  });
  
  // View management
  const [currentView, setCurrentView] = useState<'journey' | 'database' | 'pages' | 'documenten' | 'workspace-page'>('journey');
  const [selectedPage, setSelectedPage] = useState<WorkspacePage | null>(null);
  const [pages, setPages] = useState<Page[]>([]);

  // Get current page data
  const getCurrentPageKey = () => {
    if (selectedPage) return selectedPage.id;
    return 'default';
  };

  const journeyData = pageData[getCurrentPageKey()] || { stages: [] };

  // Convert journey data to React Flow nodes
  const createNodesFromData = useCallback(() => {
    const nodes: Node[] = [];
    const xSpacing = 250;
    const ySpacing = 150;

    journeyData.stages.forEach((stage, index) => {
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
        },
      });

      // Add children nodes
      if (stage.children) {
        stage.children.forEach((child, childIndex) => {
          nodes.push({
            id: child.id,
            type: 'custom',
            position: { 
              x: index * xSpacing - 100 + childIndex * 120, 
              y: 300 + ySpacing 
            },
            data: {
              label: child.label,
              shape: child.shape,
              textStyle: child.textStyle,
              onClick: () => handleNodeClick(child, [stage]),
              onDoubleClick: () => handleNodeDoubleClick(child),
            },
          });
        });
      }
    });

    return nodes;
  }, [journeyData]);

  const createEdgesFromData = useCallback(() => {
    const edges: Edge[] = [];
    let edgeId = 0;

    journeyData.stages.forEach((stage, index) => {
      // Connect stages
      if (index < journeyData.stages.length - 1) {
        edges.push({
          id: `e${edgeId++}`,
          source: stage.id,
          target: journeyData.stages[index + 1].id,
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
  }, [journeyData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(createNodesFromData());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdgesFromData());

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

  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        label: 'Nieuwe node',
        shape: selectedShape,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [selectedShape, setNodes]);

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
    toast.success('Tekst formatting bijgewerkt');
  }, [selectedPage]);

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
    toast.success(`Workspace "${name}" aangemaakt`);
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

  const handleMenuSelect = useCallback((menuId: string, pageData?: WorkspacePage) => {
    if (menuId === 'database') {
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
    } else if (menuId === 'home') {
      setCurrentView('journey');
      setSelectedPage(null);
      toast.info('Journey weergave geopend');
    } else if (menuId.startsWith('workspace-') && !menuId.includes('page')) {
      // Workspace home clicked
      setCurrentView('workspace-page');
      setSelectedPage(null);
    } else if (menuId.startsWith('page-') || pageData) {
      // Handle workspace page selection
      setCurrentView('workspace-page');
      if (pageData) {
        setSelectedPage(pageData);
      }
    } else {
      setCurrentView('journey');
      setSelectedPage(null);
      toast.info(`Menu geselecteerd: ${menuId}`);
    }
  }, []);

  const handlePageUpdate = useCallback((pageId: string, content: any) => {
    setPageData(prev => ({
      ...prev,
      [pageId]: content
    }));
    setPages(prev => prev.map(p => 
      p.id === pageId ? { ...p, updatedAt: new Date().toISOString() } : p
    ));
  }, []);

  const handleCreatePageInWorkspace = useCallback((type: PageType) => {
    const newPage: WorkspacePage = {
      id: `page-${Date.now()}`,
      title: `Nieuwe ${type}`,
      type,
      workspaceId: currentWorkspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Initialize empty data for the new page
    setPageData(prev => ({
      ...prev,
      [newPage.id]: type === 'mindmap' ? { stages: [] } : (type === 'document' ? '' : {})
    }));
    
    setPages(prev => [...prev, newPage as any]);
    setSelectedPage(newPage);
    toast.success(`${type} aangemaakt`);
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
          documents={documents}
          onDocumentClick={handleDocumentClick}
        />
        
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 p-2 border-b border-border">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Journey Mindmap</h1>
          </div>
          
          <div className="flex-1 relative flex flex-col">
            {currentView === 'database' ? (
              <DatabaseManager />
            ) : currentView === 'pages' ? (
              <PageManager />
            ) : currentView === 'documenten' ? (
              <DocumentLibrary documents={documents} onDocumentClick={handleDocumentClick} />
            ) : currentView === 'workspace-page' ? (
              selectedPage ? (
                // Show page content based on type
                <>
                  {selectedPage.type === 'mindmap' ? (
                    <>
                      <Toolbar
                        mode="mindmap"
                        onAddNode={handleAddNode}
                        onShapeChange={setSelectedShape}
                        selectedShape={selectedShape}
                        onFileUpload={() => toast.info('Upload functionaliteit')}
                      />
                      <div className="flex-1 relative flex">
                        <div className="flex-1 relative">
                          <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
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
                        <DetailPanel
                          node={selectedNode}
                          onClose={handleClosePanel}
                          onChildClick={handleChildClick}
                          breadcrumbs={breadcrumbs}
                          onDocumentUpload={handleDocumentUpload}
                          onTextStyleChange={handleTextStyleChange}
                          onLinkAdd={handleLinkAdd}
                          onLinkRemove={handleLinkRemove}
                        />
                      </div>
                    </>
                  ) : selectedPage.type === 'document' ? (
                    <DocumentEditor 
                      content={pageData[selectedPage.id] || ''}
                      onChange={(content) => handlePageUpdate(selectedPage.id, content)}
                    />
                  ) : selectedPage.type === 'database' ? (
                    <DatabaseManager />
                  ) : (
                    <PageManager />
                  )}
                </>
              ) : (
                // Workspace home - show template selector
                <>
                  <Toolbar
                    mode="workspace"
                    onCreatePage={handleCreatePageInWorkspace}
                    onFileUpload={() => toast.info('Upload functionaliteit')}
                  />
                  <div className="flex-1 flex items-center justify-center bg-muted/20">
                    <div className="text-center">
                      <h2 className="text-2xl font-semibold mb-4">Workspace Home</h2>
                      <p className="text-muted-foreground">Klik op 'Voeg toe' om een nieuwe pagina aan te maken</p>
                    </div>
                  </div>
                </>
              )
            ) : (
              <>
                <Toolbar
                  mode="mindmap"
                  onAddNode={handleAddNode}
                  onShapeChange={setSelectedShape}
                  selectedShape={selectedShape}
                  onFileUpload={() => toast.info('Upload functionaliteit')}
                />
                <div className="flex-1 relative flex">
                  <div className="flex-1 relative">
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
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
                  <DetailPanel
                    node={selectedNode}
                    onClose={handleClosePanel}
                    onChildClick={handleChildClick}
                    breadcrumbs={breadcrumbs}
                    onDocumentUpload={handleDocumentUpload}
                    onTextStyleChange={handleTextStyleChange}
                    onLinkAdd={handleLinkAdd}
                    onLinkRemove={handleLinkRemove}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <ExpandedNodeView
          node={expandedNode}
          open={expandedNode !== null}
          onClose={() => setExpandedNode(null)}
        />
      </div>
    </SidebarProvider>
  );
};
