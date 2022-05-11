import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "hds-react";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-2xl);
`;

const Counts = styled.div`
  margin-bottom: var(--spacing-m);
`;

type Props = {
  count: number;
  totalCount: number;
  fetchMore: () => void;
};

export const More = ({ count, totalCount, fetchMore }: Props): JSX.Element => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  return (
    <Wrapper>
      {totalCount > count ? (
        <div style={{ textAlign: "center" }}>
          <Counts>
            {t("ReservationUnits.numResults", {
              count,
            })}{" "}
            {t("ReservationUnits.numTotal", {
              totalCount,
            })}
          </Counts>
          <Button
            isLoading={loading}
            variant="secondary"
            onClick={() => {
              setLoading(true);
              fetchMore();
            }}
          >
            {t("common.showMore")}
          </Button>
        </div>
      ) : (
        count > 0 && (
          <Counts>
            {t("ReservationUnits.allResults", {
              count,
            })}
          </Counts>
        )
      )}
    </Wrapper>
  );
};
