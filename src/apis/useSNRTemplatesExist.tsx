import {
  ResourcesObject,
  useK8sWatchResources,
  WatchK8sResources,
} from "@openshift-console/dynamic-plugin-sdk";
import { K8sResourceKind } from "copiedFromConsole/k8s/types";
import { OPERATORS_NAMESPACE } from "data/defaults";
import { snrTemplateKind } from "data/model";
import { BuiltInRemediationTemplate } from "data/types";
import * as React from "react";

interface SnrTemplateWatchResources extends ResourcesObject {
  [name: string]: K8sResourceKind;
}

export const useSnrTemplatesExist = (): [boolean, boolean] => {
  const watchResources = React.useMemo<
    WatchK8sResources<SnrTemplateWatchResources>
  >(() => {
    const ret: WatchK8sResources<SnrTemplateWatchResources> = {};
    for (const snrTemplateName of Object.values(BuiltInRemediationTemplate)) {
      ret[snrTemplateName] = {
        groupVersionKind: snrTemplateKind,
        name: snrTemplateName,
        namespace: OPERATORS_NAMESPACE,
      };
    }
    return ret;
  }, []);
  const results =
    useK8sWatchResources<SnrTemplateWatchResources>(watchResources);
  const isLoading = !!Object.values(results).find((result) => !result.loaded);
  const error = !!Object.values(results).find((result) => result.loadError);

  return [isLoading && !error, !error];
};
