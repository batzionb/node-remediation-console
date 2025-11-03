import { getNodeHealthCheckApiVersion, nodeHealthCheckKind } from "./model";
import { getEmptyRemediationTemplate } from "./remediator";
import {
  InitialNodeHealthCheck,
  UnhealthyConditions,
  UnhealthyConditionStatus,
} from "./types";

export const DEFAULT_MIN_HEALTHY = "51%";

export const defaultUnhealthyConditions: UnhealthyConditions = [
  {
    duration: "300s",
    status: UnhealthyConditionStatus.False,
    type: "Ready",
  },
  {
    duration: "300s",
    status: UnhealthyConditionStatus.Unknown,
    type: "Ready",
  },
];

export const getDefaultNodeHealthCheck = (): InitialNodeHealthCheck => {
  const defaultRemediator = getEmptyRemediationTemplate();
  return {
    apiVersion: getNodeHealthCheckApiVersion(),
    kind: nodeHealthCheckKind.kind,
    metadata: {
      name: "",
    },
    spec: {
      remediationTemplate: defaultRemediator,
      unhealthyConditions: defaultUnhealthyConditions,
      minHealthy: DEFAULT_MIN_HEALTHY,
      selector: {},
    },
  };
};
