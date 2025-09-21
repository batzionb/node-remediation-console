import * as React from "react";
import { K8sModel } from "@openshift-console/dynamic-plugin-sdk";

export type SelectItem = { label: string; value: string };

const useKindItems = (
  namespacedModels: K8sModel[],
  selectedApiVersion: string
): SelectItem[] => {
  return React.useMemo(() => {
    if (!selectedApiVersion) return [];
    return namespacedModels
      .filter((m) => {
        const apiVer = m.apiGroup
          ? `${m.apiGroup}/${m.apiVersion}`
          : m.apiVersion;
        return apiVer === selectedApiVersion;
      })
      .map((m) => ({ label: m.kind, value: m.kind }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [namespacedModels, selectedApiVersion]);
};

export default useKindItems;
