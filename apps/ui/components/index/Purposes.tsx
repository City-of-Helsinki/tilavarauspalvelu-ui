import { IconArrowRight } from "hds-react";
import Link from "next/link";
import React, { useMemo } from "react";
import { useTranslation } from "next-i18next";
import { useMedia } from "react-use";
import styled from "styled-components";
import { breakpoints } from "common/src/common/style";
import { H3 } from "common/src/common/typography";
import type { PurposeNode } from "@gql/gql-types";
import { ShowAllContainer } from "common/src/components";
import { singleSearchPrefix } from "@/modules/urls";
import ReservationUnitSearch from "./ReservationUnitSearch";
import { anchorStyles, focusStyles } from "common/styles/cssFragments";
import { pixel } from "@/styles/util";
import { getTranslationSafe } from "common/src/common/util";
import { getLocalizationLang } from "common/src/helpers";

type Props = {
  purposes: Pick<
    PurposeNode,
    "pk" | "nameFi" | "nameEn" | "nameSv" | "smallUrl" | "imageUrl"
  >[];
};

const mobileBreakpoint = "450px";

const Heading = styled(H3).attrs({ as: "h2" })`
  margin: 0;
`;

const Top = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--spacing-m);

  @media (min-width: ${breakpoints.m}) {
    flex-direction: row;
    align-items: flex-end;
  }
`;

const PurposeContainer = styled(ShowAllContainer)`
  width: 100%;
  .ShowAllContainer__Content {
    display: grid;
    gap: var(--spacing-l) var(--spacing-m);
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
`;

const PurposeItem = styled.div`
  &:hover {
    text-decoration: underline;
  }

  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const PurposeLink = styled(Link)`
  ${focusStyles}
  ${anchorStyles}
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
  gap: var(--spacing-xs);
`;

export function Purposes({ purposes }: Props): JSX.Element {
  const { t, i18n } = useTranslation(["home", "common"]);

  const isMobile = useMedia(`(max-width: ${mobileBreakpoint})`, false);

  const itemLimit = useMemo(() => (isMobile ? 4 : 8), [isMobile]);

  const getImg = (item: Pick<PurposeNode, "smallUrl" | "imageUrl">) => {
    return item.smallUrl || item.imageUrl || pixel;
  };
  const lang = getLocalizationLang(i18n.language);
  const getName = (item: Pick<PurposeNode, "nameFi" | "nameEn" | "nameSv">) => {
    return getTranslationSafe(item, "name", lang);
  };

  // TODO the search (the first section) doesn't belong here
  return (
    <>
      <Top>
        <Heading>{t("purposesHeading")}</Heading>
        <ReservationUnitSearch />
      </Top>
      <PurposeContainer
        showAllLabel={t("common:showMore")}
        showLessLabel={t("common:showLess")}
        maximumNumber={itemLimit}
        alignButton="right"
        data-testid="front-page__purposes"
      >
        {purposes.map((item) => (
          <PurposeLink
            key={item.pk}
            href={`${singleSearchPrefix}?purposes=${item.pk}#content`}
          >
            <PurposeItem data-testid="front-page__purposes--purpose">
              <Image src={getImg(item)} alt="" aria-hidden="true" />
              <Title>
                <span>{getName(item)} </span>
                <IconArrowRight size="s" aria-hidden="true" />
              </Title>
            </PurposeItem>
          </PurposeLink>
        ))}
      </PurposeContainer>
    </>
  );
}
