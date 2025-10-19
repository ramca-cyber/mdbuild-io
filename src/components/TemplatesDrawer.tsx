import { FileText, BookOpen, Briefcase, Calendar, GitBranch, FlaskConical } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { templates } from '@/lib/templates';

export const TemplatesDrawer = () => {
  const { setContent } = useEditorStore();

  const handleTemplateClick = (template: typeof templates[0]) => {
    setContent(template.content);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        <h3 className="font-semibold mb-3 text-sm text-foreground">Templates</h3>
        {templates.map((template) => (
          <Card
            key={template.name}
            className="p-4 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleTemplateClick(template)}
          >
            <div className="flex items-start gap-3">
              <template.icon className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.content.split('\n')[0].replace(/^#\s*/, '')}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
