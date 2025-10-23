import * as React from "react";
import useTemplateCapableCRDs from "./useTemplateCapableCRDs";

export type SelectItem = { label: string; value: string };

// Returns:
// - kindItems: all kinds that have template-capable CRDs
// - apiVersionItems: apiVersions corresponding to the selected kind (empty until a kind is chosen)
// - loaded: whether CRDs are loaded
// - error: potential error from CRD watch
// - kindToVersions: mapping to support callers that need additional behavior
const useRemediatorKindAndVersionItems = (
  selectedKind: string
): [
  kindItems: SelectItem[],
  apiVersionItems: SelectItem[],
  loaded: boolean,
  error: unknown,
  kindToVersions: Record<string, string[]>
] => {
  const [templateCRDs, loaded, error] = useTemplateCapableCRDs();

  const kindToVersions = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const { group, version, kind } of templateCRDs) {
      const apiVer = group ? `${group}/${version}` : version;
      if (!map[kind]) map[kind] = [];
      if (!map[kind].includes(apiVer)) map[kind].push(apiVer);
    }
    Object.keys(map).forEach((k) => map[k].sort());
    return map;
  }, [templateCRDs]);

  const kindItems = React.useMemo(
    () =>
      Object.keys(kindToVersions)
        .sort((a, b) => a.localeCompare(b))
        .map((k) => ({ label: k, value: k })),
    [kindToVersions]
  );

  const apiVersionItems = React.useMemo(
    () =>
      selectedKind
        ? (kindToVersions[selectedKind] || []).map((v) => ({
            label: v,
            value: v,
          }))
        : [],
    [kindToVersions, selectedKind]
  );

  return [kindItems, apiVersionItems, loaded, error, kindToVersions];
};

export default useRemediatorKindAndVersionItems;
