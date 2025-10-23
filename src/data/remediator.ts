import {
  EscalatingRemediator,
  NodeHealthCheck,
  RemediationTemplate,
  Remediator,
} from "./types";
import { TFunction } from "i18next";

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
  return remediationTemplate.kind;
};

export const getDefaultRemediator = (): Remediator => {
  return {
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
