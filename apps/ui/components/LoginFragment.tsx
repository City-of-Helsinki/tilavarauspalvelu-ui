import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { breakpoints } from "common/src/common/style";
import { signIn } from "common/src/browserHelpers";
import { useSession } from "@/hooks/auth";
import { MediumButton } from "@/styles/util";

type Props = {
  apiBaseUrl: string;
  text?: string;
  componentIfAuthenticated?: React.ReactNode;
  isActionDisabled?: boolean;
  actionCallback?: () => void;
  returnUrl?: string;
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  flex-direction: column;
  gap: var(--spacing-xs);

  button {
    width: 100%;
  }

  @media (min-width: ${breakpoints.s}) {
    flex-direction: row;
    justify-content: flex-start;
    text-align: left;
    gap: var(--spacing-m);

    button {
      width: auto;
    }
  }
`;

const SubmitButton = styled(MediumButton)`
  white-space: nowrap;

  > span {
    margin: 0 !important;
    padding-right: var(--spacing-3-xs);
    padding-left: var(--spacing-3-xs);
  }
`;

const LoginFragment = ({
  apiBaseUrl,
  text,
  componentIfAuthenticated,
  isActionDisabled,
  actionCallback,
  returnUrl,
}: Props): JSX.Element | null => {
  // TODO pass the isAuthenticated from SSR and remove the hook
  const { isAuthenticated } = useSession();
  const { t } = useTranslation();

  return !isAuthenticated ? (
    <Wrapper>
      <SubmitButton
        onClick={() => {
          if (actionCallback) {
            actionCallback();
          }
          if (returnUrl) {
            signIn(apiBaseUrl, returnUrl);
            return;
          }
          signIn(apiBaseUrl);
        }}
        aria-label={t("reservationCalendar:loginAndReserve")}
        className="login-fragment__button--login"
        disabled={isActionDisabled}
      >
        {t("reservationCalendar:loginAndReserve")}
      </SubmitButton>
      {text}
    </Wrapper>
  ) : (
    <Wrapper>{componentIfAuthenticated}</Wrapper>
  );
};

export default LoginFragment;
