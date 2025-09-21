import * as React from "react";
import { useField } from "formik";
import { capitalize, startCase } from "lodash-es";
import { Flex, FlexItem } from "@patternfly/react-core";
import SelectField from "../../../shared/SelectField";
import { getObjectItemFieldName } from "../../../shared/formik-utils";
import { K8sModel, useK8sModels } from "@openshift-console/dynamic-plugin-sdk";
import { Remediator } from "../../../../data/types";
import useRemediatorSelectItems from "../../../../apis/useRemediatorSelectItems";
import { FormViewFieldProps } from "../propTypes";
import useTemplateCapableCRDs from "../../../../apis/useTemplateCapableCRDs";

const sentenceCase = (string: string) => {
  return capitalize(startCase(string));
};

const CustomRemediatorField = ({ fieldName }: FormViewFieldProps) => {
  const [{ value }] = useField<Remediator>(fieldName);

  const [models, modelLoading] = useK8sModels();

  const selectedApiVersion = value?.template?.apiVersion || "";
  const selectedKind = value?.template?.kind || "";
  const selectedNamespace = value?.template?.namespace || "";

  const namespacedModels: K8sModel[] = React.useMemo(() => {
    if (modelLoading || !models) return [];
    return Object.values(models).filter((m) => !!m.namespaced);
  }, [models, modelLoading]);

  // CRD-based, template-aware lists (kind-first)
  const [templateCRDs, templateLoaded] = useTemplateCapableCRDs();
  const kindToVersions = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const { group, version, kind } of templateCRDs) {
      const apiVer = group ? `${group}/${version}` : version;
      if (!map[kind]) map[kind] = [];
      if (!map[kind].includes(apiVer)) map[kind].push(apiVer);
    }
    // sort versions for determinism
    Object.keys(map).forEach((k) => map[k].sort());
    return map;
  }, [templateCRDs]);
  const kindItems = React.useMemo(
    () =>
      Object.keys(kindToVersions)
        .sort((a, b) => a.localeCompare(b))
        .map((k) => ({ label: k, value: k })),
    [kindToVersions]
  );
  const apiVersionItems = React.useMemo(
    () =>
      selectedKind
        ? (kindToVersions[selectedKind] || []).map((v) => ({
            label: v,
            value: v,
          }))
        : [],
    [kindToVersions, selectedKind]
  );

  const selectedModel: K8sModel | undefined = React.useMemo(() => {
    if (!selectedApiVersion || !selectedKind) return undefined;
    return namespacedModels.find((m) => {
      const apiVer = m.apiGroup
        ? `${m.apiGroup}/${m.apiVersion}`
        : m.apiVersion;
      return apiVer === selectedApiVersion && m.kind === selectedKind;
    });
  }, [namespacedModels, selectedApiVersion, selectedKind]);

  const { namespaceItems, nameItems, namespacesLoaded, namesLoaded } =
    useRemediatorSelectItems(selectedModel, selectedNamespace || undefined);

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

  const [, , { setValue: setApiVersion }] =
    useField<string>(apiVersionFieldName);
  const [, , { setValue: setNamespace }] = useField<string>(namespaceFieldName);
  const [, , { setValue: setName }] = useField<string>(nameFieldName);

  // Defaults: when kinds load and no kind is selected, pick the first alphabetically
  React.useEffect(() => {
    if (!templateLoaded) return;
    if (!selectedKind && kindItems.length > 0) {
      const firstKind = kindItems[0].value;
      const versions = kindToVersions[firstKind] || [];
      // set kind via Formik by setting apiVersion and name/ns clears in onSelectKind, but we don't have setKind here
      // Instead, set apiVersion (if single) and rely on SelectField user interaction for kind; or set apiVersion only when selectedKind exists
      // We'll set apiVersion immediately if the first kind has a single version
      if (versions.length === 1) {
        setApiVersion(versions[0]);
      }
    }
  }, [templateLoaded, selectedKind, kindItems, kindToVersions, setApiVersion]);

  // onSelect handlers cascade-clear dependent fields
  const onSelectApiVersion = () => {
    setNamespace("");
    setName("");
  };

  const onSelectKind = (newKind?: string) => {
    setNamespace("");
    setName("");
    if (newKind) {
      const versions = kindToVersions[newKind] || [];
      if (versions.length === 1) {
        setApiVersion(versions[0]);
      } else {
        setApiVersion("");
      }
    }
  };

  const onSelectNamespace = () => {
    setName("");
  };

  const showApiVersion =
    !!selectedKind && (kindToVersions[selectedKind]?.length || 0) > 1;

  return (
    <Flex
      direction={{ default: "column" }}
      spaceItems={{ default: "spaceItemsSm" }}
    >
      <FlexItem>
        <SelectField
          name={kindFieldName}
          label={sentenceCase("kind")}
          isRequired
          items={kindItems}
          isDisabled={!templateLoaded}
          placeholder={templateLoaded ? undefined : "Loading kinds..."}
          onSelect={onSelectKind}
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
            onSelect={onSelectApiVersion}
          />
        </FlexItem>
      )}
      <FlexItem>
        <SelectField
          name={namespaceFieldName}
          label={sentenceCase("namespace")}
          isRequired
          items={namespaceItems}
          isDisabled={!selectedApiVersion || !selectedKind || !namespacesLoaded}
          placeholder={namespacesLoaded ? undefined : "Loading namespaces..."}
          onSelect={onSelectNamespace}
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
            !namesLoaded
          }
          placeholder={namesLoaded ? undefined : "Loading names..."}
        />
      </FlexItem>
    </Flex>
  );
};

export default CustomRemediatorField;
