import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { B, H1, P, SIZE_MEDIUM } from './Typography';
import {
  Application,
  ApplicationEvent,
  Reservation,
  ReservationUnit,
  User,
} from '../common/types';
import { PDFDocument, PDFPage } from './PDFDocument';

import ReservationsTable from './ReservationsTable';
import Applicant from './Applicant';

type Props = {
  application: Application;
  reservations: Reservation[];
  decisionMaker: User;
};

const ReservationsDocument = ({
  application,
  reservations,
  decisionMaker,
}: Props): JSX.Element => (
  <PDFDocument metadata={{ title: 'todo title' }}>
    <PDFPage>
      <P />
      <P />
      <H1>
        Hyvä {application.contactPerson?.firstName}{' '}
        {application.contactPerson?.lastName},
      </H1>
      <P>
        hakemuksenne perusteella <Applicant application={application} /> on
        myönnetty seuraavat käyttövuorot nuorisopalvelun tiloihin.
      </P>
      <P>
        Päätökseen voi hakea muutosta jättämällä kirjallisen muutoshakemuksen
        osoitteeseen Kirjaamo, Kulttuurin ja vapaa-ajan toimiala,
        Nuorisopalvelut, PL 10, 00099 Helsingin kaupunki tai sähköpostitse
        helsinki.kirjaamo@hel.fi.
      </P>
      <P />
      <P>
        <B>Ystävällisin terveisin,</B>
      </P>
      <Text>
        {decisionMaker.firstName} {decisionMaker.lastName}
      </Text>
      <Text>Kulttuurin ja vapaa-ajan toimiala, Nuorisopalvelut</Text>
    </PDFPage>
    {application.applicationEvents.map(
      (applicationEvent: ApplicationEvent): JSX.Element[] => {
        const eventReservations = reservations.filter((res) => {
          return res.applicationEventId === applicationEvent.id;
        });

        const eventReservationUnits = eventReservations
          .flatMap((value) => value.reservationUnit)
          .reduce((prev, current) => {
            if (!prev.find((v) => v.id === current.id)) {
              prev.push(current);
            }
            return prev;
          }, [] as ReservationUnit[]);

        return eventReservationUnits.map((resUnit) => {
          const reservationUnitReservations = eventReservations.filter((er) =>
            er.reservationUnit.find((ru) => ru.id === resUnit.id)
          );

          const hasCancelations = Boolean(
            reservationUnitReservations.find((res) => res.state !== 'confirmed')
          );

          return (
            <PDFPage>
              <P />
              <Text>Vakiovuoron nimi</Text>
              <H1>{applicationEvent.name}</H1>
              <P />
              <Text>
                Vuorolle myönnetyt käyttövuorot nuorisopalvelun tilaan
              </Text>
              <View style={{ fontSize: SIZE_MEDIUM }}>
                <B>{resUnit.name.fi}</B>
                <Text>{resUnit.building.name}</Text>
              </View>
              <P />
              <ReservationsTable
                applicationEvent={applicationEvent}
                reservationUnit={resUnit}
                reservations={reservationUnitReservations.filter(
                  (res) => res.state === 'confirmed'
                )}
              />
              {hasCancelations ? (
                <>
                  <P />
                  <P />
                  <Text>
                    Vuorojenjaossa on seuraavat poikkeukset, jolloin vakiovuoro
                    ei ole käytettävissänne:
                  </Text>
                  <P />
                  <ReservationsTable
                    applicationEvent={applicationEvent}
                    reservationUnit={resUnit}
                    reservations={reservationUnitReservations.filter(
                      (res) => res.state !== 'confirmed'
                    )}
                  />
                </>
              ) : null}
            </PDFPage>
          );
        });
      }
    )}
  </PDFDocument>
);

export default ReservationsDocument;
