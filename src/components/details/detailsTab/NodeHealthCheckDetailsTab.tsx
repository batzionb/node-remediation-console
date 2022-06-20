import {
  PageComponentProps,
  useAccessReview,
} from "@openshift-console/dynamic-plugin-sdk";
import { Grid, GridItem } from "@patternfly/react-core";
import { Loading } from "components/copiedFromConsole/status-box";
import { SectionHeading } from "components/copiedFromConsole/utils/headings";
import { NodeHealthCheckModel } from "data/model";
import { getName } from "data/selectors";
import { NodeHealthCheck } from "data/types";
import { useNodeHealthCheckTranslation } from "localization/useNodeHealthCheckTranslation";
import * as React from "react";
import { DetailsLeftPane } from "./DetailsLeftPane";
import { DetailsRightPane } from "./DetailsRightPane";
import { UnhealthyConditionsTable } from "./UnhealthyConditionsTable";

const NodeHealthCheckDetailsTab: React.FC<
  PageComponentProps<NodeHealthCheck>
> = ({ obj: nodeHealthCheck }) => {
  const [canUpdateAccess, loading] = useAccessReview({
    group: NodeHealthCheckModel.apiGroup,
    resource: NodeHealthCheckModel.plural,
    verb: "patch",
    name: getName(nodeHealthCheck),
  });

  const { t } = useNodeHealthCheckTranslation();
  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <div className="co-m-pane__body">
        <Grid>
          <SectionHeading text={t("NodeHealthCheck details")} />
          <GridItem span={5}>
            <DetailsLeftPane
              resource={nodeHealthCheck}
              canEdit={!loading && canUpdateAccess}
            />
          </GridItem>
          <GridItem span={1} />
          <GridItem span={5}>
            <DetailsRightPane nodeHealthCheck={nodeHealthCheck} />
          </GridItem>
        </Grid>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t("Unhealthy Conditions")} />
        <UnhealthyConditionsTable nodeHealthCheck={nodeHealthCheck} />
      </div>
    </>
  );
};

export default NodeHealthCheckDetailsTab;
