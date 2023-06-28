import { IconAngleDown, IconAngleUp, IconArrowRight } from "hds-react";
import Link from "next/link";
import React, { useMemo } from "react";
import { useTranslation } from "next-i18next";
import { useMedia } from "react-use";
import styled from "styled-components";
import { breakpoints } from "common/src/common/style";
import { fontMedium, H3 } from "common/src/common/typography";
import { PurposeType } from "common/types/gql-types";
import { singleSearchPrefix } from "../../modules/const";
import { getTranslation } from "../../modules/util";
import ReservationUnitSearch from "./ReservationUnitSearch";

type Props = {
  purposes: PurposeType[];
};

const mobileBreakpoint = "450px";

const Wrapper = styled.div`
  margin-bottom: var(--spacing-layout-m);
`;

const Heading = styled(H3).attrs({ as: "h2" })`
  margin: 0;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const Top = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--spacing-m);
  padding-bottom: var(--spacing-m);

  @media (min-width: ${breakpoints.m}) {
    flex-direction: row;
    align-items: flex-end;
  }
`;

const PurposeContainer = styled.div`
  display: grid;
  gap: var(--spacing-l) var(--spacing-m);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const PurposeItem = styled.div`
  &:hover {
    span {
      text-decoration: underline;
    }
  }

  color: var(--color-black) !important;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  line-height: var(--lineheight-l);
  font-size: 22px;

  svg {
    min-width: 24px;
  }
`;

const Image = styled.img`
  height: 125px;
  object-fit: cover;

  @media (min-width: ${breakpoints.m}) {
    height: 180px;
  }
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--fontsize-heading-xs);
  padding-left: var(--spacing-2-xs);
  gap: var(--spacing-xs);
`;

const MoreLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--spacing-2-xs);
  align-self: flex-end;
  margin-top: var(--spacing-xl);
  cursor: pointer;
  ${fontMedium}
`;

const Purposes = ({ purposes }: Props): JSX.Element => {
  const { t } = useTranslation(["home", "common"]);

  const [showAll, setShowAll] = React.useState(false);
  const isMobile = useMedia(`(max-width: ${mobileBreakpoint})`, false);

  const itemLimit = useMemo(() => (isMobile ? 4 : 8), [isMobile]);

  const items = useMemo(
    () => (showAll ? purposes : purposes.slice(0, itemLimit)),
    [purposes, itemLimit, showAll]
  );

  return (
    <Wrapper>
      <Content>
        <Top>
          <Heading>{t("purposesHeading")}</Heading>
          <ReservationUnitSearch />
        </Top>
        <PurposeContainer>
          {items.map((item) => (
            <Link
              key={item.pk}
              href={`${singleSearchPrefix}?purposes=${item.pk}#content`}
            >
              <PurposeItem data-testid="front-page__purposes--purpose">
                <Image src={item.smallUrl} alt="" aria-hidden />
                <Title>
                  <span>{getTranslation(item, "name")}</span>
                  <IconArrowRight size="s" aria-hidden />
                </Title>
              </PurposeItem>
            </Link>
          ))}
        </PurposeContainer>
        {purposes?.length > itemLimit && (
          <MoreLink
            data-testid="front-page__purposes--more-link"
            onClick={() => setShowAll(!showAll)}
            href="javascript:void(0);"
          >
            {t(`${showAll ? "common:showLess" : "common:showMore"}`)}{" "}
            {showAll ? (
              <IconAngleUp aria-hidden />
            ) : (
              <IconAngleDown aria-hidden />
            )}
          </MoreLink>
        )}
      </Content>
    </Wrapper>
  );
};

export default Purposes;
