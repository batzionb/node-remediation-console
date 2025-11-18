import * as React from "react";
import useAllRemediationTemplates from "./useAllRemediationTemplates";
import {
  REMEDIATOR_DEFINITIONS,
  RemediatorDefinition,
} from "../data/remediators";

export type RemediatorInfo = RemediatorDefinition & {
  installed: boolean;
};

const useRemediators = (): RemediatorInfo[] => {
  const templateInstallationStatus = useAllRemediationTemplates();

  return React.useMemo(() => {
    return REMEDIATOR_DEFINITIONS.map((definition) => {
      let installed = false;

      if (definition.alwaysAvailable) {
        installed = true;
      } else if (definition.templateKind) {
        const status = templateInstallationStatus.get(definition.templateKind);
        installed = status?.installed ?? false;
      }

      return {
        ...definition,
        installed,
      };
    });
  }, [templateInstallationStatus]);
};

export default useRemediators;
