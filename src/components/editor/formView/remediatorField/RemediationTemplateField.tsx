import {
  FormSection,
  Skeleton,
  Text,
  FormGroup,
  Alert,
} from "@patternfly/react-core";
import { useFormikContext } from "formik";
import { range } from "lodash";
import * as React from "react";
import { getDefaultRemediator } from "../../../../data/remediator";
import {
  NodeHealthCheckFormValues,
  SnrTemplateResult,
} from "../../../../data/types";
import { useNodeHealthCheckTranslation } from "../../../../localization/useNodeHealthCheckTranslation";
import CheckboxField from "../../../shared/CheckboxField";
import RemediatorField from "./RemediatorField";
import RemediatorsArrayField from "./RemediatorsArrayField";
import useRemediators from "../../../../apis/useRemediators";

const UseEscalatingField = () => {
  const { t } = useNodeHealthCheckTranslation();
  return (
    <CheckboxField
      name="formData.useEscalating"
      label={t("Use escalating remediations")}
    />
  );
};

const Loading = () => (
  <>
    {range(0, 5).map((idx) => (
      <Skeleton key={idx} />
    ))}
  </>
);

const RemediationTemplateField = ({
  snrTemplateResult,
}: {
  snrTemplateResult: SnrTemplateResult;
}) => {
  const [snrTemplate, loaded] = snrTemplateResult;
  const { t } = useNodeHealthCheckTranslation();
  const { values, setFieldValue } =
    useFormikContext<NodeHealthCheckFormValues>();
  const remediators = useRemediators();

  // Check if any remediator is installed
  const hasInstalledRemediator = React.useMemo(() => {
    return remediators.some((r) => r.installed);
  }, [remediators]);

  React.useEffect(() => {
    const defaultRemediator = getDefaultRemediator(snrTemplate, remediators);
    if (!loaded) {
      return;
    }
    if (!values.formData.remediator) {
      setFieldValue("formData.remediator", defaultRemediator);
    }
    if (!values.formData.escalatingRemediations?.length) {
      setFieldValue("formData.escalatingRemediations", [
        { ...defaultRemediator, order: 0 },
      ]);
    }
  }, [
    loaded,
    values.formData.remediator,
    values.formData.escalatingRemediations,
    setFieldValue,
    snrTemplate,
    remediators,
  ]);

  return (
    <FormSection title={t("Remediation")} titleElement="h2">
      <FormGroup>
        <UseEscalatingField />
        {!loaded && <Loading />}
        {loaded && !hasInstalledRemediator && (
          <Alert
            variant="warning"
            isInline
            title={t("No remediation operators installed")}
          >
            {t(
              "At least one remediation operator must be installed to configure remediation. Self Node Remediation is recommended as the default option."
            )}
          </Alert>
        )}
        {loaded && !values.formData.useEscalating && (
          <RemediatorField fieldName={"formData.remediator"} />
        )}
        {loaded && values.formData.useEscalating && (
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
