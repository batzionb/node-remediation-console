import * as React from "react";
import {
  K8sModel,
  K8sResourceCommon,
} from "@openshift-console/dynamic-plugin-sdk";
import useWatchModelInstances from "./useWatchModelInstances";

export type SelectItem = { label: string; value: string };

const useRemediatorSelectItems = (
  selectedModel: K8sModel | undefined,
  selectedNamespace?: string
): {
  namespaceItems: SelectItem[];
  nameItems: SelectItem[];
  namespacesLoaded: boolean;
  namesLoaded: boolean;
} => {
  const [allResources, namespacesLoaded] =
    useWatchModelInstances<K8sResourceCommon>(selectedModel);
  const [resources, namesLoaded] = useWatchModelInstances<K8sResourceCommon>(
    selectedModel,
    selectedNamespace || undefined
  );

  const namespaceItems = React.useMemo<SelectItem[]>(() => {
    if (!selectedModel) return [];
    const namespacesWithInstances = new Set<string>();
    (allResources || []).forEach((r) => {
      const ns = r?.metadata?.namespace;
      if (ns) namespacesWithInstances.add(ns);
    });
    return Array.from(namespacesWithInstances)
      .sort()
      .map((n) => ({ label: n, value: n }));
  }, [selectedModel, allResources]);

  const nameItems = React.useMemo<SelectItem[]>(() => {
    if (!resources) return [];
    return resources
      .map((r) => r?.metadata?.name)
      .filter((n): n is string => !!n)
      .sort()
      .map((n) => ({ label: n, value: n }));
  }, [resources]);

  return { namespaceItems, nameItems, namespacesLoaded, namesLoaded };
};

export default useRemediatorSelectItems;
