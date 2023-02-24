import React from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import { IconAngleRight, IconArrowRight } from "hds-react";
import { breakpoints } from "common/src/common/style";
import Link from "next/link";
import { fontMedium, H3 } from "common/src/common/typography";
import { UnitType } from "common/types/gql-types";
import { singleSearchPrefix } from "../../modules/const";
import Container from "../common/Container";
import { getTranslation } from "../../modules/util";

type Props = {
  units: UnitType[];
};

const itemLimit = 8;

const Wrapper = styled.div``;

const Heading = styled(H3).attrs({ as: "h2" })``;

const Content = styled(Container)`
  display: flex;
  flex-direction: column;
  padding: 0 var(--spacing-m) var(--spacing-layout-m);
`;

const UnitContainer = styled.div`
  gap: var(--spacing-l) 0;
  margin-bottom: var(--spacing-xl);

  @media (max-width: ${breakpoints.s}) {
    svg {
      transform: scale(0.5);
    }
  }

  @media (min-width: ${breakpoints.s}) {
    display: grid;
    grid-template-columns: repeat(2, 200px);
    justify-content: space-between;
  }

  @media (min-width: ${breakpoints.m}) {
    grid-template-columns: repeat(3, 200px);
  }

  @media (min-width: ${breakpoints.l}) {
    grid-template-columns: repeat(4, 200px);
    padding-right: var(--spacing-layout-l);
  }
`;

const UnitItemLink = styled(Link)`
  &:hover {
    text-decoration: underline;
  }

  color: var(--color-black) !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xs);
  line-height: var(--lineheight-l);
  font-size: var(--fontsize-body-l);

  svg {
    min-width: 48px;
  }
`;

const SearchLink = styled(Link)`
  color: var(--color-bus) !important;
  display: flex;
  align-self: flex-start;
  align-items: center;
  gap: var(--spacing-2-xs);
  ${fontMedium}

  &:hover {
    text-decoration: underline;
  }
`;

const Units = ({ units }: Props): JSX.Element => {
  const { t } = useTranslation(["home", "common"]);

  return (
    units?.length > 0 && (
      <Wrapper>
        <Content>
          <Heading>{t("unitsHeading")}</Heading>
          <UnitContainer>
            {units.slice(0, itemLimit).map((unit) => (
              <UnitItemLink
                key={unit.pk}
                href={`${singleSearchPrefix}?unit=${unit.pk}`}
                data-testid="front-page__units--unit"
              >
                {getTranslation(unit, "name")}
                <IconArrowRight size="l" aria-hidden />
              </UnitItemLink>
            ))}
          </UnitContainer>
          {units?.length > itemLimit && (
            <SearchLink
              href={`${singleSearchPrefix}`}
              data-testid="front-page__units--more-link"
            >
              {t("common:showAll")} <IconAngleRight aria-hidden />
            </SearchLink>
          )}
        </Content>
      </Wrapper>
    )
  );
};

export default Units;
