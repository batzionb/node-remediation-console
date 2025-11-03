import * as React from "react";
import {
  K8sResourceCommon,
  useK8sWatchResource,
} from "@openshift-console/dynamic-plugin-sdk";

const useWatchModelInstances = <
  T extends K8sResourceCommon = K8sResourceCommon
>(
  kind: string | undefined,
  apiVersion: string | undefined,
  apiGroup: string | undefined,
  namespace?: string
): [T[] | undefined, boolean, unknown] => {
  const gvk = React.useMemo(() => {
    if (!kind || !apiVersion) return undefined;
    return {
      group: apiGroup,
      version: apiVersion,
      kind,
    } as const;
  }, [kind, apiVersion, apiGroup]);

  const [data, loaded, error] = useK8sWatchResource<T[]>({
    groupVersionKind: gvk,
    isList: true,
    namespace,
  });

  if (!kind || !apiVersion) {
    return [[], true, undefined];
  }

  return [data, loaded, error];
};

export default useWatchModelInstances;
