import * as React from "react";
import {
  K8sModel,
  K8sResourceCommon,
  useK8sModels,
} from "@openshift-console/dynamic-plugin-sdk";
import useWatchModelInstances from "./useWatchModelInstances";

export type SelectItem = { label: string; value: string };

const useNamespaceAndNameItems = (
  selectedApiVersion: string,
  selectedKind: string,
  selectedNamespace?: string
): {
  namespaceItems: SelectItem[];
  nameItems: SelectItem[];
  namespacesLoaded: boolean;
  namesLoaded: boolean;
  namespacesError: unknown;
  namesError: unknown;
} => {
  const [models, modelLoading] = useK8sModels();

  const namespacedModels: K8sModel[] = React.useMemo(() => {
    if (modelLoading || !models) return [];
    return Object.values(models).filter((m) => !!m.namespaced);
  }, [models, modelLoading]);

  const selectedModel: K8sModel | undefined = React.useMemo(() => {
    if (!selectedApiVersion || !selectedKind) return undefined;
    return namespacedModels.find((m) => {
      const apiVer = m.apiGroup
        ? `${m.apiGroup}/${m.apiVersion}`
        : m.apiVersion;
      return apiVer === selectedApiVersion && m.kind === selectedKind;
    });
  }, [namespacedModels, selectedApiVersion, selectedKind]);

  const [allResources, namespacesLoaded, namespacesError] =
    useWatchModelInstances<K8sResourceCommon>(selectedModel);
  const [resources, namesLoaded, namesError] =
    useWatchModelInstances<K8sResourceCommon>(
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

  return {
    namespaceItems,
    nameItems,
    namespacesLoaded,
    namesLoaded,
    namespacesError,
    namesError,
  };
};

export default useNamespaceAndNameItems;
