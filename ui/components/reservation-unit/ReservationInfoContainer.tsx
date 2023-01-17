import { formatSecondDuration } from "common/src/common/util";
import { ReservationUnitByPkType } from "common/types/gql-types";
import React, { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { daysByMonths } from "../../modules/const";
import { formatDate } from "../../modules/util";
import { Content, Subheading } from "./ReservationUnitStyles";

type Props = {
  reservationUnit: ReservationUnitByPkType;
  isReservable: boolean;
};

const ReservationInfoContainer = ({
  reservationUnit,
  isReservable,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  const reservationStatus = useMemo(() => {
    const now = new Date().toISOString();
    const { reservationBegins, reservationEnds } = reservationUnit;

    if (reservationEnds && reservationEnds < now) {
      return "hasClosed";
    }

    if (reservationBegins && reservationBegins > now) {
      return "willOpen";
    }

    if (reservationBegins && reservationBegins < now) {
      if (reservationEnds) return "isOpen";
    }

    return null;
  }, [reservationUnit]);

  const reservationUnitIsReservableAndHasReservationBuffers =
    isReservable &&
    (reservationUnit.reservationsMaxDaysBefore ||
      reservationUnit.reservationsMinDaysBefore);

  return (
    (isReservable || reservationStatus === "hasClosed") && (
      <>
        <Subheading $withBorder>
          {t("reservationCalendar:reservationInfo")}
        </Subheading>
        <Content data-testid="reservation-unit__reservation-info">
          {reservationUnitIsReservableAndHasReservationBuffers && (
            <p>
              {reservationUnit.reservationsMaxDaysBefore > 0 &&
                reservationUnit.reservationsMinDaysBefore > 0 && (
                  <Trans i18nKey="reservationUnit:reservationInfo1-1">
                    Voit tehdä varauksen{" "}
                    <strong>
                      aikaisintaan{" "}
                      {{
                        reservationsMaxDaysBefore: daysByMonths.find(
                          (n) =>
                            n.value ===
                            reservationUnit.reservationsMaxDaysBefore
                        )?.label,
                      }}
                      {{
                        unit: t(
                          `reservationUnit:reservationInfo1-${
                            reservationUnit.reservationsMaxDaysBefore === 14
                              ? "weeks"
                              : "months"
                          }`
                        ),
                      }}
                    </strong>{" "}
                    ja{" "}
                    <strong>
                      viimeistään
                      {{
                        reservationsMinDaysBefore:
                          reservationUnit.reservationsMinDaysBefore,
                      }}{" "}
                      päivää etukäteen
                    </strong>
                    .
                  </Trans>
                )}
              {reservationUnit.reservationsMaxDaysBefore > 0 &&
                !reservationUnit.reservationsMinDaysBefore && (
                  <Trans i18nKey="reservationUnit:reservationInfo1-2">
                    Voit tehdä varauksen{" "}
                    <strong>
                      aikaisintaan{" "}
                      {{
                        reservationsMaxDaysBefore: daysByMonths.find(
                          (n) =>
                            n.value ===
                            reservationUnit.reservationsMaxDaysBefore
                        )?.label,
                      }}{" "}
                      {{
                        unit: t(
                          `reservationUnit:reservationInfo1-${
                            reservationUnit.reservationsMaxDaysBefore === 14
                              ? "weeks"
                              : "months"
                          }`
                        ),
                      }}{" "}
                      etukäteen
                    </strong>
                    .
                  </Trans>
                )}
              {reservationUnit.reservationsMaxDaysBefore === 0 &&
                reservationUnit.reservationsMinDaysBefore > 0 && (
                  <Trans i18nKey="reservationUnit:reservationInfo1-3">
                    Voit tehdä varauksen{" "}
                    <strong>
                      viimeistään{" "}
                      {{
                        reservationsMinDaysBefore:
                          reservationUnit.reservationsMinDaysBefore,
                      }}{" "}
                      päivää etukäteen
                    </strong>
                    .
                  </Trans>
                )}
            </p>
          )}
          {reservationStatus === "willOpen" && (
            <p>
              <Trans
                i18nKey="reservationUnit:reservationInfo2-1"
                values={{
                  date: formatDate(
                    reservationUnit.reservationBegins,
                    "d.M.yyyy"
                  ),
                  time: formatDate(reservationUnit.reservationBegins, "H.mm"),
                }}
                defaults="<bold>Varauskalenteri avautuu {{date}} klo {{time}}</bold>."
                components={{ bold: <strong /> }}
              />
            </p>
          )}
          {reservationStatus === "isOpen" && (
            <p>
              <Trans
                i18nKey="reservationUnit:reservationInfo2-2"
                values={{
                  date: formatDate(reservationUnit.reservationEnds, "d.M.yyyy"),
                  time: formatDate(reservationUnit.reservationEnds, "H.mm"),
                }}
                defaults="<bold>Varauskalenteri on auki {{date}} klo {{time}}</bold> asti."
                components={{ bold: <strong /> }}
              />
            </p>
          )}
          {reservationStatus === "hasClosed" && (
            <p>
              <Trans
                i18nKey="reservationUnit:reservationInfo2-3"
                values={{
                  date: formatDate(reservationUnit.reservationEnds, "d.M.yyyy"),
                  time: formatDate(reservationUnit.reservationEnds, "H.mm"),
                }}
                defaults="<bold>Varauskalenteri on sulkeutunut {{date}} klo {{time}}</bold>."
                components={{ bold: <strong /> }}
              />
            </p>
          )}
          {isReservable &&
            reservationUnit.minReservationDuration &&
            reservationUnit.maxReservationDuration && (
              <p>
                <Trans i18nKey="reservationUnit:reservationInfo3">
                  Varauksen keston tulee olla välillä{" "}
                  <strong>
                    {{
                      minReservationDuration: formatSecondDuration(
                        reservationUnit.minReservationDuration,
                        false
                      ),
                    }}
                  </strong>{" "}
                  ja{" "}
                  <strong>
                    {{
                      maxReservationDuration: formatSecondDuration(
                        reservationUnit.maxReservationDuration,
                        false
                      ),
                    }}
                  </strong>
                  .
                </Trans>
              </p>
            )}
          {isReservable && reservationUnit.maxReservationsPerUser && (
            <p>
              <Trans
                i18nKey="reservationUnit:reservationInfo4"
                count={reservationUnit.maxReservationsPerUser}
              >
                Sinulla voi olla samanaikaisesti{" "}
                <strong>
                  enintään {{ count: reservationUnit.maxReservationsPerUser }}{" "}
                  varausta
                </strong>
                .
              </Trans>
            </p>
          )}
        </Content>
      </>
    )
  );
};

export default ReservationInfoContainer;
