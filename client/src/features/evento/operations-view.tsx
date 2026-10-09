'use client';

import { Activity, Database, Network, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  HealthStatus,
  Panel,
  dataModel,
  eventTopics,
  runtimeSurfaces,
} from './shared';

type OperationsViewProps = {
  systemHealth: Array<{ label: string; detail: string; status: HealthStatus }>;
  onProbeGateway: () => void;
};

export function OperationsView({ systemHealth, onProbeGateway }: OperationsViewProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Operations</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Services supporting the ticketing experience.
          </p>
        </div>
        <Button variant="outline" onClick={onProbeGateway}>
          <RefreshCcw className="size-4" />
          Check gateway
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {systemHealth.map((item) => (
          <Panel key={item.label} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">{item.label}</div>
              <span
                className={cn(
                  'size-2 rounded-full',
                  item.status === 'online' && 'bg-emerald-500',
                  item.status === 'verified' && 'bg-amber-500',
                  item.status === 'offline' && 'bg-rose-500',
                )}
              />
            </div>
            <div className="mt-2 text-sm text-zinc-600">{item.detail}</div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Runtime map</h3>
            <Network className="size-5 text-zinc-500" />
          </div>
          <div className="space-y-3">
            {runtimeSurfaces.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.name}
                  className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium">{service.name}</div>
                      <div className="truncate text-sm text-zinc-600">
                        {service.detail}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-md bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    {service.signal}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Data ownership</h3>
            <Database className="size-5 text-zinc-500" />
          </div>
          <div className="overflow-hidden rounded-md border border-zinc-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Table</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {dataModel.map((item) => (
                  <tr key={item.name}>
                    <td className="px-3 py-3 font-mono text-xs">{item.name}</td>
                    <td className="px-3 py-3">{item.owner}</td>
                    <td className="px-3 py-3 text-zinc-600">{item.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Panel className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Kafka event stream</h3>
          <Activity className="size-5 text-zinc-500" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {eventTopics.map((topic) => (
            <div
              key={topic}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-700"
            >
              {topic}
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}
