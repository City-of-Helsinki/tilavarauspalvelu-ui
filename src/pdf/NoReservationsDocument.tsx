import React from 'react';
import { Text } from '@react-pdf/renderer';
import { B, H1, P } from './Typography';
import { Application, User } from '../common/types';
import { PDFDocument, PDFPage } from './PDFDocument';
import Applicant from './Applicant';

type Props = {
  application: Application;
  decisionMaker: User;
};

const NoReservationsDocument = ({
  application,
  decisionMaker,
}: Props): JSX.Element => (
  <PDFDocument metadata={{ title: 'kissa' }}>
    <PDFPage>
      <P />
      <P />
      <H1>
        Hyvä {application.contactPerson?.firstName}{' '}
        {application.contactPerson?.lastName},
      </H1>
      <P>
        hakemuksenne perusteella <Applicant application={application} /> ei
        valitettavasti ole voitu myöntää käyttövuoroja nuorisopalvelun tiloihin.
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
  </PDFDocument>
);

export default NoReservationsDocument;
