import * as React from "react";
import { SelectItem } from "./useKindItems";
import useTemplateCapableCRDs from "./useTemplateCapableCRDs";

const useRemediatorKindItems = (
  selectedApiVersion: string
): [SelectItem[], boolean, unknown] => {
  const [templateCRDs, loaded, error] = useTemplateCapableCRDs();

  const items = React.useMemo<SelectItem[]>(() => {
    if (!selectedApiVersion) return [];
    const [group, version] = selectedApiVersion.includes("/")
      ? selectedApiVersion.split("/")
      : ["", selectedApiVersion];
    const kinds = new Set<string>();
    for (const { group: g, version: v, kind } of templateCRDs) {
      const matches = group ? g === group && v === version : v === version;
      if (matches) kinds.add(kind);
    }
    return Array.from(kinds)
      .map((k) => ({ label: k, value: k }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [templateCRDs, selectedApiVersion]);

  return [items, loaded, error];
};

export default useRemediatorKindItems;
