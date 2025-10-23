import * as React from "react";
import {
  K8sModel,
  K8sResourceCommon,
  useK8sWatchResource,
} from "@openshift-console/dynamic-plugin-sdk";

function toGroupVersionKind(model: K8sModel | undefined) {
  if (!model) return undefined;
  return {
    group: model.apiGroup,
    version: model.apiVersion,
    kind: model.kind,
  } as const;
}

const useWatchModelInstances = <
  T extends K8sResourceCommon = K8sResourceCommon
>(
  model: K8sModel | undefined,
  namespace?: string
): [T[] | undefined, boolean, unknown] => {
  const gvk = React.useMemo(() => toGroupVersionKind(model), [model]);
  const [data, loaded, error] = useK8sWatchResource<T[]>({
    groupVersionKind: gvk,
    isList: true,
    namespace,
  });
  if (!model) {
    return [[], true, undefined];
  }
  return [data, loaded, error];
};

export default useWatchModelInstances;
