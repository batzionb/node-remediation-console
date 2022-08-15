import {
  Button,
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  TextInput,
} from "@patternfly/react-core";
import { getFieldId } from "copiedFromConsole/formik-fields/field-utils";
import * as React from "react";
import * as _ from "lodash";
import { useNodeHealthCheckTranslation } from "localization/useNodeHealthCheckTranslation";
import { useField } from "formik";

type CustomTypeModalProps = {
  onClose(): void;
  isOpen: boolean;
  fieldName: string;
};

const CustomTypeModal: React.FC<CustomTypeModalProps> = ({
  fieldName,
  isOpen,
  onClose,
}) => {
  const { t } = useNodeHealthCheckTranslation();
  const [, , { setValue }] = useField(fieldName);
  const [customType, setCustomType] = React.useState<string>("");
  React.useEffect(() => {
    if (!isOpen) {
      setCustomType("");
    }
  }, [isOpen]);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      title={t("Use custom type")}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={() => {
            setValue(customType);
            onClose();
          }}
          isDisabled={!customType}
        >
          Create
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {t("Cancel")}
        </Button>,
      ]}
    >
      <Form>
        <FormGroup
          isRequired
          label={t("Type")}
          helperText={t("Name of the custom type")}
          fieldId={getFieldId("customType", "input")}
        >
          <TextInput
            name={fieldName}
            value={customType}
            onChange={(value) => setCustomType(value)}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default CustomTypeModal;
