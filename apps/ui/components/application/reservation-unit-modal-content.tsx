import {
  IconArrowRight,
  IconGroup,
  IconInfoCircle,
  TextInput,
  Select,
  IconLinkExternal,
  Button,
  IconCross,
  IconSearch,
} from "hds-react";
import React, { ChangeEvent, useState } from "react";
import { useTranslation } from "next-i18next";
import type { OptionType } from "common/types/common";
import { H2, H3 } from "common/src/common/typography";
import {
  ReservationUnitOrderingChoices,
  useSearchReservationUnitsQuery,
  type ReservationUnitCardFieldsFragment,
  type ApplicationQuery,
} from "@gql/gql-types";
import { filterNonNullable, getImageSource } from "common/src/helpers";
import { AutoGrid, Flex } from "common/styles/util";
import { getMainImage, getTranslation } from "@/modules/util";
import { getApplicationRoundName } from "@/modules/applicationRound";
import { getReservationUnitName, getUnitName } from "@/modules/reservationUnit";
import { getReservationUnitPath } from "@/modules/urls";
import Card from "common/src/components/Card";
import { ButtonLikeLink } from "@/components/common/ButtonLikeLink";
import styled from "styled-components";
import { breakpoints } from "common";

const ImageSizeWrapper = styled.div`
  @media (min-width: ${breakpoints.m}) {
    [class*="card__ImageWrapper"] {
      max-height: 140px !important;
    }
  }
`;

function ReservationUnitCard({
  reservationUnit,
  handleAdd,
  handleRemove,
  isSelected,
}: {
  reservationUnit: ReservationUnitType;
  isSelected: boolean;
  handleAdd: (ru: ReservationUnitType) => void;
  handleRemove: (ru: ReservationUnitType) => void;
}) {
  const { t } = useTranslation();

  const handle = () =>
    isSelected ? handleRemove(reservationUnit) : handleAdd(reservationUnit);
  const buttonText = isSelected
    ? t("reservationUnitModal:unSelectReservationUnit")
    : t("reservationUnitModal:selectReservationUnit");
  const name = getReservationUnitName(reservationUnit);
  const reservationUnitTypeName = reservationUnit.reservationUnitType
    ? getTranslation(reservationUnit.reservationUnitType, "name")
    : undefined;
  const unitName = reservationUnit.unit
    ? getUnitName(reservationUnit.unit)
    : undefined;

  const img = getMainImage(reservationUnit);
  const imgSrc = getImageSource(img, "small");
  const infos = [
    {
      icon: <IconInfoCircle />,
      value: reservationUnitTypeName ?? "",
    },
    {
      icon: <IconGroup />,
      value: reservationUnit.maxPersons?.toString() ?? "",
    },
  ];
  const buttons = [
    <ButtonLikeLink
      key="link"
      href={getReservationUnitPath(reservationUnit.pk)}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        whiteSpace: "nowrap",
      }}
    >
      {t("reservationUnitModal:openLinkToNewTab")}
      <IconLinkExternal size="xs" />
    </ButtonLikeLink>,
    <Button
      key="toggle"
      iconRight={
        isSelected ? (
          <IconCross aria-hidden="true" />
        ) : (
          <IconArrowRight aria-hidden="true" />
        )
      }
      onClick={handle}
      size="small"
      variant={isSelected ? "danger" : "secondary"}
      style={{
        whiteSpace: "nowrap",
      }}
    >
      {buttonText}
    </Button>,
  ];
  return (
    <ImageSizeWrapper>
      <Card
        heading={name ?? ""}
        imageSrc={imgSrc}
        text={unitName}
        infos={infos}
        buttons={buttons}
      />
    </ImageSizeWrapper>
  );
}

type Node = NonNullable<ApplicationQuery["application"]>;
type AppRoundNode = NonNullable<Node["applicationRound"]>;
type ReservationUnitType = ReservationUnitCardFieldsFragment;
type OptionsType = {
  purposeOptions: OptionType[];
  reservationUnitTypeOptions: OptionType[];
  participantCountOptions: OptionType[];
  unitOptions: OptionType[];
};

