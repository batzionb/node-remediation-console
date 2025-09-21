import { FormSection, Text, FormGroup } from "@patternfly/react-core";
import { useFormikContext } from "formik";
import * as React from "react";
import { NodeHealthCheckFormValues } from "../../../../data/types";
import { useNodeHealthCheckTranslation } from "../../../../localization/useNodeHealthCheckTranslation";
import CheckboxField from "../../../shared/CheckboxField";
import RemediatorField from "./RemediatorField";
import RemediatorsArrayField from "./RemediatorsArrayField";

const UseEscalatingField = () => {
  const { t } = useNodeHealthCheckTranslation();
  return (
    <CheckboxField
      name="formData.useEscalating"
      label={t("Use escalating remediations")}
    />
  );
};

const RemediationTemplateField = () => {
  const { t } = useNodeHealthCheckTranslation();
  const { values } = useFormikContext<NodeHealthCheckFormValues>();

  return (
    <FormSection title={t("Remediation")} titleElement="h2">
      <FormGroup>
        <UseEscalatingField />
        {!values.formData.useEscalating && (
          <RemediatorField fieldName={"formData.remediator"} />
        )}
        {values.formData.useEscalating && (
          <>
            <Text>
              {t(
                "Rearrange the templates using drag and drop or by editing the ‘Order’ field. The remediations will be executed in the specified order."
              )}
            </Text>
            <RemediatorsArrayField />
          </>
        )}
      </FormGroup>
    </FormSection>
  );
};

export default RemediationTemplateField;
