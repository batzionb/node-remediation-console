import * as React from "react";
import useTemplateCapableCRDs from "./useTemplateCapableCRDs";
import { useNodeHealthCheckTranslation } from "../localization/useNodeHealthCheckTranslation";
import { SelectItem } from "../components/shared/SelectField";

export type KindVersionSelectItem = SelectItem & {
  version?: string;
  group?: string;
  combinedApiVersion?: string;
  apiGroup?: string;
};

// Returns:
// - kindItems: combined kind and version items for all template-capable CRDs
// - loaded: whether CRDs are loaded
// - error: potential error from CRD watch
const useRemediatorKindAndVersionItems = (): [
  kindItems: KindVersionSelectItem[],
  loaded: boolean,
  error: unknown
] => {
  const { t } = useNodeHealthCheckTranslation();
  const [templateCRDs, loaded, error] = useTemplateCapableCRDs();

  const kindItems = React.useMemo(() => {
    return templateCRDs.map(({ group, version, kind }) => {
      const combinedApiVersion = `${group}/${version}`;
      return {
        label: kind,
        value: kind, // Use kind as value for display
        group,
        version,
        combinedApiVersion: `${group}/${version}`,
        apiGroup: group,
        kind,
        description: t("API Version: {{apiVersion}}", {
          apiVersion: combinedApiVersion,
        }),
      };
    });
  }, [templateCRDs, t]);

  return [kindItems, loaded, error];
};

export default useRemediatorKindAndVersionItems;
