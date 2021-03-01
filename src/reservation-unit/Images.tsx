import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Image } from '../common/types';

type Props = {
  images: Image[];
};

const Name = styled.div`
  font-size: var(--fontsize-heading-m);
  font-family: var(--font-bold);
`;

const Container = styled.div`
  margin-top: var(--spacing-layout-m);
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-s);
`;

const ThumbnailImage = styled.img`
  margin-top: var(--spacing-layout-s);
`;

const Images = ({ images }: Props): JSX.Element | null => {
  const { t } = useTranslation();

  return (
    <Container>
      <Name>{t('reservationUnit.images')}</Name>
      <ImageGrid>
        {images.map((image) => (
          <ThumbnailImage alt="Tila kuvasta" src={image.imageUrl} />
        ))}
      </ImageGrid>
    </Container>
  );
};

export default Images;
