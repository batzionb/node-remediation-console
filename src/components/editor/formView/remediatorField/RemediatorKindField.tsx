import {
  FormGroup,
  Split,
  SplitItem,
  Popover,
  Button,
  Stack,
  StackItem,
  Text,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { useField } from "formik";
import * as React from "react";
import { Link } from "react-router-dom";
import { withFallback } from "../../../../copiedFromConsole/error";
import { getFieldId } from "../../../../copiedFromConsole/formik-fields/field-utils";
import RadioButtonField from "../../../../copiedFromConsole/formik-fields/RadioButtonField";
import { getEmptyRemediationTemplate } from "../../../../data/remediator";
import { Remediator } from "../../../../data/types";
import { RemediatorRadioOptionId } from "../../../../data/remediators";
import { useNodeHealthCheckTranslation } from "../../../../localization/useNodeHealthCheckTranslation";
import useRemediators, {
  RemediatorInfo,
} from "../../../../apis/useRemediators";
import { getOperatorHubLink } from "../../../../data/remediators";
import HelpIcon from "../../../shared/HelpIcon";

const RemediatorKindRadioGroup: React.FC<{
  fieldName: string;
  onChange: (kind: RemediatorRadioOptionId) => void;
}> = ({ fieldName, onChange }) => {
  const { t } = useNodeHealthCheckTranslation();
  const remediators = useRemediators();
  const fieldId = getFieldId(fieldName, "radiogroup");

  const getRemediatorPopoverContent = (
    remediator: RemediatorInfo
  ): React.ReactNode | undefined => {
    if (remediator.installed) {
      return undefined;
    }

    const message = t(
      "{{name}} is not installed. Install the operator to use this remediation type.",
      { name: remediator.name }
    );

    const installHref = getOperatorHubLink(remediator.name);

    return (
      <Stack>
        <StackItem>
          <Text>{message}</Text>
        </StackItem>
        <StackItem>
          <Link to={installHref} target="_blank" rel="noopener noreferrer">
            <Button variant="link" isInline>
              {t("Install {{name}}", { name: remediator.name })}
            </Button>
          </Link>
        </StackItem>
      </Stack>
    );
  };

  return (
    <FormGroup
      fieldId={fieldId}
      label={t("Remediation template")}
      isInline={true}
    >
      <Split hasGutter>
        {remediators.map((remediator) => {
          const popoverContent = getRemediatorPopoverContent(remediator);
          const radioButton = (
            <RadioButtonField
              value={remediator.id}
              label={remediator.name}
              isDisabled={!remediator.installed}
              aria-describedby={`${remediator.id} remediator kind`}
              name={fieldName}
              onChange={onChange}
            />
          );

          const radioButtonWithHelp = (
            <Flex
              direction={{ default: "row" }}
              spaceItems={{ default: "spaceItemsXs" }}
              alignItems={{ default: "alignItemsCenter" }}
            >
              <FlexItem>
                {popoverContent ? (
                  <Popover
                    bodyContent={popoverContent}
                    position="top"
                    triggerAction="hover"
                  >
                    <div style={{ display: "inline-block" }}>{radioButton}</div>
                  </Popover>
                ) : (
                  radioButton
                )}
              </FlexItem>
              <FlexItem>
                <HelpIcon helpText={remediator.description} />
              </FlexItem>
            </Flex>
          );

          return (
            <SplitItem key={remediator.id}>{radioButtonWithHelp}</SplitItem>
          );
        })}
      </Split>
    </FormGroup>
  );
};

const RemediatorKindField_ = ({ fieldName }: { fieldName: string }) => {
  const [{ value }, , { setValue: setRemediator }] =
    useField<Remediator>(fieldName);

  const onChange = (kind: RemediatorRadioOptionId) => {
    // When changing remediator kind, reset template to empty
    // User will select the specific resource from the dropdown
    setRemediator({
      ...value,
      radioOption: kind,
      template: getEmptyRemediationTemplate(),
    });
  };

  return (
    <RemediatorKindRadioGroup
      fieldName={`${fieldName}.radioOption`}
      onChange={onChange}
    />
  );
};

const RemediatorKindField = withFallback(RemediatorKindField_);

export default RemediatorKindField;
