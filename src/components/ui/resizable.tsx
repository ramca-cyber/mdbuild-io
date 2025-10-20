import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-1.5 items-center justify-center bg-gradient-to-b from-border via-muted to-border hover:from-primary/30 hover:via-primary/50 hover:to-primary/30 transition-all duration-200 cursor-col-resize",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2 hover:after:bg-primary/10",
      "data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:h-1.5 data-[panel-group-direction=vertical]:cursor-row-resize",
      "data-[panel-group-direction=vertical]:bg-gradient-to-r data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-3 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      "group hover:w-2 data-[panel-group-direction=vertical]:hover:h-2",
      "[&[data-panel-group-direction=vertical]>div]:rotate-90",
      className,
    )}
    aria-label="Drag to resize editor and preview panes"
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-6 w-4 items-center justify-center rounded-md border border-border/50 bg-background/95 shadow-sm backdrop-blur-sm group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-200">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
