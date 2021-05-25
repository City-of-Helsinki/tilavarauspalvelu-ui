import React from 'react';
import { Document, Page, StyleSheet, Font, View } from '@react-pdf/renderer';
import { FAMILY_BOLD, FAMILY_REGULAR, SIZE } from './Typography';
import PageHeader from './PageHeader';
import PageFooter from './PageFooter';
import { Application } from '../common/types';

const styles = StyleSheet.create({
  page: {
    fontFamily: FAMILY_REGULAR,
    fontSize: SIZE,
    lineHeight: 1.6,
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 75,
  },
});

export const getPDFTitle = (
  application: Application,
  hasReservations: boolean
): string =>
  `${application.contactPerson?.firstName} ${
    application.contactPerson?.lastName
  } - Paatos - ${
    hasReservations ? 'Myönnetyt vuorot' : 'Ei myönnettyjä vuoroja'
  }`;

// disable hyphenation
Font.registerHyphenationCallback((word) => [word]);

Font.register({
  family: FAMILY_BOLD,
  src: '/static/media/533af26cf28d7660f24c2884d3c27eac.8287fd93.woff',
});

Font.register({
  family: FAMILY_REGULAR,
  src: '/static/media/565d73a693abe0776c801607ac28f0bf.df29a4d1.woff',
});

type Props = {
  application: Application;
  hasReservations: boolean;
  children?: React.ReactNode;
};

export const PDFDocument = ({
  children,
  application,
  hasReservations,
}: Props): JSX.Element => (
  <Document
    title={getPDFTitle(application, hasReservations)}
    author="Helsingin kaupunki"
    language="fi">
    {children}
  </Document>
);

export const PDFPage = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => (
  <Page wrap size="A4" style={styles.page}>
    <PageHeader />
    <View style={styles.section} wrap>
      {children}
    </View>
    <PageFooter />
  </Page>
);
