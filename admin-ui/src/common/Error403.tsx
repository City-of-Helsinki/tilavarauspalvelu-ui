import { Button, Link } from "hds-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { H1 } from "common/src/common/typography";
import { breakpoints } from "common/src/common/style";
import { useAuthState } from "../context/AuthStateContext";
import { localLogout } from "./auth/util";
import { publicUrl } from "./const";

const Wrapper = styled.div`
  margin: var(--spacing-layout-s);
  word-break: break-word;
  gap: var(--spacing-layout-m);
  h1 {
    margin-bottom: 0;
    font-size: 2.5em;
  }

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));

  @media (min-width: ${breakpoints.l}) {
    margin: var(--spacing-layout-m);
    h1 {
      font-size: 4em;
    }
  }
`;

const Image = styled.img`
  width: 100%;
`;

const ButtonContainer = styled.div`
  margin-top: var(--spacing-s);
`;

const LogoutSection = (): JSX.Element | null => {
  const { authState } = useAuthState();
  const navigate = useNavigate();

  return (
    <>
      <Link external href="/">
        Siirry Varaamon etusivulle
      </Link>
      <Link
        external
        href="https://app.helmet-kirjasto.fi/forms/?site=varaamopalaute&ref=https://tilavaraus.hel.fi/"
      >
        Anna palautetta
      </Link>

      {authState.state !== "NotAutenticated" && (
        <ButtonContainer>
          <Button
            onClick={() => {
              if (authState.logout) {
                authState.logout();
                localLogout();
              } else {
                localLogout();
              }
              navigate("/");
            }}
          >
            Kirjaudu ulos
          </Button>
        </ButtonContainer>
      )}
    </>
  );
};

const Error403 = ({
  showLogoutSection,
}: {
  showLogoutSection?: boolean;
}): JSX.Element => {
  return (
    <Wrapper>
      <div>
        <H1 $legacy>
          403 - Sinulla ei ole käyt&shy;tö&shy;oi&shy;keuk&shy;sia tälle sivulle
        </H1>
        <p>
          Sivu on nähtävillä vain kirjautuneille käyttäjille. Voit nähdä sivun
          sisällön jos kirjaudut sisään ja sinulla on riittävän laajat
          käyttöoikeudet.
        </p>
        {showLogoutSection && <LogoutSection />}
      </div>
      <Image src={`${publicUrl}/403.png`} />
    </Wrapper>
  );
};

export default Error403;
