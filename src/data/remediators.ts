import { ExtensionK8sModel } from "@openshift-console/dynamic-plugin-sdk";

export type RemediatorDefinition = {
  id: string;
  name: string;
  description: string;
  templateKind?: ExtensionK8sModel;
  alwaysAvailable?: boolean;
};

export const REMEDIATOR_DEFINITIONS: RemediatorDefinition[] = [
  {
    id: "snr",
    name: "Self Node Remediation",
    description: "Automatic node reboot on failure.",
    templateKind: {
      kind: "SelfNodeRemediationTemplate",
      group: "self-node-remediation.medik8s.io",
      version: "v1alpha1",
    },
  },
  {
    id: "fence-agent",
    name: "Fence Agents Remediation",
    description: "Node fencing-based remediation for unresponsive nodes.",
    templateKind: {
      kind: "FenceAgentsRemediationTemplate",
      group: "fence-agents-remediation.medik8s.io",
      version: "v1alpha1",
    },
  },
  {
    id: "machine-deletion",
    name: "Machine Deletion Remediation",
    description: "Deletes and recreates the node via Machine API.",
    templateKind: {
      kind: "MachineDeletionRemediationTemplate",
      group: "machine-deletion-remediation.medik8s.io",
      version: "v1alpha1",
    },
  },
];

// Export type for remediator radio option IDs
export type RemediatorRadioOptionId =
  typeof REMEDIATOR_DEFINITIONS[number]["id"];

// Helper to get all remediator IDs
export const getRemediatorIds = (): RemediatorRadioOptionId[] => {
  return REMEDIATOR_DEFINITIONS.map((def) => def.id);
};

// Convert string to kebab-case
const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Insert dash before capital letters
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with dashes
    .toLowerCase();
};

// Get keyword from name (first letter of each word, lowercased)
const getKeywordFromName = (name: string): string => {
  return name
    .split(/\s+/)
    .map((word) => word.charAt(0).toLowerCase())
    .join("");
};

// Generate operatorhub link from remediator name
export const getOperatorHubLink = (name: string): string => {
  const keyword = getKeywordFromName(name);
  const kebabName = toKebabCase(name);
  const detailsItem = `${kebabName}-redhat-operators-openshift-marketplace`;

  return `/operatorhub/all-namespaces?keyword=${keyword}&details-item=${detailsItem}`;
};
