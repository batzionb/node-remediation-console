import * as React from "react";

import { useField } from "formik";
import { useFormikValidationFix } from "../../../../copiedFromConsole/hooks/formik-validation-fix";
import { Remediator } from "../../../../data/types";
import { Flex, FlexItem } from "@patternfly/react-core";
import CustomRemediatorField from "./CustomRemediatorField";

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
        <CustomRemediatorField fieldName={fieldName} />
      </FlexItem>
    </Flex>
  );
};

export default RemediatorField;
