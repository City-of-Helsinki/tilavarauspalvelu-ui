// eslint-disable-next-line import/no-unresolved
import { useOidc, useOidcUser } from "@axa-fr/react-oidc-context";

export type RenderPropsType = { profile: unknown; logout: () => void };
type Props = { render: (props: RenderPropsType) => JSX.Element };

const WithOidc = ({ render }: Props): JSX.Element => {
  const { oidcUser } = useOidcUser();
  const { logout } = useOidc();
  let profile = null;
  if (oidcUser) {
    profile = oidcUser.profile;
  }
  return render({ profile, logout });
};

export default WithOidc;
