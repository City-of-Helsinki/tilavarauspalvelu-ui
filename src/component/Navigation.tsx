import React, { SyntheticEvent, useEffect } from 'react';
import { Navigation as HDSNavigation } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from 'react-use';
import { useReactOidc } from '@axa-fr/react-oidc-context';
import { Profile } from 'oidc-client';
import { useHistory } from 'react-router-dom';
import { applicationsUrl } from '../common/util';
import { authEnabled } from '../common/const';

interface LanguageOption {
  label: string;
  value: string;
}

const languageOptions: LanguageOption[] = [
  { label: 'Suomeksi', value: 'fi' },
  { label: 'Svenska', value: 'sv' },
  { label: 'English', value: 'en' },
];

const DEFAULT_LANGUAGE = 'fi';

type Props = {
  profile: Profile | null;
  logout?: () => void;
};

const Navigation = ({ profile, logout }: Props): JSX.Element => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const [language, setLanguage] = useLocalStorage<string>(
    'userLocale',
    i18n.language
  );

  const formatSelectedValue = (lang = DEFAULT_LANGUAGE): string =>
    lang.toUpperCase();

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return (
    <HDSNavigation
      theme={{
        '--header-background-color':
          'var(--tilavaraus-header-background-color)',
        '--header-color': 'var(--tilavaraus-header-color)',
      }}
      title={t('common.applicationName')}
      menuToggleAriaLabel="Menu"
      skipTo="#main"
      skipToContentLabel={t('Navigation.skipToMainContent')}>
      <HDSNavigation.Row variant="inline">
        <HDSNavigation.Item
          href="#"
          label={t('Navigation.Item.spaceReservation')}
          onClick={(e: SyntheticEvent) => e.preventDefault()}
          active
        />
      </HDSNavigation.Row>
      <HDSNavigation.Actions>
        <HDSNavigation.User
          userName={`${profile?.given_name} ${profile?.family_name}`}
          authenticated={Boolean(profile)}
          label={t('common.login')}
          buttonAriaLabel={t('common.login')}
          onSignIn={() => {
            history.push(applicationsUrl);
          }}>
          <HDSNavigation.Item
            label={t('common.logout')}
            onClick={() => logout && logout()}
          />
        </HDSNavigation.User>
        <HDSNavigation.LanguageSelector label={formatSelectedValue(language)}>
          {languageOptions.map((languageOption) => (
            <HDSNavigation.Item
              key={languageOption.value}
              label={languageOption.label}
              onClick={(
                e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
              ): void => {
                e.preventDefault();
                setLanguage(languageOption.value);
              }}
            />
          ))}
        </HDSNavigation.LanguageSelector>
      </HDSNavigation.Actions>
    </HDSNavigation>
  );
};

const NavigationWithProfileAndLogout = authEnabled
  ? () => {
      const { oidcUser, logout } = useReactOidc();
      let profile = null;
      if (oidcUser) {
        profile = oidcUser.profile;
      }
      return <Navigation profile={profile} logout={() => logout()} />;
    }
  : () => <Navigation profile={null} />;

export default NavigationWithProfileAndLogout;
