import { useState, useMemo } from 'react';
import { DatabaseSchema, DatabaseRow } from '@/types/journey';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { format, isSameDay } from 'date-fns';
import { nl } from 'date-fns/locale';

interface CalendarViewProps {
  schema: DatabaseSchema;
  onRowClick: (row: DatabaseRow) => void;
}

export const CalendarView = ({ schema, onRowClick }: CalendarViewProps) => {
  const dateField = schema.fields.find(f => f.type === 'date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  if (!dateField) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Voeg een datum veld toe om kalender view te gebruiken</p>
      </div>
    );
  }

  const rowsOnDate = schema.rows.filter(row => {
    const rowDate = row[dateField.id];
    return rowDate && selectedDate && isSameDay(new Date(rowDate), selectedDate);
  });

  const datesWithEvents = useMemo(() => {
    return schema.rows
      .filter(row => row[dateField.id])
      .map(row => new Date(row[dateField.id]));
  }, [schema.rows, dateField.id]);

  return (
    <div className="p-6 flex gap-6">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          modifiers={{
            hasEvents: datesWithEvents
          }}
          modifiersStyles={{
            hasEvents: { fontWeight: 'bold', textDecoration: 'underline' }
          }}
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-4">
          {selectedDate ? format(selectedDate, 'PPP', { locale: nl }) : 'Selecteer een datum'}
        </h3>
        <div className="space-y-2">
          {rowsOnDate.length > 0 ? (
            rowsOnDate.map(row => (
              <Card
                key={row.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onRowClick(row)}
              >
                {schema.fields.slice(0, 3).map(field => {
                  const value = row[field.id];
                  if (!value || field.id === dateField.id) return null;
                  return (
                    <div key={field.id} className="mb-1">
                      <span className="text-xs text-muted-foreground">{field.name}: </span>
                      <span className="text-sm">{String(value)}</span>
                    </div>
                  );
                })}
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground">Geen items op deze datum</p>
          )}
        </div>
      </div>
    </div>
  );
};
