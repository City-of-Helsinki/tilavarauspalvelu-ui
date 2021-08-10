import React from "react";
import { Button, IconSignin } from "hds-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { breakpoint } from "../modules/style";
import { isBrowser } from "../modules/const";
import { UserProfile } from "../modules/types";
import RequireAuthentication from "./common/RequireAuthentication";

type Props = {
  text?: string;
  setIsAuthenticated?: (isAuthenticated: boolean) => void;
};

const Wrapper = styled.div`
  display: flex;
  margin-bottom: var(--spacing-xl);
  align-items: center;
  text-align: center;
  flex-direction: column;
  gap: var(--spacing-xs);

  button {
    width: 100%;
  }

  @media (min-width: ${breakpoint.s}) {
    flex-direction: row;
    justify-content: flex-start;
    text-align: left;
    gap: var(--spacing-m);

    button {
      width: 10em;
    }
  }
`;

const LoginFragment = ({ text, setIsAuthenticated }: Props): JSX.Element => {
  const { t } = useTranslation();

  const [shouldLogin, setShouldLogin] = React.useState(false);

  if (shouldLogin) {
    return (
      <RequireAuthentication>
        <div />
      </RequireAuthentication>
    );
  }

  if (!isBrowser) {
    return null;
  }

  const WithOidc = require("./common/WithOidc").default;

  return (
    <WithOidc
      setIsAuthenticated={setIsAuthenticated}
      render={(props: { profile: UserProfile | null }) => {
        setIsAuthenticated(props.profile !== null);

        return !props.profile ? (
          <Wrapper>
            <Button
              iconLeft={<IconSignin />}
              onClick={() => setShouldLogin(true)}
              aria-label={t("common:login")}
            >
              {t("common:login")}
            </Button>
            {text}
          </Wrapper>
        ) : null;
      }}
    />
  );
};

export default LoginFragment;
