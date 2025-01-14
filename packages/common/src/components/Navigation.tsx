import { css } from "styled-components";

export const headerCss = css<{ $isAdmin?: boolean }>`
  --actionbar-background-color: ${({ $isAdmin }) => (!$isAdmin ? "var(--color-white)" : "var(--color-bus-dark)")};

  --notification-bubble-background-color: var(
    --tilavaraus-admin-handling-count-color
  );

  /* set the color for only the header, not the rest of the mobile menu */
  [class^="HeaderActionBar-module_headerActionBar__"] {
    --header-color: ${({ $isAdmin }) => (!$isAdmin ? "var(--color-black)" : "var(--color-white)")};
    --action-bar-item-title-font-color: ${({ $isAdmin }) => (!$isAdmin ? "var(--color-black)" : "var(--color-white)")};

    /* skip user menu popover */
    & #user-menu-dropdown {
      --action-bar-item-title-font-color: var(--color-black);
      --header-color: var(--color-black);
    }
  }

  /* retain text-decoration: underline on the plain text in navigation items, but disable it in the notificationBubble */
  [class^="HeaderNavigationMenu-module_headerNavigationMenuLinkContent__"]:hover,
  [class^="HeaderNavigationMenu-module_headerNavigationMenuLinkContent__"]:focus-within {
    a {
      text-decoration: none;
      span {
        text-decoration: underline;
      }
      [class^="HeaderActionBarSubItem-module_notificationBubble__"] {
        text-decoration: none;
      }
    }
  }
`;
/* OLD
  // remove extra padding from mobile menu links
  &&& {
    ul li span {
      box-sizing: border-box;
    }
    a {
      padding: 0;
    }
  }


  @media (min-width: ${breakpoints.l}) {
    [class*="module_headerNavigationMenuContainer__"] li {
      a {
        margin: 0;
        &:focus {
          text-decoration: underline;
        }
      }

      span:has(.active) {
        // using box-shadow for a bottom border inside of the element, without affecting text positioning
        box-shadow: 0 -4px 0 0 var(--color-black) inset;
        font-weight: bold;
      }
    }
  }

  #user-menu-dropdown {
    button,
    span,
    div {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    ul {
      display: flex;
      flex-direction: column;

      > * {
        display: flex;
        background: transparent;
        border: 0;
        justify-content: space-between;
        border-bottom: 1px solid var(--color-black-20);
        transition: background 0.2s;
        &:hover {
          background: var(--color-black-10);
          cursor: pointer;
          text-decoration: underline;
        }
      }
    }
  }

  #hds-mobile-menu {
    #user-menu * {
      box-sizing: border-box;
      button {
        padding-inline: var(--spacing-s);
      }
    }

    ul > li {
      > span {
        box-sizing: border-box;
        padding: var(--spacing-s);
        li {
          width: 100%;
          font-size: var(--fontsize-body-xl);
        }
        .active {
          font-weight: bold;
        }
      }

      // hide the big link to frontpage which HDS adds by default
      &:first-child {
        display: none;
      }
    }
  }
*/
