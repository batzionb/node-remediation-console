import * as React from "react";
import { useField } from "formik";
import { capitalize, startCase } from "lodash-es";
import { Alert, Flex, FlexItem } from "@patternfly/react-core";
import SelectField from "../../../shared/SelectField";
import { getObjectItemFieldName } from "../../../shared/formik-utils";
import { Remediator } from "../../../../data/types";
import useNamespaceAndNameItems from "../../../../apis/useNamespaceAndNameItems";
import { useNodeHealthCheckTranslation } from "../../../../localization/useNodeHealthCheckTranslation";
import { withFallback } from "../../../../copiedFromConsole/error";
import { FormViewFieldProps } from "../propTypes";
import useRemediatorKindAndVersionItems from "../../../../apis/useRemediatorKindAndVersionItems";

const sentenceCase = (string: string) => {
  return capitalize(startCase(string));
};

const RemediationTemplate = ({ fieldName }: FormViewFieldProps) => {
  const [{ value }] = useField<Remediator>(fieldName);
  const { t } = useNodeHealthCheckTranslation();

  const selectedApiVersion = value?.template?.apiVersion || "";
  const selectedKind = value?.template?.kind || "";
  const selectedNamespace = value?.template?.namespace || "";
  const selectedName = value?.template?.name || "";

  // CRD-based, template-aware lists (kind-first) via shared hook
  const [kindItems, apiVersionItems, templateLoaded, , kindToVersions] =
    useRemediatorKindAndVersionItems(selectedKind);

  const {
    namespaceItems,
    nameItems,
    namespacesLoaded,
    namesLoaded,
    namespacesError,
    namesError,
  } = useNamespaceAndNameItems(
    selectedApiVersion,
    selectedKind,
    selectedNamespace || undefined
  );

  const apiVersionFieldName = getObjectItemFieldName([
    fieldName,
    "template",
    "apiVersion",
  ]);
  const kindFieldName = getObjectItemFieldName([fieldName, "template", "kind"]);
  const namespaceFieldName = getObjectItemFieldName([
    fieldName,
    "template",
    "namespace",
  ]);
  const nameFieldName = getObjectItemFieldName([fieldName, "template", "name"]);

  //  const [, , { setValue: setApiVersion }] =
  // useField<string>(apiVersionFieldName);
  // const [, , { setValue: setKind }] = useField<string>(kindFieldName);
  // const [, , { setValue: setNamespace }] = useField<string>(namespaceFieldName);
  // const [, , { setValue: setName }] = useField<string>(nameFieldName);

  // Default kind: when lists load and there is exactly one option, pick it
  // React.useEffect(() => {
  //   if (!templateLoaded) return;
  //   if (!selectedKind && kindItems.length === 1) {
  //     setKind(kindItems[0].value);
  //   }
  // }, [templateLoaded, selectedKind, kindItems, setKind]);

  // Default apiVersion: when a kind is selected and there is exactly one version, pick it
  // React.useEffect(() => {
  //   if (!selectedKind) return;
  //   if (selectedApiVersion) return;
  //   const versions = kindToVersions[selectedKind] || [];
  //   if (versions.length === 1) {
  //     setApiVersion(versions[0]);
  //   } else {
  //     setApiVersion("");
  //   }
  // }, [selectedKind, selectedApiVersion, kindToVersions, setApiVersion]);

  // // onSelect handlers cascade-clear dependent fields
  const showApiVersion =
    !!selectedKind && (kindToVersions[selectedKind]?.length || 0) > 1;

  // Default namespace: when namespace options load and there is exactly one option, pick it
  // React.useEffect(() => {
  //   if (!namespacesLoaded) return;
  //   if (selectedNamespace) return;
  //   if (namespaceItems.length === 1) {
  //     setNamespace(namespaceItems[0].value);
  //   } else {
  //     setNamespace("");
  //   }
  // }, [namespacesLoaded, selectedNamespace, namespaceItems, setNamespace]);

  // // Default name: when name options load and there is exactly one option, pick it
  // React.useEffect(() => {
  //   if (!namesLoaded) return;
  //   if (!selectedNamespace) return; // names are namespace-scoped
  //   if (selectedName) return;
  //   if (nameItems.length === 1) {
  //     setName(nameItems[0].value);
  //   } else {
  //     setName("");
  //   }
  // }, [namesLoaded, selectedNamespace, selectedName, nameItems, setName]);

  const hasNamespaceError = !!namespacesError;
  const hasNamesError = !!namesError;
  const noKindsAvailable = templateLoaded && kindItems.length === 0;

  console.log({ kindItems, apiVersionItems, templateLoaded });
  console.log({ kindToVersions });
  console.log({ namespacesLoaded, namespacesError, namespaceItems });
  console.log({ namesLoaded, namesError, nameItems });
  console.log({
    selectedApiVersion,
    selectedKind,
    selectedNamespace,
    selectedName,
  });

  return (
    <Flex
      direction={{ default: "column" }}
      spaceItems={{ default: "spaceItemsSm" }}
    >
      {noKindsAvailable && (
        <FlexItem>
          <Alert
            isInline
            variant="warning"
            title={t(
              "No remediation templates found. Install one of the remediation operators to continue."
            )}
            actionLinks={
              <>
                <a href="/operatorhub?keyword=Fence%20Agents%20Remediation">
                  {t("Install FAR operator")}
                </a>
                {" | "}
                <a href="/operatorhub?keyword=Machine%20Deletion%20Remediation">
                  {t("Install MDR operator")}
                </a>
                {" | "}
                <a href="/operatorhub?keyword=Self%20Node%20Remediation">
                  {t("Install SNR operator")}
                </a>
              </>
            }
          />
        </FlexItem>
      )}
      <FlexItem>
        <SelectField
          name={kindFieldName}
          label={sentenceCase("kind")}
          isRequired
          items={kindItems}
          isDisabled={!templateLoaded}
          placeholder={
            templateLoaded
              ? undefined
              : hasNamespaceError || hasNamesError
              ? "Error loading kinds"
              : "Loading kinds..."
          }
        />
      </FlexItem>
      {showApiVersion && (
        <FlexItem>
          <SelectField
            name={apiVersionFieldName}
            label={sentenceCase("apiVersion")}
            isRequired
            items={apiVersionItems}
            isDisabled={false}
            placeholder={"Select API version"}
          />
        </FlexItem>
      )}
      <FlexItem>
        <SelectField
          name={namespaceFieldName}
          label={sentenceCase("namespace")}
          isRequired
          items={namespaceItems}
          isDisabled={
            !selectedApiVersion ||
            !selectedKind ||
            !namespacesLoaded ||
            hasNamespaceError
          }
          placeholder={
            hasNamespaceError
              ? "Error loading namespaces"
              : namespacesLoaded
              ? undefined
              : "Loading namespaces..."
          }
        />
      </FlexItem>
      <FlexItem>
        <SelectField
          name={nameFieldName}
          label={sentenceCase("name")}
          isRequired
          items={nameItems}
          isDisabled={
            !selectedApiVersion ||
            !selectedKind ||
            !selectedNamespace ||
            !namesLoaded ||
            hasNamesError
          }
          placeholder={
            hasNamesError
              ? "Error loading names"
              : namesLoaded
              ? undefined
              : "Loading names..."
          }
        />
      </FlexItem>
    </Flex>
  );
};

export default withFallback(RemediationTemplate);
