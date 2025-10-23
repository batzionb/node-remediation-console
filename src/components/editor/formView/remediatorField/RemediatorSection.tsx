import { FormSection, Text, FormGroup } from "@patternfly/react-core";
import { useFormikContext } from "formik";
import * as React from "react";
import { NodeHealthCheckFormValues } from "../../../../data/types";
import { useNodeHealthCheckTranslation } from "../../../../localization/useNodeHealthCheckTranslation";
import CheckboxField from "../../../shared/CheckboxField";
import RemediationTemplate from "./RemediationTemplate";
import EscalatingRemediationsField from "./EscalatingRemediationsField";

const UseEscalatingField = () => {
  const { t } = useNodeHealthCheckTranslation();
  return (
    <CheckboxField
      name="formData.useEscalating"
      label={t("Use escalating remediations")}
    />
  );
};

const RemediatorSection = () => {
  const { t } = useNodeHealthCheckTranslation();
  const { values } = useFormikContext<NodeHealthCheckFormValues>();

  return (
    <FormSection title={t("Remediation")} titleElement="h2">
      <FormGroup>
        <UseEscalatingField />
        {!values.formData.useEscalating && (
          <RemediationTemplate fieldName={"formData.remediator"} />
        )}
        {values.formData.useEscalating && (
          <>
            <Text>
              {t(
                "Rearrange the templates using drag and drop or by editing the ‘Order’ field. The remediations will be executed in the specified order."
              )}
            </Text>
            <EscalatingRemediationsField />
          </>
        )}
      </FormGroup>
    </FormSection>
  );
};

export default RemediatorSection;
