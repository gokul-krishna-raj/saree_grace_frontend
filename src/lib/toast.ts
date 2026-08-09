import toastLib from "react-hot-toast";

const baseStyle = {
  borderRadius: "8px",
  background: "#3A1218",
  color: "#FAF6F0",
};

export const toast = {
  success: (message: string) =>
    toastLib.success(message, {
      style: baseStyle,
      iconTheme: { primary: "#D9A94A", secondary: "#3A1218" },
    }),
  error: (message: string) =>
    toastLib.error(message, {
      style: baseStyle,
      iconTheme: { primary: "#E19AA5", secondary: "#3A1218" },
    }),
  info: (message: string) => toastLib(message, { style: baseStyle }),
};
