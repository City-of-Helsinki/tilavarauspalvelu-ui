import { ApolloError, useQuery } from "@apollo/client";
import { Accordion, Button } from "hds-react";
import { groupBy } from "lodash";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  ApplicationRoundType,
  Query,
  QueryApplicationRoundsArgs,
  ApplicationRoundStatus,
} from "../../common/gql-types";
import { applicationRoundUrl } from "../../common/urls";
import { formatDate } from "../../common/util";
import { useNotification } from "../../context/NotificationContext";
import { WideContainer } from "../../styles/layout";
import { H1 } from "../../styles/new-typography";
import Loader from "../Loader";
import withMainMenu from "../withMainMenu";
import ApplicationRoundCard from "./ApplicationRoundCard";
import { TableLink, CustomTable } from "./components";
import { APPLICATION_ROUNDS_QUERY } from "./queries";
import { truncate } from "./util";

const StyledContainer = styled(WideContainer)`
  max-width: var(--container-width-xl);
  margin-bottom: var(--spacing-layout-xl);
  background: var(--color-black-5);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-l);
`;

const AccordionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-l);
`;

const StyledH1 = styled(H1)`
  padding: var(--spacing-m) 0;
`;

const RoundsAccordion = ({
  rounds,
  hideIfEmpty,
  name,
  initiallyOpen,
  emptyContent,
}: {
  rounds?: ApplicationRoundType[];
  hideIfEmpty?: boolean;
  name: string;
  initiallyOpen?: boolean;
  emptyContent?: JSX.Element;
}): JSX.Element | null => {
  if (!rounds || rounds.length === 0) {
    if (hideIfEmpty) {
      return null;
    }
  }

  return (
    <Accordion heading={name} initiallyOpen={initiallyOpen}>
      <AccordionContainer>
        {!rounds || rounds.length === 0
          ? emptyContent || <span>no data {name}</span>
          : rounds?.map((round) => (
              <ApplicationRoundCard key={round.pk} applicationRound={round} />
            ))}
      </AccordionContainer>
    </Accordion>
  );
};

function AllApplicationRounds(): JSX.Element | null {
  const [applicationRounds, setApplicationRounds] = useState<{
    [key: string]: ApplicationRoundType[];
  } | null>(null);

  const { t } = useTranslation();
  const { notifyError } = useNotification();

  const { loading } = useQuery<Query, QueryApplicationRoundsArgs>(
    APPLICATION_ROUNDS_QUERY,
    {
      onCompleted: (data) => {
        const cutOffDate = new Date();
        const result = data?.applicationRounds?.edges?.map(
          (ar) => ar?.node as ApplicationRoundType
        );
        if (result) {
          // group
          const roundsByStatus = groupBy(result, (round) => {
            switch (round.status) {
              // ui has 5 groups
              case ApplicationRoundStatus.InReview:
              case ApplicationRoundStatus.ReviewDone:
                return "g1";
              case ApplicationRoundStatus.Handled:
                return "g2";
              case ApplicationRoundStatus.Draft:
                return cutOffDate < round.applicationPeriodBegin ? "g4" : "g3";
              default:
                return "g5";
            }
          });

          setApplicationRounds(roundsByStatus);
        }
      },
      onError: (err: ApolloError) => {
        notifyError(err.message);
      },
    }
  );

  if (loading) {
    return <Loader />;
  }

  if (!applicationRounds) {
    return null;
  }

  return (
    <StyledContainer>
      <StyledH1>{t("MainMenu.applicationRounds")}</StyledH1>
      <RoundsAccordion
        initiallyOpen
        hideIfEmpty
        name={t("ApplicationRound.groupLabel.handling")}
        rounds={applicationRounds.g1 || []}
      />
      <RoundsAccordion
        name={t("ApplicationRound.groupLabel.notSent")}
        rounds={applicationRounds.g2 || []}
        hideIfEmpty
      />
      <RoundsAccordion
        name={t("ApplicationRound.groupLabel.open")}
        rounds={applicationRounds.g3 || []}
        hideIfEmpty
        initiallyOpen
      />
      <RoundsAccordion
        name={t("ApplicationRound.groupLabel.opening")}
        rounds={applicationRounds.g4 || []}
        emptyContent={
          <div>
            <div>Ei tulossa olevia hakukierroksia</div>
            <Button onClick={() => console.error("Ei toteutettu")}>
              Luo hakukierros
            </Button>
          </div>
        }
      />
      <Accordion heading={t("ApplicationRound.groupLabel.previousRounds")}>
        <CustomTable
          ariaLabelSortButtonAscending="Sorted in ascending order"
          ariaLabelSortButtonDescending="Sorted in descending order"
          ariaLabelSortButtonUnset="Not sorted"
          initialSortingColumnKey="applicantSort"
          initialSortingOrder="asc"
          cols={[
            {
              headerName: t("ApplicationRound.headings.name"),
              isSortable: true,
              key: "applicantSort",
              transform: (applicationRound: ApplicationRoundType) => (
                <TableLink
                  to={applicationRoundUrl(Number(applicationRound.pk))}
                >
                  <span title={applicationRound.nameFi as string}>
                    {truncate(applicationRound.nameFi as string, 20)}
                  </span>
                </TableLink>
              ),
            },
            {
              headerName: t("ApplicationRound.headings.service"),
              isSortable: true,
              transform: (applicationRound: ApplicationRoundType) =>
                applicationRound.serviceSector?.nameFi as string,
              key: "servcice.pk",
            },
            {
              headerName: t("ApplicationRound.headings.reservationUnitCount"),
              key: "foo",
              transform: (applicationRound: ApplicationRoundType) =>
                String(applicationRound.applicationsCount),
            },
            {
              headerName: t("ApplicationRound.headings.applicationCount"),
              key: "bar",
              transform: (applicationRound: ApplicationRoundType) =>
                String(applicationRound.reservationUnitCount),
            },
            {
              headerName: t("ApplicationRound.headings.sent"),
              transform: () => formatDate(new Date().toISOString()) || "-",
              key: "sent",
            },
          ]}
          indexKey="pk"
          rows={applicationRounds.g5 || []}
          variant="light"
        />
      </Accordion>
    </StyledContainer>
  );
}

export default withMainMenu(AllApplicationRounds);
