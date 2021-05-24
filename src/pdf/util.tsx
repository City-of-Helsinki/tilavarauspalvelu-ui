import React from 'react';
import { Application, RecurringReservation, User } from '../common/types';
import NoReservationsDocument from './NoReservationsDocument';
import ReservationsDocument from './ReservationsDocument';
/**
 * This separate function allows bundle splitting so that pdf related libs are loaded only when needed.
 */
export const download = (
  application: Application,
  reservations: RecurringReservation[],
  decisionMaker: User | null,
  setStatus: React.Dispatch<
    React.SetStateAction<'init' | 'loading' | 'done' | 'error'>
  >
): void => {
  if (!decisionMaker) {
    setStatus('error');
    return;
  }
  import('@react-pdf/renderer')
    .then((renderer) => {
      let doc: JSX.Element;
      if (reservations.length) {
        doc = (
          <ReservationsDocument
            decisionMaker={decisionMaker}
            application={application}
            reservations={
              reservations.flatMap((rr) =>
                rr.reservations.map((r) => ({
                  ...r,
                  applicationEventId: rr.applicationEventId,
                }))
              ) || []
            }
          />
        );
      } else {
        doc = (
          <NoReservationsDocument
            decisionMaker={decisionMaker}
            application={application}
          />
        );
      }

      setStatus('loading');
      const blob = renderer.pdf(doc).toBlob();
      blob.then((data) => {
        const element = document.createElement('a');
        element.setAttribute('href', window.URL.createObjectURL(data));
        element.setAttribute('download', 'filename.pdf');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
        setStatus('done');
      });
    })
    .catch(() => {
      setStatus('error');
    });
};
