import { Circle, FileText, Database, FileEdit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageType } from '@/types/journey';

interface TemplateSelectorProps {
  onSelectTemplate: (type: PageType) => void;
}

export const TemplateSelector = ({ onSelectTemplate }: TemplateSelectorProps) => {
  const templates = [
    {
      type: 'mindmap' as PageType,
      icon: Circle,
      title: 'Mindmap',
      description: 'Visualiseer ideeën en concepten met nodes en verbindingen',
    },
    {
      type: 'document' as PageType,
      icon: FileText,
      title: 'Document',
      description: 'Maak een document met tekst en opmaak',
    },
    {
      type: 'database' as PageType,
      icon: Database,
      title: 'Database',
      description: 'Organiseer data in tabellen met meerdere weergaven',
    },
    {
      type: 'form' as PageType,
      icon: FileEdit,
      title: 'Formulier',
      description: 'Verzamel informatie met een gestructureerd formulier',
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20 p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Kies een template</h2>
          <p className="text-muted-foreground">Selecteer het type pagina dat je wilt maken</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.type}
                className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
                onClick={() => onSelectTemplate(template.type)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{template.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {template.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
