import * as React from "react";
import { useFormikContext } from "formik";
import {
  Alert,
  Form,
  TextInputTypes,
  FormSection,
  Text,
} from "@patternfly/react-core";
import InputField from "../../../copiedFromConsole/formik-fields/InputField";
import NodeSelectionField from "./nodeSelectionField/NodeSelectionField";
import { FormViewFieldProps } from "./propTypes";
import UnhealthyConditionsField from "./unhealthyConditionsField/UnhealthyConditionsField";
import { withFallback } from "copiedFromConsole/error";
import HelpIcon from "components/shared/HelpIcon";
import { getObjectItemFieldName } from "../../shared/formik-utils";
import { NodeHealthCheckFormValues } from "../../../data/types";
import { useNodeHealthCheckTranslation } from "../../../localization/useNodeHealthCheckTranslation";
import useSnrTemplate from "../../../apis/useSNRTemplate";
import RemediationTemplateField from "./remediatorField/RemediationTemplateField";
import "../../editor/nhc-form.css";

const MinHealthyField = ({ fieldName }: FormViewFieldProps) => {
  const { t } = useNodeHealthCheckTranslation();
  return (
    <InputField
      label={t("Min healthy")}
      helpText={t("help.thresholdFormat")}
      labelIcon={
        <HelpIcon
          helpText={t(
            `Remediation is allowed if at least "Min healthy" nodes selected by "selector" are healthy. Min healthy should not be used with remediators that delete nodes (e.g. MachineDeletionRemediation), as this breaks the logic for counting healthy and unhealthy nodes.`
          )}
        />
      }
      name={fieldName}
      data-test="min-healthy"
    />
  );
};

const MaxUnhealthyField = ({ fieldName }: FormViewFieldProps) => {
  const { t } = useNodeHealthCheckTranslation();
  return (
    <InputField
      label={t("Max unhealthy")}
      helpText={t("help.thresholdFormat")}
      labelIcon={
        <HelpIcon
          helpText={t(
            `Remediation is allowed if no more than "Max unhealthy" nodes selected by "selector" are unhealthy.`
          )}
        />
      }
      name={fieldName}
      data-test="max-unhealthy"
    />
  );
};

const NodeHealthCheckFormFields_: React.FC = () => {
  const { t } = useNodeHealthCheckTranslation();
  const { values } = useFormikContext<NodeHealthCheckFormValues>();
  const formViewFieldName = "formData";
  const snrTemplateResult = useSnrTemplate();
  return (
    <Form>
      <Alert
        isInline
        variant="info"
        title={t(
          `Some fields may not be represented in this form view. Please select "YAML view" for full control`
        )}
        id="info-inline-alert"
      />
      <InputField
        type={TextInputTypes.text}
        required
        isDisabled={!values.isCreateFlow}
        name="formData.name"
        label={t("Name")}
        data-test="NodeHealthCheck-name"
        helpText={t("A unique name for the NodeHealthCheck")}
      />
      <RemediationTemplateField snrTemplateResult={snrTemplateResult} />

      <NodeSelectionField
        fieldName={getObjectItemFieldName([formViewFieldName, "nodeSelector"])}
      />
      <FormSection title={t("Remediation thresholds")} titleElement="h2">
        <Text>
          {t(
            "Min healthy and Max unhealthy configure the same aspect — specify exactly one (not both)."
          )}
        </Text>
        <MinHealthyField
          fieldName={getObjectItemFieldName([formViewFieldName, "minHealthy"])}
        />
        <MaxUnhealthyField
          fieldName={getObjectItemFieldName([
            formViewFieldName,
            "maxUnhealthy",
          ])}
        />
      </FormSection>
      <UnhealthyConditionsField
        fieldName={getObjectItemFieldName([
          formViewFieldName,
          "unhealthyConditions",
        ])}
      />
    </Form>
  );
};

const NodeHealthCheckFormFields = withFallback(NodeHealthCheckFormFields_);

export default NodeHealthCheckFormFields;
