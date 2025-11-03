import * as React from "react";
import {
  Text,
  TextContent,
  List,
  ListItem,
  Button,
} from "@patternfly/react-core";
import { useNodeHealthCheckTranslation } from "../../../../localization/useNodeHealthCheckTranslation";

interface Operator {
  name: string;
  acronym: string;
}

const RemediationHelp: React.FC = () => {
  const { t } = useNodeHealthCheckTranslation();

  const operators: Operator[] = [
    {
      name: "Self Node Remediation",
      acronym: "SNR",
    },
    {
      name: "Fence Agents Remediation",
      acronym: "FAR",
    },
    {
      name: "Machine Deletion Remediation",
      acronym: "MDR",
    },
  ];

  const createKeyword = (name: string): string => {
    return name.replace(/\s+/g, "%20");
  };

  return (
    <TextContent>
      <Text>
        {t(
          "Select a remediation template that defines how unhealthy nodes should be recovered."
        )}
      </Text>
      <Text
        component="small"
        style={{ fontStyle: "italic", fontSize: "14px", marginTop: "12px" }}
      >
        {t(
          "RemediationTemplate is a reference to a remediation template provided by an infrastructure provider. If a node needs remediation the controller will create an object from this template and then it should be picked up by a remediation provider."
        )}
      </Text>
      <Text component="p" style={{ marginTop: "12px" }}>
        {t("Recommended operators:")}
      </Text>
      <List isPlain>
        {operators.map((operator) => (
          <ListItem key={operator.acronym}>
            <Button
              variant="link"
              component="a"
              href={`/operatorhub?keyword=${createKeyword(operator.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              isInline
            >
              {t(`${operator.name} (${operator.acronym})`)}
            </Button>
          </ListItem>
        ))}
      </List>
      <Text component="p" style={{ marginTop: "8px" }}>
        {t("Install them from OperatorHub.")}
      </Text>
    </TextContent>
  );
};

export default RemediationHelp;
