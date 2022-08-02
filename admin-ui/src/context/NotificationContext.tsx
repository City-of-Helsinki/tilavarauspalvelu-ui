import React, { useContext } from "react";

export type NotificationContextProps = {
  notification: NotificationType | null;
  setNotification: (notification: NotificationType) => void;
  notifyError: (
    title: string,
    message?: string,
    options?: NotificationOptions
  ) => void;
  notifySuccess: (
    title: string,
    message?: string,
    options?: NotificationOptions
  ) => void;
  clearNotification: () => void;
};

export type NotificationType = {
  title: string | null;
  message: string | null;
  type: "error" | "success";
  options?: NotificationOptions;
};

export const NotificationContext =
  React.createContext<NotificationContextProps>({
    notification: null,
    setNotification: () => {},
    clearNotification: () => {},
    notifyError: () => {},
    notifySuccess: () => {},
  });

export type NotificationOptions = {
  dismissible?: boolean;
};

export const useNotification = (): NotificationContextProps =>
  useContext(NotificationContext);

export const NotificationContextProvider: React.FC = ({ children }) => {
  const [notification, setNotification] =
    React.useState<NotificationType | null>(null);
  const clearNotification = () => setNotification(null);

  const showNotification = (n: NotificationType) => {
    setNotification(n);
    setTimeout(() => setNotification(null), 1000 * 5);
  };

  function notifyError(
    title = "",
    message?: string,
    options?: NotificationOptions
  ) {
    showNotification({
      type: "error",
      title: title || null,
      message: message || null,
      options,
    });
  }

  function notifySuccess(
    title = "",
    message?: string,
    options?: NotificationOptions
  ) {
    showNotification({
      type: "success",
      title: title || null,
      message: message || null,
      options,
    });
  }

  return (
    <NotificationContext.Provider
      value={{
        notification,
        setNotification: showNotification,
        clearNotification,
        notifyError,
        notifySuccess,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
