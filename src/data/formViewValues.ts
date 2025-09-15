import {
  selectorFromStringArray,
  selectorToStringArray,
} from "copiedFromConsole/module/selector";
import { defaultUnhealthyConditions } from "./defaults";
import { ParseErrorCode, throwParseError } from "./parseErrors";
import { getSortedRemediators } from "./remediator";
import {
  UnhealthyCondition,
  NodeHealthCheck,
  FormViewValues,
  RemediatorRadioOption,
  RemediationTemplate,
  Remediator,
  NodeHealthCheckSpec,
  EscalatingRemediator,
} from "./types";
import { MIN_HEALTHY_REGEX } from "./validationSchema";
import { isEqual } from "lodash-es";

const getRemediationTemplateFormValues = (
  snrTemplate: RemediationTemplate | undefined,
  template?: RemediationTemplate,
  timeout?: string,
  order?: number
): Remediator | undefined => {
  if (!template) {
    return undefined;
  }
  const radioOption = isEqual(snrTemplate, template)
    ? RemediatorRadioOption.SNR
    : RemediatorRadioOption.CUSTOM;
  return {
    radioOption,
    template,
    timeout,
    order: order ?? "",
    id: Math.random(),
  };
};

export const DURATION_REGEX = /^([0-9]+(\.[0-9]+)?)(ns|us|µs|ms|s|m|h)$/;

const getUnhealthyConditionsValue = (
  nodeHealthCheck: NodeHealthCheck
): UnhealthyCondition[] => {
  try {
    return nodeHealthCheck.spec?.unhealthyConditions &&
      nodeHealthCheck.spec.unhealthyConditions.length > 0
      ? nodeHealthCheck.spec?.unhealthyConditions
      : defaultUnhealthyConditions;
  } catch (err) {
    throwParseError(
      ParseErrorCode.INVALID_UNHEALTHY_CONDITIONS,
      "Unhealthy conditions field isn't an array"
    );
  }
};

const getescalatingRemediationsFormValues = (
  escalatingRemediations?: EscalatingRemediator[],
  snrTemplate?: RemediationTemplate
): Remediator[] => {
  if (!escalatingRemediations) return [];
  const sortedescalatingRemediations = getSortedRemediators(
    escalatingRemediations
  );
  return sortedescalatingRemediations.map((remediator) => {
    return getRemediationTemplateFormValues(
      snrTemplate,
      remediator.remediationTemplate,
      remediator.timeout,
      remediator.order
    );
  });
};

export const getFormViewValues = (
  nodeHealthCheck: NodeHealthCheck,
  snrTemplate: RemediationTemplate | undefined
): FormViewValues => {
  const useEscalating = !!nodeHealthCheck.spec?.escalatingRemediations;
  return {
    name: nodeHealthCheck.metadata?.name,
    nodeSelector: selectorToStringArray(nodeHealthCheck.spec?.selector || {}),
    minHealthy: (nodeHealthCheck.spec?.minHealthy ?? "").toString(),
    maxUnhealthy: (nodeHealthCheck.spec?.maxUnhealthy ?? "").toString(),
    unhealthyConditions: getUnhealthyConditionsValue(nodeHealthCheck),
    remediator: !useEscalating
      ? getRemediationTemplateFormValues(
          snrTemplate,
          nodeHealthCheck?.spec?.remediationTemplate
        )
      : undefined,
    escalatingRemediations: getescalatingRemediationsFormValues(
      nodeHealthCheck.spec?.escalatingRemediations,
      snrTemplate
    ),
    useEscalating: !!nodeHealthCheck.spec?.escalatingRemediations,
  };
};

const parseThreshold = (value: string): string | number => {
  let parsed: string | number = value;
  if (value && value.match(MIN_HEALTHY_REGEX) && !value.endsWith("%")) {
    parsed = parseInt(value);
  }
  return parsed;
};

export const getSpec = (
  formViewFields: FormViewValues
): NodeHealthCheckSpec => {
  const { nodeSelector, minHealthy, maxUnhealthy, unhealthyConditions } =
    formViewFields;
  const computedMinHealthy =
    minHealthy && minHealthy.trim() !== ""
      ? parseThreshold(minHealthy)
      : undefined;
  const computedMaxUnhealthy =
    maxUnhealthy && maxUnhealthy.trim() !== ""
      ? parseThreshold(maxUnhealthy)
      : undefined;
  return {
    selector: selectorFromStringArray(nodeSelector),
    unhealthyConditions,
    minHealthy: computedMinHealthy,
    maxUnhealthy: computedMaxUnhealthy,
    remediationTemplate: !formViewFields.useEscalating
      ? formViewFields.remediator?.template
      : undefined,
    escalatingRemediations: formViewFields.useEscalating
      ? formViewFields.escalatingRemediations?.map((remediator) => ({
          remediationTemplate: remediator.template,
          order: remediator.order === "" ? undefined : remediator.order,
          timeout: remediator.timeout,
        }))
      : undefined,
  };
};

export const getNodeHealthCheck = (
  formViewValues: FormViewValues,
  yamlNodeHealthCheck: NodeHealthCheck
): NodeHealthCheck => {
  const formViewSpec = getSpec(formViewValues);
  const merged = {
    ...yamlNodeHealthCheck,
    metadata: {
      ...yamlNodeHealthCheck.metadata,
      name: formViewValues.name,
    },
    spec: {
      ...yamlNodeHealthCheck.spec,
      ...formViewSpec,
    },
  };
  return merged;
};
