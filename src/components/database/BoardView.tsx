import { DatabaseSchema, DatabaseRow } from '@/types/journey';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface BoardViewProps {
  schema: DatabaseSchema;
  onRowClick: (row: DatabaseRow) => void;
}

export const BoardView = ({ schema, onRowClick }: BoardViewProps) => {
  const groupByField = schema.fields.find(f => f.id === schema.boardGroupBy) || 
                       schema.fields.find(f => f.type === 'status' || f.type === 'select');

  if (!groupByField) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Voeg een status of select veld toe om board view te gebruiken</p>
      </div>
    );
  }

  const groups = groupByField.options || ['Geen status'];
  const groupedRows = groups.reduce((acc, group) => {
    acc[group] = schema.rows.filter(row => row[groupByField.id] === group);
    return acc;
  }, {} as Record<string, DatabaseRow[]>);

  return (
    <div className="flex gap-4 p-6 overflow-x-auto h-full">
      {groups.map(group => (
        <div key={group} className="flex-shrink-0 w-80">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">{group}</h3>
            <Badge variant="secondary">{groupedRows[group].length}</Badge>
          </div>
          <div className="space-y-2">
            {groupedRows[group].map(row => (
              <Card
                key={row.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onRowClick(row)}
              >
                {schema.fields.slice(0, 3).map(field => {
                  if (field.id === groupByField.id) return null;
                  const value = row[field.id];
                  if (!value) return null;

                  return (
                    <div key={field.id} className="mb-2">
                      <div className="text-xs text-muted-foreground">{field.name}</div>
                      <div className="text-sm">
                        {field.type === 'date' && value
                          ? format(new Date(value), 'PPP', { locale: nl })
                          : String(value)}
                      </div>
                    </div>
                  );
                })}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
