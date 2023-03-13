import React from "react";
import { Navigation as HDSNavigation } from "hds-react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NavigationMenuItem } from "./NavigationMenuItem";

type MenuItem = {
  title: string;
  path: string;
  condition?: boolean;
};

type Props = {
  menuItems: MenuItem[];
};

const NavigationMenu = ({ menuItems }: Props) => {
  const { t } = useTranslation(["navigation"]);
  const router = useRouter();

  return (
    <HDSNavigation.Row variant="inline">
      {menuItems.map((item) => (
        <NavigationMenuItem
          key={item.title}
          href="#"
          onClick={() =>
            router.push(item.path, item.path, { locale: router.locale })
          }
          className={router.pathname === item.path ? "active" : ""}
        >
          {t(`navigation:Item.${item.title}`)}
        </NavigationMenuItem>
      ))}
    </HDSNavigation.Row>
  );
};

export { NavigationMenu };
export type { MenuItem };
