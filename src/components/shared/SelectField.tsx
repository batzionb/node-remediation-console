import * as React from "react";
import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";
import { useField } from "formik";
import { getFieldId } from "../../copiedFromConsole/formik-fields/field-utils";
import { TextInput } from "@patternfly/react-core";

export type SelectItem = {
  label: string;
  value: string;
};

const isReactElement = (
  item: SelectItem | React.ReactElement
): item is React.ReactElement => {
  return "props" in item;
};

export type SelectFieldProps = {
  name: string;
  label?: string;
  isRequired?: boolean;
  items: (SelectItem | React.ReactElement)[];
  isDisabled?: boolean;
  isSearchable?: boolean;
  menuMaxHeightPx?: number;
  placeholder?: string;
  onSelect?: (value?: string) => void;
};

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  isRequired = false,
  items,
  isDisabled = false,
  isSearchable = true,
  menuMaxHeightPx = 320,
  placeholder,
  onSelect: onSelectCallback,
}) => {
  const [{ value }, , { setValue }] = useField<string>(name);
  const [isOpen, setIsOpen] = React.useState(false);
  const [filterText, setFilterText] = React.useState("");
  const fieldId = getFieldId(name, "dropdown");

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (e, selectedValue) => {
    setIsOpen(false);
    setValue(selectedValue);
    if (onSelectCallback) {
      onSelectCallback(selectedValue);
    }
  };

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setFilterText("");
    }
  };

  const normalizedFilter = filterText.trim().toLowerCase();
  const filteredItems = React.useMemo(() => {
    if (!isSearchable || !normalizedFilter) return items;
    return items.filter((item) => {
      if (isReactElement(item)) return true;
      return item.label.toLowerCase().includes(normalizedFilter);
    });
  }, [items, isSearchable, normalizedFilter]);

  const getSelectItems = () => {
    return filteredItems.map((item, idx) => {
      if (isReactElement(item)) {
        return item;
      }
      return (
        <SelectOption
          key={idx}
          data-test={`select-${item.label}`}
          value={item.value}
        >
          {item.label}
        </SelectOption>
      );
    });
  };

  const getToggleLabel = () => {
    const selectItem = items.find(
      (item) => !isReactElement(item) && item.value === value
    ) as SelectItem;
    if (selectItem) {
      return selectItem.label;
    }
    const hasValue = typeof value === "string" && value.length > 0;
    if (hasValue) {
      return value;
    }
    return placeholder || label || name;
  };

  return (
    <FormGroup fieldId={fieldId} label={label} isRequired={isRequired}>
      <Select
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            data-test={`toggle-${label}-select`}
            onClick={onToggle}
            isDisabled={isDisabled}
            isExpanded={isOpen}
            style={{
              width: "100%",
            }}
          >
            {getToggleLabel()}
          </MenuToggle>
        )}
        onOpenChange={onOpenChange}
        onSelect={handleSelect}
        isOpen={isOpen}
        readOnly={isDisabled}
      >
        {isSearchable && (
          <div style={{ padding: "8px" }}>
            <TextInput
              aria-label={`${label || name} search input`}
              value={filterText}
              onChange={(_e, val) => setFilterText(val)}
              placeholder="Search..."
              isDisabled={isDisabled}
            />
          </div>
        )}
        <div style={{ maxHeight: `${menuMaxHeightPx}px`, overflowY: "auto" }}>
          <SelectList>{getSelectItems()}</SelectList>
        </div>
      </Select>
    </FormGroup>
  );
};

export default SelectField;
