import * as React from "react";

import { FormViewFieldProps } from "../propTypes";

import RemediatorKindField from "./RemediatorKindField";
import { useField } from "formik";
import { useFormikValidationFix } from "../../../../copiedFromConsole/hooks/formik-validation-fix";
import { Remediator, RemediationTemplate } from "../../../../data/types";
import { REMEDIATOR_DEFINITIONS } from "../../../../data/remediators";
import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import useRemediationResources from "../../../../apis/useRemediationResources";
import { useNodeHealthCheckTranslation } from "../../../../localization/useNodeHealthCheckTranslation";
import { K8sResourceCommon } from "@openshift-console/dynamic-plugin-sdk";
import { getFieldId } from "../../../../copiedFromConsole/formik-fields/field-utils";

const convertResourceToTemplate = (
  resource: K8sResourceCommon
): RemediationTemplate => {
  return {
    apiVersion: resource.apiVersion ?? "",
    kind: resource.kind ?? "",
    name: resource.metadata?.name ?? "",
    namespace: resource.metadata?.namespace ?? "",
  };
};

const RemediationResourceField = ({ fieldName }: FormViewFieldProps) => {
  const { t } = useNodeHealthCheckTranslation();
  const [{ value: remediatorValue }, , { setValue: setRemediator }] =
    useField<Remediator>(fieldName);
  const [{ value: templateValue }, , { setValue: setTemplate }] =
    useField<RemediationTemplate>(`${fieldName}.template`);
  const remediationResources = useRemediationResources();
  const [isOpen, setIsOpen] = React.useState(false);
  const resourceFieldName = `${fieldName}.template.resource`;
  const fieldId = getFieldId(resourceFieldName, "dropdown");

  // Get the selected remediator definition
  const selectedRemediator = React.useMemo(() => {
    return REMEDIATOR_DEFINITIONS.find(
      (def) => def.id === remediatorValue?.radioOption
    );
  }, [remediatorValue?.radioOption]);

  // Get resources for the selected remediator kind
  const availableResources = React.useMemo(() => {
    if (!selectedRemediator?.templateKind) {
      return [];
    }
    const resourcesData = remediationResources.get(
      selectedRemediator.templateKind
    );
    return resourcesData?.resources ?? [];
  }, [selectedRemediator?.templateKind, remediationResources]);

  // Create select items from resources
  const selectItems = React.useMemo(() => {
    return availableResources.map((resource) => {
      const template = convertResourceToTemplate(resource);
      const name = resource.metadata?.name ?? "";
      const namespace = resource.metadata?.namespace ?? "";
      const value = JSON.stringify(template);

      return {
        label: name,
        value,
        namespace,
        template,
      };
    });
  }, [availableResources]);

  // Get current selected value
  const currentValue = React.useMemo(() => {
    if (!templateValue) {
      return "";
    }
    return JSON.stringify(templateValue);
  }, [templateValue]);

  // Find current selected item
  const currentItem = React.useMemo(() => {
    return selectItems.find((item) => item.value === currentValue);
  }, [selectItems, currentValue]);

  // Handle resource selection
  const onSelect = React.useCallback(
    (
      _event: React.MouseEvent | undefined,
      value: string | number | undefined
    ) => {
      setIsOpen(false);
      const selectedItem = selectItems.find((item) => item.value === value);
      if (selectedItem) {
        setTemplate(selectedItem.template);
        setRemediator({
          ...remediatorValue,
          template: selectedItem.template,
        });
      }
    },
    [selectItems, setTemplate, setRemediator, remediatorValue]
  );

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  if (!selectedRemediator?.templateKind) {
    return null;
  }

  const resourcesData = remediationResources.get(
    selectedRemediator.templateKind
  );
  const isLoading = !resourcesData?.loaded;

  return (
    <FormGroup fieldId={fieldId} label={t("Remediation Resource")} isRequired>
      <Select
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            onClick={onToggle}
            isDisabled={isLoading || selectItems.length === 0}
            isExpanded={isOpen}
          >
            {currentItem?.label ?? t("Select a resource")}
          </MenuToggle>
        )}
        onOpenChange={setIsOpen}
        onSelect={onSelect}
        isOpen={isOpen}
        selected={currentValue}
      >
        <SelectList>
          {selectItems.map((item) => (
            <SelectOption
              key={item.value}
              value={item.value}
              description={
                item.namespace
                  ? t("Namespace: {{namespace}}", {
                      namespace: item.namespace,
                    })
                  : undefined
              }
            >
              {item.label}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </FormGroup>
  );
};

export const RemediatorField: React.FC<{
  fieldName: string;
}> = ({ fieldName }) => {
  const [value] = useField<Remediator>(fieldName);
  useFormikValidationFix(value);
  return (
    <Flex
      direction={{ default: "column" }}
      spaceItems={{ default: "spaceItemsSm" }}
    >
      <FlexItem>
        <RemediatorKindField fieldName={fieldName} />
      </FlexItem>
      <FlexItem>
        <RemediationResourceField fieldName={fieldName} />
      </FlexItem>
    </Flex>
  );
};

export default RemediatorField;
