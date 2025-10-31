import { DatabaseSchema, DatabaseRow } from '@/types/journey';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ListViewProps {
  schema: DatabaseSchema;
  onRowClick: (row: DatabaseRow) => void;
}

export const ListView = ({ schema, onRowClick }: ListViewProps) => {
  return (
    <div className="p-6">
      <div className="space-y-2">
        {schema.rows.map((row, index) => (
          <Card
            key={row.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onRowClick(row)}
          >
            <div className="flex items-start gap-4">
              <div className="text-sm text-muted-foreground w-8">{index + 1}</div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                {schema.fields.slice(0, 3).map(field => {
                  const value = row[field.id];
                  return (
                    <div key={field.id}>
                      <div className="text-xs text-muted-foreground mb-1">{field.name}</div>
                      <div className="text-sm font-medium">
                        {field.type === 'date' && value
                          ? format(new Date(value), 'PPP', { locale: nl })
                          : field.type === 'checkbox'
                          ? value ? '✓' : '○'
                          : value || <span className="text-muted-foreground">Leeg</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
