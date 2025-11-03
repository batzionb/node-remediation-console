import * as React from "react";
import { useField } from "formik";
import { Flex, FlexItem } from "@patternfly/react-core";
import SelectField, { SelectItem } from "../../../shared/SelectField";
import useCombinedNamespaceAndNameItems, {
  NameNamespaceSelectItem,
} from "../../../../apis/useCombinedNamespaceAndNameItems";
import { useNodeHealthCheckTranslation } from "../../../../localization/useNodeHealthCheckTranslation";
import { withFallback } from "../../../../copiedFromConsole/error";
import { FormViewFieldProps } from "../propTypes";
import useRemediatorKindAndVersionItems, {
  KindVersionSelectItem,
} from "../../../../apis/useRemediatorKindAndVersionItems";
import { RemediationTemplate as RemediationTemplateType } from "../../../../data/types";

const RemediationTemplate = ({ fieldName }: FormViewFieldProps) => {
  const [{ value: template }, , { setValue: setTemplate }] = useField<
    RemediationTemplateType | undefined
  >(`${fieldName}.template`);

  // Ensure template object always exists
  React.useEffect(() => {
    if (!template) {
      setTemplate({
        apiVersion: "",
        kind: "",
        name: "",
        namespace: "",
      });
    }
  }, [template, setTemplate]);

  const { t } = useNodeHealthCheckTranslation();

  // CRD-based, template-aware lists (kind-first) via shared hook
  const [kindItems, templateLoaded] = useRemediatorKindAndVersionItems();

  // Store selected items in state
  const [selectedKindItem, setSelectedKindItem] = React.useState<
    KindVersionSelectItem | undefined
  >(undefined);
  const [selectedNameItem, setSelectedNameItem] = React.useState<
    NameNamespaceSelectItem | undefined
  >(undefined);

  // Sync selected kind item when form values or items change
  React.useEffect(() => {
    const found = kindItems.find(
      (item): item is KindVersionSelectItem =>
        item.kind === template?.kind &&
        item.combinedApiVersion === template?.apiVersion
    );
    setSelectedKindItem(found);
  }, [kindItems, template]);

  const { nameItems, namesLoaded, namesError } =
    useCombinedNamespaceAndNameItems(selectedKindItem);

  // Sync selected name item when form values or items change
  React.useEffect(() => {
    const found = nameItems.find(
      (item): item is NameNamespaceSelectItem =>
        item.name === template?.name &&
        (item.namespace || "") === template?.namespace
    );
    setSelectedNameItem(found);
  }, [nameItems, template]);

  // Handle apiVersion/kind selection - update template field
  const handleApiVersionAndKindChange = React.useCallback(
    (_value: string | undefined, item?: SelectItem) => {
      const kindItem = item as KindVersionSelectItem | undefined;
      if (kindItem?.combinedApiVersion && kindItem?.kind) {
        setTemplate({
          apiVersion: kindItem.combinedApiVersion,
          kind: kindItem.kind,
          name: "",
          namespace: "",
        });
        setSelectedKindItem(kindItem);
        setSelectedNameItem(undefined); // Clear dependent item
      }
    },
    [setTemplate]
  );

  // Handle namespace/name selection - update template field
  const handleNamespaceAndNameChange = React.useCallback(
    (_value: string | undefined, item?: SelectItem) => {
      const nameItem = item as NameNamespaceSelectItem | undefined;
      if (nameItem?.name) {
        setTemplate({
          ...template,
          name: nameItem.name,
          namespace: nameItem.namespace || "",
        });
        setSelectedNameItem(nameItem);
      }
    },
    [template, setTemplate]
  );

  const hasNamesError = !!namesError;

  return (
    <Flex
      direction={{ default: "column" }}
      spaceItems={{ default: "spaceItemsSm" }}
    >
      <FlexItem>
        <SelectField
          name={`${fieldName}.template.kind`}
          label="Kind"
          isRequired
          items={kindItems}
          isDisabled={!templateLoaded}
          placeholder={
            templateLoaded
              ? undefined
              : hasNamesError
              ? t("Error loading kinds")
              : t("Loading kinds...")
          }
          onSelect={handleApiVersionAndKindChange}
          selectedItem={selectedKindItem}
        />
      </FlexItem>
      <FlexItem>
        <SelectField
          name={`${fieldName}.template.name`}
          label="Name"
          isRequired
          items={nameItems}
          isDisabled={!selectedKindItem || !namesLoaded || hasNamesError}
          placeholder={
            hasNamesError
              ? t("Error loading templates")
              : namesLoaded
              ? undefined
              : t("Loading templates...")
          }
          onSelect={handleNamespaceAndNameChange}
          selectedItem={selectedNameItem}
        />
      </FlexItem>
    </Flex>
  );
};

export default withFallback(RemediationTemplate);
