import {
  K8sResourceCommon,
  useK8sWatchResource,
} from "@openshift-console/dynamic-plugin-sdk";

// Minimal JSON schema shape sufficient for spec.template checks
export interface JSONSchemaProps {
  type?: string;
  properties?: Record<string, JSONSchemaProps>;
  items?: JSONSchemaProps | JSONSchemaProps[];
  required?: string[];
  additionalProperties?: boolean | JSONSchemaProps;
  anyOf?: JSONSchemaProps[];
  allOf?: JSONSchemaProps[];
  oneOf?: JSONSchemaProps[];
}

export type CustomResourceDefinition = K8sResourceCommon & {
  spec?: {
    group?: string;
    names?: {
      kind?: string;
      listKind?: string;
      plural?: string;
      singular?: string;
    };
    scope?: "Namespaced" | "Cluster" | string;
    versions?: Array<{
      name?: string; // version string like v1, v1alpha1
      served?: boolean;
      storage?: boolean;
      schema?: {
        openAPIV3Schema?: JSONSchemaProps;
      };
    }>;
  };
};

const useWatchCRDs = () => {
  return useK8sWatchResource<CustomResourceDefinition[]>({
    groupVersionKind: {
      group: "apiextensions.k8s.io",
      version: "v1",
      kind: "CustomResourceDefinition",
    },
    isList: true,
    namespaced: false,
  });
};

export default useWatchCRDs;
