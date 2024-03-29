import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { H1, H3 } from "common/src/common/typography";
import { breakpoints } from "common/src/common/style";
import { formatDate } from "@/common/util";

interface Stage {
  id: number;
  data?: string | null;
}

const Wrapper = styled.div`
  padding: var(--spacing-xl) 0 0 0;

  @media (min-width: ${breakpoints.s}) {
    padding: var(--spacing-xl) var(--spacing-m);
  }

  @media (min-width: ${breakpoints.m}) {
    padding: var(--spacing-5-xl) var(--spacing-3-xl);
  }
`;

const Title = styled.div``;

const Stages = styled.div`
  margin: var(--spacing-l) 0 0 2rem;
  padding: var(--spacing-xs) 0 var(--spacing-l) 3rem;
  border-left: 1px solid var(--color-black);
`;

const StageDiv = styled.div<{ $active: boolean }>`
  ${({ $active }) =>
    $active &&
    `
    &:before {
      content: '';
      position: absolute;
      top: -0.6rem;
      left: -3.5rem;
      background: var(--color-white);
      width: 1rem;
      height: 3rem;
    }
    &:after {
      content: '';
      position: absolute;
      top: 0.2rem;
      left: -3.7rem;
      border: 3px solid var(--color-black);
      border-radius: 50%;
      width: 1rem;
      height: 1rem;
    }
  `}

  position: relative;
  margin-bottom: var(--spacing-xl);

  ${H3} {
    margin-bottom: 0;
  }

  p {
    line-height: var(--lineheight-xl);
    margin-top: var(--spacing-2-xs);
  }
`;

interface IProps {
  activeStage: number;
  name: string;
  reservationPeriodEnd: string;
}

function StageInfo({
  activeStage,
  name,
  reservationPeriodEnd,
}: IProps): JSX.Element {
  const { t } = useTranslation();

  const stages: Stage[] = [1, 2, 3, 4, 5, 6].map((stage) => ({
    id: stage,
    data: stage === 1 ? formatDate(reservationPeriodEnd) : null,
  }));

  useEffect(() => {
    const goToAnchor = setTimeout(() => {
      const url = window.location.href;
      window.location.href = `#stage-info__stage-${activeStage}`;
      window.history.replaceState(null, "", url);
    }, 100);

    return () => {
      clearTimeout(goToAnchor);
    };
  }, [activeStage]);

  return (
    <Wrapper>
      <Title>{name}</Title>
      <H1 $legacy>{t("StageInfo.stagesOfHandling")}</H1>
      <Stages>
        {stages.map((stage) => (
          <StageDiv
            id={`stage-info__stage-${stage.id}`}
            key={`stage-${stage.id}`}
            $active={stage.id === activeStage}
          >
            <H3>{t(`StageInfo.stage${stage.id}.title`)}</H3>
            <p>{t(`StageInfo.stage${stage.id}.body`, { data: stage.data })}</p>
          </StageDiv>
        ))}
      </Stages>
    </Wrapper>
  );
}

export default StageInfo;
