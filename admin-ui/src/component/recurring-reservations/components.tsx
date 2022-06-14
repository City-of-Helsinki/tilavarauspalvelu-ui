import { Table, TableProps } from "hds-react";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { breakpoints } from "../../styles/util";

type TableWrapperProps = {
  $headingBackground?: string;
  $tableBackground?: string;
};

const TableWrapper = styled.div<TableWrapperProps>`
  div {
    overflow-x: auto;
    @media (min-width: ${breakpoints.xl}) {
      overflow-x: unset !important;
    }
  }

  caption {
    text-align: end;
  }
  table {
    th {
      font-family: var(--font-bold);
      padding: var(--spacing-xs);
      background: ${({ $headingBackground = "var(--color-black-10)" }) =>
        $headingBackground};
      position: sticky;
      top: 0;
      box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);
    }
    td {
      white-space: nowrap;
      padding: var(--spacing-xs);
      background: ${({ $tableBackground = "transparent" }) => $tableBackground};
    }
  }
`;

export const CustomTable = (props: TableProps): JSX.Element => (
  <TableWrapper
    $headingBackground="var(--color-black-10)"
    $tableBackground="var(--color-white)"
  >
    <Table {...props} />
  </TableWrapper>
);

export default CustomTable;

const NoDataMessage = styled.span`
  line-height: 4;
`;

export const TableLink = styled(Link)`
  color: black;
`;

export function DataOrMessage({
  data,
  filteredData,
  children,
  noData,
  noFilteredData,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filteredData: any[];
  children: JSX.Element;
  noData: string;
  noFilteredData: string;
}): JSX.Element {
  if (filteredData.length) {
    return children;
  }

  if (data.length === 0) {
    return <NoDataMessage>{noData}</NoDataMessage>;
  }

  return <NoDataMessage>{noFilteredData}</NoDataMessage>;
}
