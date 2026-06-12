'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveModelId } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { models as presetModels } from '@/lib/ai/models';
import { cn } from '@/lib/utils';
import { CheckCircleFillIcon, ChevronDownIcon } from './icons';

type ModelOption = {
  apiIdentifier: string;
  label: string;
  description?: string;
};

export function ModelSelector({
  selectedModelId,
  onModelChange,
  className,
}: {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [modelList, setModelList] = useState<ModelOption[]>(
    presetModels.map((m) => ({
      apiIdentifier: m.apiIdentifier,
      label: m.label,
      description: m.description,
    })),
  );

  useEffect(() => {
    (async () => {
      try {
        const [sRes, mRes] = await Promise.all([
          fetch('/api/settings').then((r) => r.json()),
          fetch('/api/all-models').then((r) => r.json()),
        ]);
        if (sRes?.ok && sRes.settings?.pinned_models) {
          const pinned: string[] = JSON.parse(sRes.settings.pinned_models);
          const allModels = mRes?.ok ? mRes.models : [];
          const list: ModelOption[] = pinned.map((id) => {
            const found = allModels.find((m: { id: string }) => m.id === id);
            const preset = presetModels.find((m) => m.apiIdentifier === id);
            return {
              apiIdentifier: id,
              label: found?.name || preset?.label || id,
              description: found?.vision ? '可看图' : preset?.description,
            };
          });
          if (list.length > 0) setModelList(list);
        }
      } catch {}
    })();
  }, []);

  const selectedModel = useMemo(
    () => modelList.find((m) => m.apiIdentifier === selectedModelId),
    [selectedModelId, modelList],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button variant="outline" className="md:px-2 md:h-[34px]">
          {selectedModel?.label ?? '选择模型'}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[300px] max-h-[400px] overflow-y-auto"
      >
        {modelList.map((model) => (
          <DropdownMenuItem
            key={model.apiIdentifier}
            onSelect={async () => {
              setOpen(false);
              onModelChange(model.apiIdentifier);
              await saveModelId(model.apiIdentifier);
              router.refresh();
            }}
            className="gap-4 group/item flex flex-row justify-between items-center"
            data-active={model.apiIdentifier === selectedModelId}
          >
            <div className="flex flex-col gap-1 items-start">
              {model.label}
              {model.description && (
                <div className="text-xs text-muted-foreground">
                  {model.description}
                </div>
              )}
            </div>
            <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
              <CheckCircleFillIcon />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
