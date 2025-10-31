import { DatabaseSchema, DatabaseRow } from '@/types/journey';
import { Card } from '@/components/ui/card';

interface GalleryViewProps {
  schema: DatabaseSchema;
  onRowClick: (row: DatabaseRow) => void;
}

export const GalleryView = ({ schema, onRowClick }: GalleryViewProps) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {schema.rows.map(row => (
          <Card
            key={row.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onRowClick(row)}
          >
            <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
              <span className="text-4xl">📄</span>
            </div>
            {schema.fields.slice(0, 3).map(field => {
              const value = row[field.id];
              if (!value) return null;
              return (
                <div key={field.id} className="mb-2">
                  <div className="text-xs text-muted-foreground">{field.name}</div>
                  <div className="text-sm font-medium truncate">{String(value)}</div>
                </div>
              );
            })}
          </Card>
        ))}
      </div>
      {schema.rows.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nog geen items</p>
        </div>
      )}
    </div>
  );
};
