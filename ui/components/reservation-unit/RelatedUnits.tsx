import {
  IconCheck,
  IconGroup,
  IconInfoCircle,
  IconLocation,
  IconPlus,
} from "hds-react";
import React from "react";
import { useTranslation } from "react-i18next";
import router from "next/router";
import Link from "next/link";
import styled from "styled-components";
import { reservationUnitPath } from "../../modules/const";
import useReservationUnitsList from "../../hooks/useReservationUnitList";
import { breakpoint } from "../../modules/style";
import { ReservationUnit } from "../../modules/types";
import { getAddress, getMainImage, localizedValue } from "../../modules/util";
import IconWithText from "../common/IconWithText";
import { MediumButton } from "../../styles/util";

type PropsType = {
  units: ReservationUnit[];
  reservationUnitList: ReturnType<typeof useReservationUnitsList>;
  viewType: "recurring" | "single";
};

const Heading = styled.div`
  margin-top: var(--spacing-s);
  font-size: var(--fontsize-heading-m);
  font-family: var(--font-bold);
`;

const Content = styled.div`
  padding: var(--spacing-s);
`;

const Unit = styled.div`
  background-color: var(--color-white);
`;

const Name = styled.div`
  &:hover {
    opacity: 0.5;
  }

  cursor: pointer;
  font-family: var(--font-bold);
  font-weight: 700;
  font-size: var(--fontsize-heading-s);
`;

const Image = styled.img`
  width: 100%;
  height: 205px;
  object-fit: cover;
`;

const Building = styled.div`
  font-family: var(--font-regular);
  font-size: var(--fontsize-body-m);
  margin: var(--spacing-3-xs) 0 var(--spacing-xs);
`;

const Grid = styled.div`
  margin-top: var(--spacing-layout-s);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-s);

  @media (max-width: ${breakpoint.m}) {
    grid-template-columns: 1fr;
    margin-top: 0;
  }
`;

const Props = styled.div`
  font-family: var(--font-medium);
  font-weight: 500;
  font-size: var(--fontsize-body-m);
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 0;
`;

const SpanTwoColumns = styled.span`
  grid-column-start: 1;
  grid-column-end: 3;

  @media (max-width: ${breakpoint.m}) {
    grid-column-start: 1;
    grid-column-end: 2;
  }
`;

const StyledIconWithText = styled(IconWithText)`
  margin-top: var(--spacing-xs);
`;

const Buttons = styled.div`
  margin-top: var(--spacing-m);
  font-size: var(--fontsize-body-m);

  button {
    margin: 0;
  }
`;

const RelatedUnits = ({
  units,
  reservationUnitList,
  viewType,
}: PropsType): JSX.Element | null => {
  const { t, i18n } = useTranslation();

  const {
    selectReservationUnit,
    containsReservationUnit,
    removeReservationUnit,
  } = reservationUnitList;

  if (units.length === 0) {
    return null;
  }
  return (
    <>
      <Heading>{t("reservationUnitCard:RelatedUnits.heading")}</Heading>
      <Grid>
        {units.slice(0, 3).map((unit) => (
          <Unit key={unit.id}>
            <Image src={getMainImage(unit)?.imageUrl} image-alt={unit.name} />
            <Content>
              <Link href={reservationUnitPath(unit.id)} passHref>
                <Name>{localizedValue(unit.name, i18n.language)}</Name>
              </Link>
              <Building>{unit.building.name}</Building>
              <Props>
                <StyledIconWithText
                  icon={
                    <IconInfoCircle
                      aria-label={t("reservationUnitCard:type")}
                    />
                  }
                  text={localizedValue(
                    unit.reservationUnitType?.name,
                    i18n.language
                  )}
                />
                {unit.maxPersons ? (
                  <StyledIconWithText
                    icon={
                      <IconGroup
                        aria-label={t("reservationUnitCard:maxPersons", {
                          maxPersons: unit.maxPersons,
                        })}
                      />
                    }
                    text={`${unit.maxPersons}`}
                  />
                ) : (
                  <span />
                )}
                {getAddress(unit) ? (
                  <SpanTwoColumns>
                    <StyledIconWithText
                      icon={
                        <IconLocation
                          aria-label={t("reservationUnitCard:address")}
                        />
                      }
                      text={getAddress(unit) as string}
                    />
                  </SpanTwoColumns>
                ) : (
                  <StyledIconWithText icon={<span />} text="&nbsp;" />
                )}
              </Props>
              {viewType === "recurring" && (
                <Buttons>
                  {containsReservationUnit(unit) ? (
                    <MediumButton
                      onClick={() => removeReservationUnit(unit)}
                      iconLeft={<IconCheck />}
                      className="margin-left-xs margin-top-s"
                    >
                      {t("common:reservationUnitSelected")}
                    </MediumButton>
                  ) : (
                    <MediumButton
                      onClick={() => selectReservationUnit(unit)}
                      iconLeft={<IconPlus />}
                      className="margin-left-s margin-top-s"
                      variant="secondary"
                    >
                      {t("common:selectReservationUnit")}
                    </MediumButton>
                  )}
                </Buttons>
              )}
              {viewType === "single" && (
                <Buttons>
                  <MediumButton
                    style={{ width: "100%" }}
                    onClick={() => router.push(reservationUnitPath(unit.id))}
                    className="margin-left-xs margin-top-s"
                    variant="secondary"
                  >
                    {t("common:seeDetails")}
                  </MediumButton>
                </Buttons>
              )}
            </Content>
          </Unit>
        ))}
      </Grid>
    </>
  );
};

export default RelatedUnits;
