import * as React from "react";
import { K8sResourceCommon } from "@openshift-console/dynamic-plugin-sdk";
import useWatchModelInstances from "./useWatchModelInstances";
import { KindVersionSelectItem } from "./useRemediatorKindAndVersionItems";
import { useNodeHealthCheckTranslation } from "../localization/useNodeHealthCheckTranslation";
import { SelectItem } from "../components/shared/SelectField";

export type NameNamespaceSelectItem = SelectItem & {
  namespace?: string;
  name?: string;
};

const useCombinedNamespaceAndNameItems = (
  selectedKindItem: KindVersionSelectItem | undefined
): {
  nameItems: NameNamespaceSelectItem[];
  namesLoaded: boolean;
  namesError: unknown;
} => {
  const { t } = useNodeHealthCheckTranslation();
  const selectedKind = selectedKindItem?.kind || "";
  const apiVersion = selectedKindItem?.version;
  const apiGroup = selectedKindItem?.group;

  const [allResources, namespacesLoaded, namespacesError] =
    useWatchModelInstances<K8sResourceCommon>(
      selectedKind,
      apiVersion,
      apiGroup
    );

  const nameItems = React.useMemo<NameNamespaceSelectItem[]>(() => {
    if (!selectedKind || !selectedKindItem || !allResources) return [];
    return allResources.reduce<NameNamespaceSelectItem[]>((acc, r) => {
      const name = r?.metadata?.name;
      if (!name) return acc;

      const namespace = r?.metadata?.namespace;
      // Build description with namespace only
      const description = namespace
        ? t("Namespace: {{namespace}}", { namespace })
        : t("Cluster-scoped");

      acc.push({
        label: name,
        value: name,
        description,
        namespace: namespace || "",
        name,
      });
      return acc;
    }, []);
  }, [selectedKind, selectedKindItem, allResources, t]);

  return {
    nameItems,
    namesLoaded: namespacesLoaded,
    namesError: namespacesError,
  };
};

export default useCombinedNamespaceAndNameItems;
