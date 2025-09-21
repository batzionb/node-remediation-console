import * as React from "react";
import { K8sModel } from "@openshift-console/dynamic-plugin-sdk";

export type SelectItem = { label: string; value: string };

const useApiVersionItems = (models: K8sModel[]): SelectItem[] => {
  return React.useMemo(() => {
    const versions = new Set<string>();
    models.forEach((m) => {
      const group = m.apiGroup;
      const ver = m.apiVersion;
      if (!ver) return;
      const apiVer = group ? `${group}/${ver}` : ver;
      versions.add(apiVer);
    });
    return Array.from(versions)
      .sort()
      .map((v) => ({ label: v, value: v }));
  }, [models]);
};

export default useApiVersionItems;
