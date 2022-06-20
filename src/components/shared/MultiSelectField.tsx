import * as React from "react";
import { useField } from "formik";
import Fuse from "fuse.js";
import {
  FormGroup,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectOptionProps,
  SelectVariant,
} from "@patternfly/react-core";
import { getFieldId } from "components/copiedFromConsole/formik-fields/field-utils";
import { MultiSelectFieldProps, MultiSelectOption } from "./field-types";

// Field value is a string[]
const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  options,
  helpText,
  placeholderText,
  getHelperText,
  required,
  onChange,
  labelIcon,
  chipGroupComponent,
  onSelect,
  enableClear,
  ...props
}) => {
  const [isOpen, setOpen] = React.useState(false);
  const [field, { touched, error }, { setValue }] = useField(props.name);
  const fieldId = getFieldId(props.name, "multiinput");
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : "";
  const hText = getHelperText ? getHelperText(field.value) : helpText;

  const onToggle = (isOpen: boolean) => setOpen(isOpen);
  const onClearSelection = () => {
    // onChange && onChange(event);
    setValue([]);
    onChange && onChange([]);
    setOpen(false);
  };

  // list of already selected options
  const selections: (SelectOptionObject | string)[] = field.value.map(
    (value: string) => {
      const option = options.find((opt) => opt.value === value);
      return option
        ? {
            value: option.value,
            toString: () => option.displayName,
            compareTo: (selectOption: { value: string }) =>
              selectOption.value === value,
          }
        : value;
    }
  );

  const children = options
    .filter((option) => !(field.value || []).includes(option.value))
    .map((option) => (
      <SelectOption
        key={option.id}
        id={option.id}
        value={option.value}
        isDisabled={option.isDisabled}
      >
        {option.displayName}
      </SelectOption>
    ));

  const fuse = new Fuse(options, {
    ignoreLocation: true,
    keys: ["displayName"],
  });

  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      helperText={hText}
      helperTextInvalid={errorMessage}
      validated={isValid ? "default" : "error"}
      isRequired={required}
      labelIcon={labelIcon}
    >
      <Select
        {...field}
        {...props}
        id={fieldId}
        variant={SelectVariant.typeaheadMulti}
        typeAheadAriaLabel="Select a label"
        validated={isValid ? "default" : "error"}
        aria-describedby={`${fieldId}-helper`}
        isCreatable={false}
        placeholderText={placeholderText}
        isOpen={isOpen}
        onToggle={onToggle}
        onSelect={onSelect}
        selections={selections}
        onClear={enableClear ? onClearSelection : null}
        onFilter={(e, val) => {
          if (!val || val === "") {
            return children;
          }
          const results = fuse
            .search<MultiSelectOption>(val)
            .map((result) => result.item.id);
          return (
            React.Children.toArray(
              children
            ) as React.ReactElement<SelectOptionProps>[]
          ).filter(({ props }) => results.includes(props.id as string));
        }}
        chipGroupComponent={chipGroupComponent}
      >
        {children}
      </Select>
    </FormGroup>
  );
};

export default MultiSelectField;
