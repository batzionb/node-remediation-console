import {
  EscalatingRemediator,
  NodeHealthCheck,
  RemediationTemplate,
  Remediator,
} from "./types";
import { snrTemplateKind } from "./model";
import { TFunction } from "i18next";
import { RemediatorInfo } from "../apis/useRemediators";

export const getSNRLabel = (t: TFunction) => t("Self node remediation");

export const getEmptyRemediationTemplate = (): RemediationTemplate => ({
  apiVersion: "",
  kind: "",
  name: "",
  namespace: "",
});

export const getRemediatorLabel = (
  nodeHealthCheck: NodeHealthCheck,
  t: TFunction
): string | undefined => {
  if (
    !nodeHealthCheck.spec ||
    (!nodeHealthCheck.spec.remediationTemplate &&
      !nodeHealthCheck.spec.escalatingRemediations)
  ) {
    return undefined;
  }
  if (nodeHealthCheck.spec.escalatingRemediations?.length > 0) {
    return t("Escalating remediations");
  }
  const remediationTemplate = nodeHealthCheck.spec.remediationTemplate;
  return remediationTemplate.kind === snrTemplateKind.kind
    ? getSNRLabel(t)
    : remediationTemplate.kind;
};

export const getDefaultRemediator = (
  snrTemplate: RemediationTemplate | undefined,
  remediators?: RemediatorInfo[]
): Remediator => {
  // Prefer SNR if installed
  const snrRemediator = remediators?.find((r) => r.id === "snr" && r.installed);
  if (snrRemediator && snrTemplate) {
    return {
      radioOption: "snr",
      template: snrTemplate,
      order: "",
      id: Math.random(),
    };
  }

  // Fall back to first installed remediator
  const firstInstalled = remediators?.find((r) => r.installed);
  if (firstInstalled) {
    return {
      radioOption: firstInstalled.id,
      template: getEmptyRemediationTemplate(),
      order: "",
      id: Math.random(),
    };
  }

  // If nothing is installed, default to SNR (will be disabled but selected)
  return {
    radioOption: "snr",
    template: getEmptyRemediationTemplate(),
    order: "",
    id: Math.random(),
  };
};
export const getSortedRemediators = <
  R extends EscalatingRemediator | Remediator
>(
  remediators: R[]
): R[] =>
  [...remediators].sort(
    (remediator1, remediator2) =>
      (remediator1.order || 0) - (remediator2.order || 0)
  );
