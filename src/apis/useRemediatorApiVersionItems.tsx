import * as React from "react";
import { SelectItem } from "./useApiVersionItems";
import useTemplateCapableCRDs from "./useTemplateCapableCRDs";

const useRemediatorApiVersionItems = (): [SelectItem[], boolean, unknown] => {
  const [templateCRDs, loaded, error] = useTemplateCapableCRDs();

  const items = React.useMemo<SelectItem[]>(() => {
    const versions = new Set<string>();
    for (const { group, version } of templateCRDs) {
      const apiVer = group ? `${group}/${version}` : version;
      versions.add(apiVer);
    }
    return Array.from(versions)
      .sort()
      .map((v) => ({ label: v, value: v }));
  }, [templateCRDs]);

  return [items, loaded, error];
};

export default useRemediatorApiVersionItems;
