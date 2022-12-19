import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Tabs as HDSTabs } from "hds-react";
import styled from "styled-components";

const TabPanel = styled(HDSTabs.TabPanel)`
  margin-top: var(--spacing-s);
  padding-block: var(--spacing-m);
`;

type TabHeader = {
  key: string;
  label: string;
};

type Props = {
  headers: TabHeader[];
  children: React.ReactChild[];
};

const Tabs: React.FC<Props> = ({ headers, children: panels }: Props) => {
  const history = useHistory();
  const { hash } = useLocation();
  const hashIndex = headers.findIndex((header) => header.key === hash);
  const initialSelectedTab = hashIndex > -1 ? hashIndex : 0;

  const onTabClick = (tabName: string) => {
    history.push(`#${tabName}`);
  };

  if (headers.length !== panels.length) {
    throw new Error(`Tabs: not all headers have corresponding panels`);
  }

  return (
    <HDSTabs initiallyActiveTab={initialSelectedTab}>
      <HDSTabs.TabList>
        {headers.map(({ key, label }) => (
          <HDSTabs.Tab onClick={() => onTabClick(key)} key={key}>
            {label}
          </HDSTabs.Tab>
        ))}
      </HDSTabs.TabList>
      {panels}
    </HDSTabs>
  );
};

export { Tabs, TabPanel };
export type { TabHeader };
