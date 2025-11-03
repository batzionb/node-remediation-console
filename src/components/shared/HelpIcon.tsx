import * as React from "react";
import classNames from "classnames";
import { Button, Popover } from "@patternfly/react-core";
import { OutlinedQuestionCircleIcon } from "@patternfly/react-icons";
type PopoverIconProps = {
  helpText?: string;
  helpContent?: React.ReactNode;
};

const HelpIcon: React.FC<PopoverIconProps> = ({ helpText, helpContent }) => (
  <Popover bodyContent={helpContent ?? helpText}>
    <Button
      variant="plain"
      onClick={(e) => e.preventDefault()}
      className={classNames("nhc-form__help-icon")}
      icon={<OutlinedQuestionCircleIcon />}
    />
  </Popover>
);

export default HelpIcon;
