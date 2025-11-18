import { useK8sWatchResources } from "@openshift-console/dynamic-plugin-sdk";
import {
  ExtensionK8sModel,
  K8sResourceCommon,
  WatchK8sResources,
  ResourcesObject,
} from "@openshift-console/dynamic-plugin-sdk";
import * as React from "react";
import { REMEDIATOR_DEFINITIONS } from "../data/remediators";

type RemediationResource = K8sResourceCommon;

type RemediationResourcesMap = Map<
  ExtensionK8sModel,
  { resources: RemediationResource[]; loaded: boolean }
>;

const useRemediationResources = (): RemediationResourcesMap => {
  // Get all unique template kinds from REMEDIATOR_DEFINITIONS
  const templateKinds = React.useMemo(() => {
    const kinds = new Set<ExtensionK8sModel>();
    REMEDIATOR_DEFINITIONS.forEach((def) => {
      if (def.templateKind) {
        kinds.add(def.templateKind);
      }
    });
    return Array.from(kinds);
  }, []);

  // Create watch resources object for all template kinds
  const watchResources = React.useMemo<
    WatchK8sResources<ResourcesObject>
  >(() => {
    const resources: WatchK8sResources<ResourcesObject> = {};

    templateKinds.forEach((templateKind) => {
      // Create a unique key for each template kind
      const key = `${templateKind.group}~${templateKind.version}~${templateKind.kind}`;
      resources[key] = {
        groupVersionKind: templateKind,
        isList: true,
      };
    });

    return resources;
  }, [templateKinds]);

  // Watch all template kinds at once using useK8sWatchResources
  const watchResults = useK8sWatchResources<ResourcesObject>(watchResources);

  return React.useMemo(() => {
    const resourcesMap: RemediationResourcesMap = new Map();

    templateKinds.forEach((templateKind) => {
      const key = `${templateKind.group}~${templateKind.version}~${templateKind.kind}`;
      const result = watchResults[key];

      if (!result) {
        resourcesMap.set(templateKind, { resources: [], loaded: false });
        return;
      }

      const { data, loaded, loadError: error } = result;
      const resources = Array.isArray(data) && !error ? data : [];

      resourcesMap.set(templateKind, { resources, loaded });
    });

    return resourcesMap;
  }, [watchResults, templateKinds]);
};

export default useRemediationResources;