const emptyOption = {
  label: "",
};

export function ReservationUnitModalContent({
  applicationRound,
  handleAdd,
  handleRemove,
  currentReservationUnits,
  options,
}: {
  applicationRound: AppRoundNode;
  handleAdd: (ru: ReservationUnitType) => void;
  handleRemove: (ru: ReservationUnitType) => void;
  currentReservationUnits: Pick<ReservationUnitType, "pk">[];
  options: OptionsType;
}): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const [reservationUnitType, setReservationUnitType] = useState<
    OptionType | undefined
  >(undefined);
  const [unit, setUnit] = useState<OptionType | undefined>(undefined);
  const [maxPersons, setMaxPersons] = useState<OptionType | undefined>(
    undefined
  );

  const reservationUnitTypeOptions = [emptyOption].concat(
    options.reservationUnitTypeOptions
  );

  const participantCountOptions = [emptyOption].concat(
    options.participantCountOptions
  );

  const unitOptions = [emptyOption].concat(options.unitOptions);

  const { t } = useTranslation();

  const { data, refetch, loading } = useSearchReservationUnitsQuery({
    skip: !applicationRound.pk,
    variables: {
      applicationRound: [applicationRound.pk ?? 0],
      textSearch: searchTerm,
      maxPersons: maxPersons?.value?.toString(),
      reservationUnitType:
        reservationUnitType?.value != null
          ? [Number(reservationUnitType?.value)]
          : [],
      unit: unit?.value != null ? [Number(unit?.value)] : [],
      orderBy: [ReservationUnitOrderingChoices.NameFiAsc],
      isDraft: false,
      isVisible: true,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "no-cache",
  });

  const reservationUnits = filterNonNullable(
    data?.reservationUnits?.edges.map((n) => n?.node)
  );

  return (
    <Flex>
      <H2 $noMargin>{t("reservationUnitModal:heading")}</H2>
      <H3 as="p">{getApplicationRoundName(applicationRound)}</H3>
      <AutoGrid $minWidth="14rem">
        <TextInput
          id="reservationUnitSearch.search"
          label={t("reservationUnitModal:searchTermLabel")}
          onChange={(e: ChangeEvent<HTMLInputElement>): void => {
            setSearchTerm(e.target.value);
          }}
        />
        <Select
          id="reservationUnitSearch.reservationUnitType"
          placeholder={t("common:select")}
          options={reservationUnitTypeOptions}
          label={t("reservationUnitModal:searchReservationUnitTypeLabel")}
          onChange={(selection: OptionType): void => {
            setReservationUnitType(selection);
          }}
          defaultValue={emptyOption}
        />
        <Select
          id="participantCountFilter"
          placeholder={t("common:select")}
          options={participantCountOptions}
          label={t("searchForm:participantCountLabel")}
          onChange={(selection: OptionType): void => {
            setMaxPersons(selection);
          }}
          defaultValue={emptyOption}
        />
        <Select
          id="reservationUnitSearch.unit"
          placeholder={t("common:select")}
          options={unitOptions}
          label={t("reservationUnitModal:searchUnitLabel")}
          onChange={(selection: OptionType): void => {
            setUnit(selection);
          }}
          defaultValue={emptyOption}
        />
      </AutoGrid>
      <Flex $alignItems="flex-end">
        <Button
          isLoading={loading}
          onClick={(_) => refetch()}
          iconLeft={<IconSearch aria-hidden="true" />}
        >
          {t("common:search")}
        </Button>
      </Flex>
      {reservationUnits.length === 0 && <div>{t("common:noResults")}</div>}
      {reservationUnits.map((ru) => (
        <ReservationUnitCard
          handleAdd={() => handleAdd(ru)}
          handleRemove={() => handleRemove(ru)}
          isSelected={
            currentReservationUnits.find((i) => i.pk === ru.pk) !== undefined
          }
          reservationUnit={ru}
          key={ru.pk}
        />
      ))}
    </Flex>
  );
}
