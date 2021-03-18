import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ReservationUnit } from '../common/types';
import { localizedValue } from '../common/util';

type Props = {
  units: ReservationUnit[];
};

const Heading = styled.div`
  font-size: var(--fontsize-heading-m);
  font-family: var(--font-bold);
`;

const Container = styled.div``;

const Unit = styled.div``;
const Name = styled.div`
  font-family: var(--font-bold);
`;

const Building = styled.div`
  font-size: var(--fontsize-body-m);
`;

const Grid = styled.div`
  margin-top: var(--spacing-layout-s);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-s);
`;

const RelatedUnits = ({ units }: Props): JSX.Element | null => {
  const { t, i18n } = useTranslation();

  if (units.length === 0) {
    return null;
  }
  return (
    <Container>
      <Heading>{t('ReservationUnit.RelatedUnits.heading')}</Heading>
      <Grid>
        {units.slice(0, 3).map((unit) => (
          <Unit>
            <Name>{localizedValue(unit.name, i18n.language)}</Name>
            <Building>{unit.building.name}</Building>
          </Unit>
        ))}
      </Grid>
    </Container>
  );
};

export default RelatedUnits;
