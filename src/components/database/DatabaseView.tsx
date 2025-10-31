import { useState } from 'react';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatabaseSchema, DatabaseRow, DatabaseField, FieldType, DatabaseView as ViewType } from '@/types/journey';
import { FieldTypeSelector } from './FieldTypeSelector';
import { CellEditor } from './CellEditor';
import { ViewSelector } from './ViewSelector';
import { BoardView } from './BoardView';
import { CalendarView } from './CalendarView';
import { GalleryView } from './GalleryView';
import { ListView } from './ListView';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface DatabaseViewProps {
  schema: DatabaseSchema;
  onSchemaChange: (schema: DatabaseSchema) => void;
}

export const DatabaseView = ({ schema, onSchemaChange }: DatabaseViewProps) => {
  const [editingCell, setEditingCell] = useState<{ rowId: string; fieldId: string } | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(schema.currentView || 'table');
  const [selectedRow, setSelectedRow] = useState<DatabaseRow | null>(null);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    onSchemaChange({ ...schema, currentView: view });
  };

  const handleAddField = (name: string, type: FieldType) => {
    const newField: DatabaseField = {
      id: `field-${Date.now()}`,
      name,
      type,
      options: type === 'select' || type === 'multiselect' || type === 'status' ? [] : undefined,
    };

    onSchemaChange({
      ...schema,
      fields: [...schema.fields, newField],
    });
    toast.success('Veld toegevoegd');
  };

  const handleAddRow = () => {
    const newRow: DatabaseRow = {
      id: `row-${Date.now()}`,
    };

    // Initialize all fields with empty values
    schema.fields.forEach(field => {
      if (field.type === 'checkbox') {
        newRow[field.id] = false;
      } else if (field.type === 'multiselect') {
        newRow[field.id] = [];
      } else {
        newRow[field.id] = '';
      }
    });

    onSchemaChange({
      ...schema,
      rows: [...schema.rows, newRow],
    });
    toast.success('Rij toegevoegd');
  };

  const handleDeleteRow = (rowId: string) => {
    onSchemaChange({
      ...schema,
      rows: schema.rows.filter(r => r.id !== rowId),
    });
    toast.success('Rij verwijderd');
  };

  const handleDeleteField = (fieldId: string) => {
    onSchemaChange({
      ...schema,
      fields: schema.fields.filter(f => f.id !== fieldId),
      rows: schema.rows.map(row => {
        const { [fieldId]: _, ...rest } = row;
        return rest as DatabaseRow;
      }),
    });
    toast.success('Veld verwijderd');
  };

  const handleCellChange = (rowId: string, fieldId: string, value: any) => {
    onSchemaChange({
      ...schema,
      rows: schema.rows.map(row =>
        row.id === rowId ? { ...row, [fieldId]: value } : row
      ),
    });
    setEditingCell(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'board':
        return <BoardView schema={schema} onRowClick={setSelectedRow} />;
      case 'calendar':
        return <CalendarView schema={schema} onRowClick={setSelectedRow} />;
      case 'gallery':
        return <GalleryView schema={schema} onRowClick={setSelectedRow} />;
      case 'list':
        return <ListView schema={schema} onRowClick={setSelectedRow} />;
      case 'table':
      default:
        return renderTableView();
    }
  };

  const renderTableView = () => (
    <>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="w-12 p-2 border-r border-border"></th>
                {schema.fields.map(field => (
                  <th key={field.id} className="p-2 text-left border-r border-border min-w-[200px]">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{field.name}</span>
                        <span className="text-xs text-muted-foreground">{field.type}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDeleteField(field.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Verwijder veld
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </th>
                ))}
                <th className="w-12 p-2">
                  <FieldTypeSelector onAddField={handleAddField} />
                </th>
              </tr>
            </thead>
            <tbody>
              {schema.rows.map((row, rowIndex) => (
                <tr key={row.id} className="border-t border-border hover:bg-muted/50">
                  <td className="p-2 text-center text-muted-foreground border-r border-border">
                    {rowIndex + 1}
                  </td>
                  {schema.fields.map(field => (
                    <td key={field.id} className="p-2 border-r border-border">
                      <CellEditor
                        value={row[field.id]}
                        field={field}
                        isEditing={editingCell?.rowId === row.id && editingCell?.fieldId === field.id}
                        onStartEdit={() => setEditingCell({ rowId: row.id, fieldId: field.id })}
                        onChange={(value) => handleCellChange(row.id, field.id, value)}
                        onCancel={() => setEditingCell(null)}
                      />
                    </td>
                  ))}
                  <td className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRow(row.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {schema.rows.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nog geen gegevens. Klik op "Nieuwe rij" om te beginnen.</p>
        </div>
      )}
    </>
  );

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{schema.name}</h2>
          <div className="flex gap-2">
            <ViewSelector currentView={currentView} onViewChange={handleViewChange} />
            <Button onClick={handleAddRow} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe rij
            </Button>
          </div>
        </div>

        {renderView()}
      </div>
    </div>
  );
};
