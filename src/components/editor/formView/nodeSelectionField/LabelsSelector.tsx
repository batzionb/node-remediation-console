import { Chip, ChipGroup, SelectProps } from "@patternfly/react-core";
import { getNodeWorkerLabel } from "components/copiedFromConsole/selectors/node";
import { NodeKind } from "components/copiedFromConsole/types/node";
import { MultiSelectOption } from "components/shared/field-types";
import { getObjectLabelDisplayNames } from "data/nodeSelectorData";
import { useField } from "formik";
import { useNodeHealthCheckTranslation } from "localization/useNodeHealthCheckTranslation";
import * as _ from "lodash";
import * as React from "react";
import MultiSelectField from "../../../shared/MultiSelectField";
import { useIsSNR } from "../remediatorFieldUtils";
import "./labelSelector.css";

const LabelsSelector: React.FC<{
  nodes: NodeKind[];
  formViewFieldName: string;
  fieldName;
}> = ({ nodes, formViewFieldName, fieldName }) => {
  const isSNR = useIsSNR(formViewFieldName);
  const [{ value }, , { setValue }] = useField<string[]>(fieldName);
  const disableLabel = (label) => label === getNodeWorkerLabel() && isSNR;
  //handling of SNR and master nodes: since SNR doesn't support master nodes, worker node label is defined by default
  //and is disabled with a popover explaining why it's disabled
  const { t } = useNodeHealthCheckTranslation();

  const onSelect: SelectProps["onSelect"] = (event, selection) => {
    // already selected
    const selected = value;
    let selectionValue: string;
    if (typeof selection === "string") {
      selectionValue = selection;
    } else {
      selectionValue = selection.toString();
    }
    let newValue;
    if (selected.includes(selectionValue)) {
      newValue = selected.filter((sel: string) => sel !== selectionValue);
    } else {
      newValue = [...value, selectionValue];
    }
    setValue(newValue);
  };

  const nodeLabelOptions: string[] = Array.from(
    new Set(
      _.flatten(nodes.map((object) => getObjectLabelDisplayNames(object)))
    )
  );
  nodeLabelOptions.sort((a, b) => {
    if (disableLabel(a)) {
      return 1;
    }
    if (disableLabel(b)) {
      return -1;
    }
    return a.localeCompare(b, undefined, { numeric: true });
  });

  const multiSelectOptions = nodeLabelOptions.map<MultiSelectOption>(
    (value) => {
      const ret: MultiSelectOption = {
        isLastOptionBeforeFooter: (index: number): boolean =>
          index === value.length,
        id: value,
        value: value,
        displayName: value,
      };
      return ret;
    }
  );

  const chipGroupComponent = (
    <ChipGroup>
      {" "}
      {(value || []).map((currentChip, index) => {
        const isReadOnly = disableLabel(value[index]);
        const className = isReadOnly ? "label-selector-chip-disabled" : null;
        return (
          <Chip
            isReadOnly={isReadOnly}
            key={currentChip}
            className={className}
            onClick={(event) => onSelect(event, currentChip)}
          >
            {currentChip}
          </Chip>
        );
      })}
    </ChipGroup>
  );
  return (
    <MultiSelectField
      name={fieldName}
      label={t("Nodes selection")}
      helpText={t(
        "Use labels to select the nodes you want to remediate. Leaving this field empty will select all nodes of the cluster."
      )}
      chipGroupComponent={chipGroupComponent}
      options={multiSelectOptions}
      onSelect={onSelect}
      enableClear={!isSNR}
    />
  );
};

export default LabelsSelector;
