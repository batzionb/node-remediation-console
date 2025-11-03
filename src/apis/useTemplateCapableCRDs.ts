import * as React from "react";
import useWatchCRDs, { JSONSchemaProps } from "./useWatchCRDs";

const hasSpecTemplatePath = (schema?: JSONSchemaProps): boolean => {
  if (!schema) return false;
  const props = schema.properties;
  const spec = props?.spec;
  const template = spec?.properties?.template;
  if (!template) return false;
  return !!(template || template?.properties?.spec);
};

export type TemplateCapableVersion = {
  group: string;
  version: string;
  kind: string;
};

// Returns: CRDs that can be used as templates for remediations
const useTemplateCapableCRDs = (): [
  TemplateCapableVersion[],
  boolean,
  unknown
] => {
  const [crds, loaded, error] = useWatchCRDs();

  const results = React.useMemo<TemplateCapableVersion[]>(() => {
    if (!loaded || error || !Array.isArray(crds)) return [];

    const out: TemplateCapableVersion[] = [];
    for (const crd of crds) {
      const group = crd?.spec?.group;
      const kind = crd?.spec?.names?.kind;
      if (!group || !kind) continue;

      const versions = crd?.spec?.versions || [];
      for (const v of versions) {
        if (v?.served !== true || !v?.name) continue;
        const schema = v?.schema?.openAPIV3Schema;
        if (hasSpecTemplatePath(schema)) {
          out.push({ group, version: v.name, kind });
        }
      }
    }
    return out;
  }, [crds, loaded, error]);

  return [results, loaded, error];
};

export default useTemplateCapableCRDs;
