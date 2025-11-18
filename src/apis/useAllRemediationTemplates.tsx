import { useK8sWatchResources } from "@openshift-console/dynamic-plugin-sdk";
import {
  ExtensionK8sModel,
  WatchK8sResources,
  ResourcesObject,
} from "@openshift-console/dynamic-plugin-sdk";
import * as React from "react";
import { REMEDIATOR_DEFINITIONS } from "../data/remediators";

type TemplateInstallationStatus = Map<
  ExtensionK8sModel,
  { installed: boolean; loaded: boolean }
>;

const useAllRemediationTemplates = (): TemplateInstallationStatus => {
  // Get all unique template kinds from REMEDIATOR_DEFINITIONS
  const templateKinds = React.useMemo(() => {
    return REMEDIATOR_DEFINITIONS.filter(
      (def): def is typeof def & { templateKind: ExtensionK8sModel } =>
        !!def.templateKind
    ).map((def) => def.templateKind);
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
    const statusMap: TemplateInstallationStatus = new Map();

    // Process each template kind from definitions
    templateKinds.forEach((templateKind) => {
      const key = `${templateKind.group}~${templateKind.version}~${templateKind.kind}`;
      const result = watchResults[key];

      if (!result) {
        statusMap.set(templateKind, { installed: false, loaded: false });
        return;
      }

      const { data, loaded, loadError: error } = result;
      const templates = Array.isArray(data) ? data : undefined;

      // Simply check if any templates exist
      const installed = !error && loaded && templates && templates.length > 0;

      statusMap.set(templateKind, { installed, loaded });
    });

    return statusMap;
  }, [watchResults, templateKinds]);
};

export default useAllRemediationTemplates;
